package org.lamisplus.modules.hts.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.hts.domain.dto.HtsEncounterRequestDTO;
import org.lamisplus.modules.hts.domain.dto.HtsEncounterResponse;
import org.lamisplus.modules.hts.domain.dto.HtsPatientSummaryDto;
import org.lamisplus.modules.hts.domain.dto.PatientHtsSummaryDto;
import org.lamisplus.modules.hts.domain.dto.PatientHtsSummaryProjection;
import org.lamisplus.modules.hts.domain.entity.HtsEncounter;
import org.lamisplus.modules.hts.repository.HtsEncounterRepository;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HtsEncounterService {

    private final HtsEncounterRepository repository;
    private final PersonRepository personRepository;
    private final PersonService personService;
    private final ObjectMapper objectMapper;
    private final CurrentUserOrganizationService currentUserOrganizationService;

    public HtsEncounterResponse save(HtsEncounterRequestDTO request) {
        Person person;
        if (request.getPatientId() != null) {
            person = personRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            Person.class, "id", request.getPatientId().toString()));
        } else {
            if (request.getPerson() == null) {
                throw new IllegalTypeException(
                        HtsEncounterRequestDTO.class, "person",
                        "must be provided when patientId is null");
            }
            PersonResponseDto created = personService.createPerson(request.getPerson());
            person = personRepository.findById(created.getId())
                    .orElseThrow(() -> new IllegalStateException("Person creation failed"));
        }

        // HIV Transfer-In block - checked first, before anything else. Blocks a new HTS
        // record for any patient with an active (archived = 0) Transfer-In record, UNLESS
        // this is a PMTCT record (pmtctHts = true), in which case it's allowed through and
        // permanently flagged via pmtctTransferInPatient below. Regular HTS-module creates
        // remain blocked exactly as before - only pmtctHts = true bypasses this.
        // Matches on both id and uuid now that person is already resolved, widening the
        // match slightly versus the old controller-level check (which only had patientId).
        boolean hasActiveTransferIn = repository.existsActiveHivTransferInForPerson(person.getId(), person.getUuid());
        boolean isPmtctRecord = Boolean.TRUE.equals(request.getPmtctHts());

        if (hasActiveTransferIn && !isPmtctRecord) {
            throw new IllegalTypeException(
                    HtsEncounterRequestDTO.class,
                    "patientId",
                    "This patient has a documented HIV Transfer-In record and cannot have a new HTS record " +
                            "created. Use the ICT form instead.");
        }

        ObjectNode observation = buildObservation(request);

        // Permanent audit marker: this PMTCT record was allowed through despite the
        // patient having an active Transfer-In record. Set once, here, at creation only -
        // update() explicitly carries this key forward untouched on every edit and never
        // lets it be set, changed, or removed by any update request.
        observation.put("pmtctTransferInPatient", hasActiveTransferIn && isPmtctRecord);

        validateHivResultRules(
                person.getId(),
                patientIdentifier(request.getClientCode(), person.getId()),
                observation,
                request.getDateOfVisit(),
                null,
                request.getPmtctHts());

        validateCrossSourceDateOrdering(
                person.getId(),
                patientIdentifier(request.getClientCode(), person.getId()),
                request.getDateOfVisit(),
                request.getPmtctHts(),
                null);

        HtsEncounter encounter = new HtsEncounter();
        encounter.setPerson(person);
        encounter.setPatientUuid(resolveUuid(person.getUuid()));
        encounter.setClientCode(request.getClientCode());
        encounter.setDateOfVisit(request.getDateOfVisit());
        encounter.setSetting(request.getSetting());
        encounter.setFacilityId(resolveFacilityId(request.getFacilityId()));
        encounter.setPmtctHts(request.getPmtctHts() != null ? request.getPmtctHts() : false);
        encounter.setSource(request.getSource() != null ? request.getSource() : "web");
        encounter.setLongitude(request.getLongitude());
        encounter.setLatitude(request.getLatitude());
        encounter.setObservation(observation);

        encounter = repository.save(encounter);
        return toResponse(encounter);
    }

    public HtsEncounterResponse update(Long id, HtsEncounterRequestDTO request) {
        HtsEncounter existing = repository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(
                        HtsEncounter.class, "id", id.toString()));

        if (request.getClientCode() != null)
            existing.setClientCode(request.getClientCode());
        if (request.getDateOfVisit() != null)
            existing.setDateOfVisit(request.getDateOfVisit());
        if (request.getSetting() != null)
            existing.setSetting(request.getSetting());
        if (request.getFacilityId() != null)
            existing.setFacilityId(resolveFacilityId(request.getFacilityId()));
        if (request.getPmtctHts() != null)
            existing.setPmtctHts(request.getPmtctHts());
        if (request.getSource() != null)
            existing.setSource(request.getSource());
        if (request.getLongitude() != null)
            existing.setLongitude(request.getLongitude());
        if (request.getLatitude() != null)
            existing.setLatitude(request.getLatitude());

        ObjectNode observation = buildObservation(request);

        // pmtctTransferInPatient is permanent once set at creation and must never change on
        // an update, in either direction - buildObservation() only builds from the incoming
        // request (which has no field for this key at all, so it could never set it anyway),
        // so without this it would simply be dropped by the wholesale observation replace
        // below. Carry it forward from the existing record exactly as-is, ignoring the
        // incoming request entirely for this one key.
        JsonNode existingObservation = existing.getObservation();
        if (existingObservation != null && existingObservation.has("pmtctTransferInPatient")) {
            observation.set("pmtctTransferInPatient", existingObservation.get("pmtctTransferInPatient"));
        }

        LocalDate incomingDateOfVisit = request.getDateOfVisit() != null
                ? request.getDateOfVisit()
                : existing.getDateOfVisit();
        String clientCode = request.getClientCode() != null
                ? request.getClientCode()
                : existing.getClientCode();

        validateHivResultRules(
                existing.getPerson().getId(),
                patientIdentifier(clientCode, existing.getPerson().getId()),
                observation,
                incomingDateOfVisit,
                id,
                existing.getPmtctHts());

        validateCrossSourceDateOrdering(
                existing.getPerson().getId(),
                patientIdentifier(clientCode, existing.getPerson().getId()),
                incomingDateOfVisit,
                existing.getPmtctHts(),
                id);

        existing.setObservation(observation);

        existing = repository.save(existing);
        return toResponse(existing);
    }

    /**
     * Called by the HIV module when a viral load result of >= 1000 comes back for a
     * patient, to flag their most recent HTS encounter as a postive.
     * Only the finalHivTestResult key inside the observation JSON is touched; every
     * other observation field on the record, and hts_ict_encounter, are left alone.
     */
    public HtsEncounterResponse markAcuteHivInfection(Long id) {
        return updateFinalHivTestResult(id, "Positive");
    }

    /**
     * Called by the HIV module when a viral load result of < 1000 comes back for a
     * patient, to flag their most recent HTS encounter as negative. Only the
     * finalHivTestResult key inside the observation JSON is touched; every other
     * observation field on the record, and hts_ict_encounter, are left alone.
     */
    public HtsEncounterResponse markNegative(Long id) {
        return updateFinalHivTestResult(id, "Negative");
    }

    private HtsEncounterResponse updateFinalHivTestResult(Long id, String finalHivTestResult) {
        HtsEncounter existing = repository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(
                        HtsEncounter.class, "id", id.toString()));

        JsonNode current = existing.getObservation();
        ObjectNode obs = (current != null && current.isObject())
                ? (ObjectNode) current
                : objectMapper.createObjectNode();

        obs.put("finalHivTestResult", finalHivTestResult);

        validateHivResultRules(
                existing.getPerson().getId(),
                patientIdentifier(existing.getClientCode(), existing.getPerson().getId()),
                obs,
                existing.getDateOfVisit(),
                id,
                existing.getPmtctHts());

        existing.setObservation(obs);

        existing = repository.save(existing);
        return toResponse(existing);
    }

    public HtsEncounterResponse getById(Long id) {
        HtsEncounter encounter = repository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(
                        HtsEncounter.class, "id", id.toString()));
        return toResponse(encounter);
    }

    public Page<HtsEncounterResponse> search(Long facilityId, String search, Pageable pageable) {
        String searchParam = (search == null || search.equals("*")) ? null : "%" + search + "%";
        return repository.search(facilityId, searchParam, pageable).map(this::toResponse);
    }

    public HtsEncounterResponse getForProphylaxis(LocalDate screeningDate, String patientUuid) {
        HtsEncounter encounter = repository
                .findFirstByPatientUuidAndDateOfVisitAndArchivedOrderByIdDesc(patientUuid, screeningDate, false)
                .orElseThrow(() -> new EntityNotFoundException(
                        HtsEncounter.class,
                        "patientUuid/dateOfVisit",
                        patientUuid + "/" + screeningDate));
        return toResponse(encounter);
    }

    public List<HtsEncounterResponse> getEncountersByPatientId(Long patientId) {
        personRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException(
                        Person.class, "id", patientId.toString()));
        return repository
                .findByPerson_IdAndArchivedOrderByDateOfVisitDesc(patientId, false)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        HtsEncounter encounter = repository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(
                        HtsEncounter.class, "id", id.toString()));
        encounter.setArchived(true);
        repository.save(encounter);
    }

    public Page<PatientHtsSummaryDto> getPatientSummaries(Long facilityId, String search, Pageable pageable) {
        String searchParam = (search == null || search.trim().isEmpty() || search.equals("*"))
                ? null
                : "%" + search.trim() + "%";
        Page<PatientHtsSummaryProjection> page = repository.findPatientSummaries(facilityId, searchParam, pageable);
        return page.map(proj -> new PatientHtsSummaryDto(
                proj.getPersonId(),
                proj.getFirstName(),
                proj.getSurname(),
                proj.getOtherName(),
                proj.getHospitalNumber(),
                proj.getEncounterCount()));
    }

    public Page<HtsPatientSummaryDto> getHtsPatientSummaries(String search, Pageable pageable) {
        String searchParam = (search == null || search.trim().isEmpty() || search.equals("*"))
                ? null
                : "%" + search.trim() + "%";

        Pageable pageableWithoutSort = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize());
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();

        Page<Object[]> raw = repository.findHtsPatientSummariesOptimized(facilityId, searchParam, pageableWithoutSort);

        return raw.map(row -> {
            HtsPatientSummaryDto dto = new HtsPatientSummaryDto();

            dto.setId(toLong(row[0]));

            dto.setUuid(row[1].toString());

            Long personId = toLong(row[2]);
            dto.setPersonId(personId);

            dto.setClientCode(row[3].toString());

            if (row[4] != null) {
                dto.setDateOfVisit(row[4] instanceof LocalDate
                        ? (LocalDate) row[4]
                        : LocalDate.parse(row[4].toString()));
            }

            dto.setSetting(row[5] != null ? row[5].toString() : null);

            // row[6] = observation (Hibernate returns JSONB as String in native queries)
            if (row[6] != null) {
                try {
                    dto.setObservation(objectMapper.readTree(row[6].toString()));
                } catch (Exception e) {
                }
            }

            dto.setFacilityId(toLong(row[7]));

            dto.setHtsCount(toLong(row[8]));

            dto.setIctCount(toLong(row[9]));

            if (personId != null && personId > 0) {
                personRepository.findById(personId)
                        .ifPresent(person -> dto.setPerson(personService.getDtoFromPerson(person)));
            }

            return dto;
        });
    }

    private ObjectNode buildObservation(HtsEncounterRequestDTO r) {
        ObjectNode obs = objectMapper.createObjectNode();

        // Visit / Setting
        putStr(obs, "facilityName", r.getFacilityName());
        putStr(obs, "facilitySetting", r.getFacilitySetting());
        putStr(obs, "communityEntryPoint", r.getCommunityEntryPoint());
        putStr(obs, "typeOfSession", r.getTypeOfSession());
        putStr(obs, "htsPopulationType", r.getHtsPopulationType());
        putStr(obs, "indexTesting", r.getIndexTesting());
        putStr(obs, "indexRelationship", r.getIndexRelationship());
        putStr(obs, "indexClientCode", r.getIndexClientCode());

        if (r.getNumberOfWives() != null)
            obs.put("numberOfWives", r.getNumberOfWives());
        if (r.getNumberOfCoWives() != null)
            obs.put("numberOfCoWives", r.getNumberOfCoWives());
        if (r.getNumberOfBiologicalChildren() != null)
            obs.put("numberOfBiologicalChildren", r.getNumberOfBiologicalChildren());
        putStr(obs, "pregnancyStatus", r.getPregnancyStatus());
        putStr(obs, "breastfeedingDuration", r.getBreastfeedingDuration());
        putStr(obs, "modality", r.getModality());

        // Knowledge Assessment
        putStr(obs, "previouslyTestedNegative", r.getPreviouslyTestedNegative());
        putStr(obs, "timeOfLastNegativeTest", r.getTimeOfLastNegativeTest());
        putStr(obs, "clientInformedTransmissionRoutes", r.getClientInformedTransmissionRoutes());
        putStr(obs, "clientInformedRiskFactors", r.getClientInformedRiskFactors());
        putStr(obs, "clientInformedPreventionMethods", r.getClientInformedPreventionMethods());
        putStr(obs, "clientInformedPossibleResults", r.getClientInformedPossibleResults());
        putStr(obs, "informedConsentGiven", r.getInformedConsentGiven());

        // Personal HIV Risk
        putStr(obs, "everHadSexualIntercourse", r.getEverHadSexualIntercourse());
        putStr(obs, "moreThanOneSexPartner", r.getMoreThanOneSexPartner());
        putStr(obs, "unprotectedVaginalSex", r.getUnprotectedVaginalSex());
        putStr(obs, "unprotectedAnalSex", r.getUnprotectedAnalSex());
        putStr(obs, "bloodTransfusionLast3Months", r.getBloodTransfusionLast3Months());
        putStr(obs, "sexUnderInfluence", r.getSexUnderInfluence());
        putStr(obs, "historyOfSTI", r.getHistoryOfSTI());

        // TB Screening
        putStr(obs, "currentCough", r.getCurrentCough());
        putStr(obs, "weightLoss", r.getWeightLoss());
        putStr(obs, "fever", r.getFever());
        putStr(obs, "nightSweats", r.getNightSweats());

        // STI Screening
        putStr(obs, "complaintsVaginalDischarge", r.getComplaintsVaginalDischarge());
        putStr(obs, "complaintsLowerAbdominalPain", r.getComplaintsLowerAbdominalPain());
        putStr(obs, "complaintsUrethralDischarge", r.getComplaintsUrethralDischarge());
        putStr(obs, "complaintsScroralSwelling", r.getComplaintsScroralSwelling());
        putStr(obs, "complaintsGenitalSores", r.getComplaintsGenitalSores());
        putStr(obs, "complaintsSwollenLymphNodes", r.getComplaintsSwollenLymphNodes());

        // Sex Partner Risk
        putStr(obs, "partnerNewlyDiagnosed", r.getPartnerNewlyDiagnosed());
        putStr(obs, "partnerPregnantOnArv", r.getPartnerPregnantOnArv());
        putStr(obs, "adolescentHivPositive", r.getAdolescentHivPositive());
        putStr(obs, "partnerNotRegularlyOnDrugs", r.getPartnerNotRegularlyOnDrugs());
        putStr(obs, "partnerRecentlyReturnedToTreatment", r.getPartnerRecentlyReturnedToTreatment());
        putStr(obs, "hadSexWithHivPositivePartnerInRiskGroup", r.getHadSexWithHivPositivePartnerInRiskGroup());

        // Diagnostic Testing
        putStr(obs, "typeOfHivTestDone", r.getTypeOfHivTestDone());
        putStr(obs, "hivEarlyDetectResult", r.getHivEarlyDetectResult());
        putStr(obs, "initialHivTest", r.getInitialHivTest());
        putStr(obs, "suspectedAcuteInfection", r.getSuspectedAcuteInfection());
        putStr(obs, "confirmatoryHivTest", r.getConfirmatoryHivTest());
        putStr(obs, "finalHivTestResult", r.getFinalHivTestResult());
        putStr(obs, "dateOfFinalHivTestDone", r.getDateOfFinalHivTestDone());
        putStr(obs, "syphilisTestResult", r.getSyphilisTestResult());
        putStr(obs, "recencyTest", r.getRecencyTest());

        // Post-Test Counselling
        putStr(obs, "previouslyTestedThisYear", r.getPreviouslyTestedThisYear());
        putStr(obs, "clientReceivedTestResult", r.getClientReceivedTestResult());
        putStr(obs, "hivTestKitsProvided", r.getHivTestKitsProvided());
        putStr(obs, "categoryOfClients", r.getCategoryOfClients());
        if (r.getNumberOfHivstKitDistributed() != null)
            obs.put("numberOfHivstKitDistributed", r.getNumberOfHivstKitDistributed());
        putStr(obs, "acceptedIndexTesting", r.getAcceptedIndexTesting());
        putStr(obs, "providedFpInfo", r.getProvidedFpInfo());
        putStr(obs, "clientPartnerUseFpMethods", r.getClientPartnerUseFpMethods());
        putStr(obs, "clientPartnerUseCondoms", r.getClientPartnerUseCondoms());
        putStr(obs, "correctCondomUseDemonstrated", r.getCorrectCondomUseDemonstrated());
        putStr(obs, "condomsProvided", r.getCondomsProvided());
        putStr(obs, "clientReferredToOtherServices", r.getClientReferredToOtherServices());
        putStr(obs, "completedBy", r.getCompletedBy());
        putStr(obs, "designation", r.getDesignation());
        putStr(obs, "previouslyKnownHivPositive", r.getPreviouslyKnownHivPositive());
        putStr(obs, "dateOfPreviouslyKnown", r.getDateOfPreviouslyKnown());

        // ---- PMTCT-only fields below - all optional, HTS itself never sends these ----
        putStr(obs, "pmtctCycleUuid", r.getPmtctCycleUuid());
        putStr(obs, "testingType", r.getTestingType());
        putStr(obs, "pmtctTestEntryPoint", r.getPmtctTestEntryPoint());
        putStr(obs, "testEntryPoint", r.getTestEntryPoint());
        putStr(obs, "testSetting", r.getTestSetting());
        putStr(obs, "stageOfPregnancy", r.getStageOfPregnancy());
        putStr(obs, "pregnancyStatusAtEntry", r.getPregnancyStatusAtEntry());
        putStr(obs, "hospitalNumber", r.getHospitalNumber());
        putStr(obs, "enrolledOnArt", r.getEnrolledOnArt());
        putStr(obs, "initiatedOnProphylaxis", r.getInitiatedOnProphylaxis());
        putStr(obs, "viralLoadMonitoring", r.getViralLoadMonitoring());
        putStr(obs, "hivEarlyDetectViralLoad", r.getHivEarlyDetectViralLoad());
        putStr(obs, "confirmatoryFromSpokes", r.getConfirmatoryFromSpokes());
        putStr(obs, "tbScreeningStatus", r.getTbScreeningStatus());
        putStr(obs, "tbReferred", r.getTbReferred());
        putStr(obs, "hepatitisC", r.getHepatitisC());
        putStr(obs, "dateoffinalHivTestResult", r.getDateoffinalHivTestResult());
        putObject(obs, "syphilisInfo", r.getSyphilisInfo());
        putObject(obs, "hbvInfo", r.getHbvInfo());
        putObject(obs, "partnerInfo", r.getPartnerInfo());

        return obs;
    }

    // Resolves facilityId for create/update: always tries the current logged-in user's own
    // organization first (authoritative, server-derived), and only falls back to whatever
    // the client sent in the request if that derivation fails for any reason (throws, or
    // returns null - e.g. a service/API caller whose token has no interactive-session
    // organization context to resolve). Existing callers who already send facilityId keep
    // working exactly as before in the common case, since the derived and sent values
    // typically match; this only changes behavior when they'd otherwise disagree.
    private Long resolveFacilityId(Long clientProvidedFacilityId) {
        try {
            Long derived = currentUserOrganizationService.getCurrentUserOrganization();
            if (derived != null) {
                return derived;
            }
        } catch (Exception e) {
//            log.warn("Failed to derive facilityId from currentUserOrganizationService, " +
//                            "falling back to client-provided facilityId ({}): {}",
//                    clientProvidedFacilityId, e.getMessage());
        }
        return clientProvidedFacilityId;
    }

    private void putStr(ObjectNode node, String key, String value) {
        if (value != null)
            node.put(key, value);
    }

    // Mirrors putStr's null-skip behavior for the three PMTCT nested objects (syphilisInfo,
    // hbvInfo, partnerInfo) - if the block itself wasn't sent, no key is written at all
    // (never an empty {}), matching how every other optional field here behaves.
    private void putObject(ObjectNode node, String key, Object nestedDto) {
        if (nestedDto != null) {
            node.set(key, objectMapper.valueToTree(nestedDto));
        }
    }

    // ------------------------------------------------------------------
    // HIV result business rules
    //
    // Rule 1 (absolute, cross-facility): a patient can never have more than
    // one active (non-archived) HTS encounter whose finalHivTestResult or
    // confirmatoryHivTest is positive - regardless of dateOfVisit ordering.
    // "Positive" (set by markAcuteHivInfection) is treated as a
    // positive-equivalent result for this rule, since it represents a
    // confirmed HIV-positive status ahead of full seroconversion.
    //
    // Rule 2 (absolute, cross-facility): if the incoming encounter's result
    // is negative and the patient already has another active negative
    // encounter, the two dateOfVisit values must be at least 90 days apart.
    // The closest existing negative encounter (by day gap) is used for the
    // check and for the error message, since it is always the tightest
    // constraint.
    //
    // Both rules look across ALL facilities for the patient (HIV status is
    // a patient-level fact, not a facility-level one) and exclude the
    // encounter currently being edited from the comparison set.
    // ------------------------------------------------------------------

    private static final String POSITIVE_MARKER = "POSITIVE";
    private static final String NEGATIVE_MARKER = "NEGATIVE";
    private static final String ACUTE_INFECTION_RESULT = "Positive";
    private static final long MIN_DAYS_BETWEEN_NEGATIVE_RESULTS = 90;
    private static final long MIN_DAYS_BETWEEN_NEGATIVE_RESULTS_PMTCT = 30;

    // Exception to the "one active positive result" rule (Rule 1 only - the 90-day
    // negative-result spacing rule is unaffected): PMTCT sends HTS records for clients
    // whose positive status was already known before this encounter, and needs to be
    // able to record that even when the patient already has another active positive HTS
    // result on file. Requires BOTH pmtctHts=true AND previouslyKnownHivPositive containing
    // "yes" (case-insensitive) on the record being saved - matched loosely (contains, not
    // exact-equals) so it tolerates either a plain "Yes" or a codeset-style value like
    // "YES_NO_YES" without needing to know which convention the sender uses.
    private boolean isPmtctKnownPositiveException(JsonNode observation, Boolean pmtctHts) {
        if (pmtctHts == null || !pmtctHts) {
            return false;
        }
        if (observation == null) {
            return false;
        }
        JsonNode node = observation.get("previouslyKnownHivPositive");
        if (node == null || node.isNull()) {
            return false;
        }
        return node.asText("").trim().toLowerCase().contains("yes");
    }

    private void validateHivResultRules(
            Long patientId,
            String patientIdentifier,
            JsonNode incomingObservation,
            LocalDate incomingDateOfVisit,
            Long excludeEncounterId,
            Boolean pmtctHts) {

        boolean incomingPositive = isPositiveObservation(incomingObservation);
        boolean incomingNegative = isNegativeObservation(incomingObservation);

        if (!incomingPositive && !incomingNegative) {
            // Result not yet determined either way (e.g. pending/blank) - nothing to enforce.
            return;
        }

        List<HtsEncounter> otherActiveEncounters = repository
                .findByPerson_IdAndArchivedOrderByDateOfVisitDesc(patientId, false)
                .stream()
                .filter(e -> excludeEncounterId == null || !e.getId().equals(excludeEncounterId))
                .collect(Collectors.toList());

        if (incomingPositive && !isPmtctKnownPositiveException(incomingObservation, pmtctHts)) {
            HtsEncounter existingPositive = otherActiveEncounters.stream()
                    .filter(e -> isPositiveObservation(e.getObservation()))
                    .findFirst()
                    .orElse(null);

            if (existingPositive != null) {
                throw new IllegalTypeException(
                        HtsEncounterRequestDTO.class,
                        "finalHivTestResult",
                        String.format(
                                "Cannot save this HTS encounter as a positive result: patient %s already has a " +
                                        "positive HTS result recorded on %s (encounter ID %d, client code '%s'). A patient " +
                                        "cannot have more than one active positive HTS result. If this new result is " +
                                        "correct and the earlier record was entered in error, correct or archive the " +
                                        "earlier encounter first.",
                                patientIdentifier,
                                existingPositive.getDateOfVisit(),
                                existingPositive.getId(),
                                existingPositive.getClientCode()));
            }
        }

        if (incomingNegative && incomingDateOfVisit != null) {
            // PMTCT records get a shorter re-testing window (30 days) than everyone else (90).
            // Determined purely by the INCOMING record's own pmtctHts - not the source of
            // whichever existing negative encounter it's being compared against.
            long minDaysBetweenNegatives = Boolean.TRUE.equals(pmtctHts)
                    ? MIN_DAYS_BETWEEN_NEGATIVE_RESULTS_PMTCT
                    : MIN_DAYS_BETWEEN_NEGATIVE_RESULTS;

            HtsEncounter closestNegative = null;
            long closestGapDays = Long.MAX_VALUE;

            for (HtsEncounter existing : otherActiveEncounters) {
                if (existing.getDateOfVisit() == null || !isNegativeObservation(existing.getObservation())) {
                    continue;
                }
                long gapDays = Math.abs(ChronoUnit.DAYS.between(existing.getDateOfVisit(), incomingDateOfVisit));
                if (gapDays < closestGapDays) {
                    closestGapDays = gapDays;
                    closestNegative = existing;
                }
            }

            if (closestNegative != null && closestGapDays < minDaysBetweenNegatives) {
                throw new IllegalTypeException(
                        HtsEncounterRequestDTO.class,
                        "dateOfVisit",
                        String.format(
                                "Cannot save this HTS encounter as a negative result: patient %s already has a " +
                                        "negative HTS result recorded on %s (encounter ID %d, client code '%s'), which is " +
                                        "only %d day(s) from this encounter's date of visit (%s). Negative HTS results " +
                                        "must be at least %d days apart%s.",
                                patientIdentifier,
                                closestNegative.getDateOfVisit(),
                                closestNegative.getId(),
                                closestNegative.getClientCode(),
                                closestGapDays,
                                incomingDateOfVisit,
                                minDaysBetweenNegatives,
                                Boolean.TRUE.equals(pmtctHts) ? " for PMTCT records" : ""));
            }
        }
    }

    // Rule 3 (absolute, cross-facility, cross-source): a new or edited encounter cannot be
    // dated earlier than the EARLIEST active positive result recorded by the OPPOSITE source
    // (HTS-module vs PMTCT) for the same patient. Fires regardless of the incoming record's
    // own result - positive, negative, or undetermined - since the concern is the backdating
    // itself, contradicting an already-established positive diagnosis from the other module.
    //
    // Deliberately does NOT compare same-source records against each other (an HTS record
    // backdated before another HTS positive, or a PMTCT record before another PMTCT positive)
    // - that overlaps with Rule 1's territory and was explicitly out of scope for this rule.
    //
    // Deliberately kept separate from validateHivResultRules() and NOT called from
    // updateFinalHivTestResult(): that endpoint never changes dateOfVisit, and running this
    // there would risk an already-saved, previously-valid record suddenly failing later
    // (e.g. a viral-load-triggered result update) purely because an unrelated backdated
    // record was created afterward in the other module - an inappropriate side effect for an
    // endpoint that isn't touching the date at all.
    private void validateCrossSourceDateOrdering(
            Long patientId,
            String patientIdentifier,
            LocalDate incomingDateOfVisit,
            Boolean pmtctHts,
            Long excludeEncounterId) {

        if (incomingDateOfVisit == null) {
            return;
        }

        boolean incomingIsPmtct = Boolean.TRUE.equals(pmtctHts);

        HtsEncounter earliestOppositePositive = repository
                .findByPerson_IdAndArchivedOrderByDateOfVisitDesc(patientId, false)
                .stream()
                .filter(e -> excludeEncounterId == null || !e.getId().equals(excludeEncounterId))
                // Only the OPPOSITE source counts here - same-source is Rule 1's territory.
                .filter(e -> Boolean.TRUE.equals(e.getPmtctHts()) != incomingIsPmtct)
                .filter(e -> e.getDateOfVisit() != null)
                .filter(e -> isPositiveObservation(e.getObservation()))
                .min(Comparator.comparing(HtsEncounter::getDateOfVisit))
                .orElse(null);

        if (earliestOppositePositive != null && incomingDateOfVisit.isBefore(earliestOppositePositive.getDateOfVisit())) {
            String thisSourceLabel = incomingIsPmtct ? "PMTCT" : "HTS module";
            String oppositeSourceLabel = incomingIsPmtct ? "HTS module" : "PMTCT module";

            throw new IllegalTypeException(
                    HtsEncounterRequestDTO.class,
                    "dateOfVisit",
                    String.format(
                            "Cannot save this %s encounter with a date of visit of %s: patient %s already has a " +
                                    "positive HIV result documented in the %s on %s (encounter ID %d, client code " +
                                    "'%s'). A new or edited encounter cannot be dated earlier than an " +
                                    "already-documented positive result from the other module.",
                            thisSourceLabel,
                            incomingDateOfVisit,
                            patientIdentifier,
                            oppositeSourceLabel,
                            earliestOppositePositive.getDateOfVisit(),
                            earliestOppositePositive.getId(),
                            earliestOppositePositive.getClientCode()));
        }
    }

    private boolean isPositiveObservation(JsonNode observation) {
        return containsMarker(observation, "finalHivTestResult", POSITIVE_MARKER)
                || containsMarker(observation, "confirmatoryHivTest", POSITIVE_MARKER)
                || matchesExactly(observation, "finalHivTestResult", ACUTE_INFECTION_RESULT);
    }

    private boolean isNegativeObservation(JsonNode observation) {
        return containsMarker(observation, "finalHivTestResult", NEGATIVE_MARKER)
                || containsMarker(observation, "confirmatoryHivTest", NEGATIVE_MARKER);
    }

    private boolean containsMarker(JsonNode observation, String field, String marker) {
        String value = textValue(observation, field);
        return value != null && value.toUpperCase(Locale.ROOT).contains(marker);
    }

    private boolean matchesExactly(JsonNode observation, String field, String expected) {
        String value = textValue(observation, field);
        return value != null && expected.equalsIgnoreCase(value.trim());
    }

    private String textValue(JsonNode observation, String field) {
        if (observation == null) {
            return null;
        }
        JsonNode node = observation.get(field);
        if (node == null || node.isNull()) {
            return null;
        }
        return node.asText("");
    }

    private String patientIdentifier(String clientCode, Long patientId) {
        return String.format("with client code '%s' (patient ID %d)", clientCode, patientId);
    }

    // Relaxed: patient_uuid is stored as varchar to tolerate legacy/migrated data
    // that isn't a strictly well-formed UUID (e.g. "787-KXoSesiSLeE-787"). We no
    // longer call UUID.fromString() here - doing so throws IllegalArgumentException
    // and rejects the whole save/update for records we still need to support.
    private String resolveUuid(Object uuid) {
        if (uuid == null)
            return null;
        return uuid.toString();
    }

    private long toLong(Object val) {
        if (val == null)
            return 0L;
        if (val instanceof Long)
            return (Long) val;
        if (val instanceof BigInteger)
            return ((BigInteger) val).longValue();
        if (val instanceof Integer)
            return ((Integer) val).longValue();
        if (val instanceof Number)
            return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }

    private HtsEncounterResponse toResponse(HtsEncounter entity) {
        HtsEncounterResponse response = new HtsEncounterResponse();
        response.setId(entity.getId());
        response.setUuid(entity.getUuid());
        response.setPatientId(entity.getPerson().getId());
        response.setPatientUuid(entity.getPatientUuid());
        response.setPerson(personService.getDtoFromPerson(entity.getPerson()));
        response.setClientCode(entity.getClientCode());
        response.setDateOfVisit(entity.getDateOfVisit());
        response.setSetting(entity.getSetting());
        response.setObservation(entity.getObservation());
        response.setFacilityId(entity.getFacilityId());
        response.setPmtctHts(entity.getPmtctHts());
        response.setSource(entity.getSource());
        response.setLongitude(entity.getLongitude());
        response.setLatitude(entity.getLatitude());
        return response;
    }
}
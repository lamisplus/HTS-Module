package org.lamisplus.modules.hts.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.hts.domain.dto.HtsEncounterRequest;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HtsEncounterService {

    private final HtsEncounterRepository repository;
    private final PersonRepository personRepository;
    private final PersonService personService;
    private final ObjectMapper objectMapper;

    // ── Create ────────────────────────────────────────────────────────────────

    public HtsEncounterResponse save(HtsEncounterRequest request) {
        Person person;
        if (request.getPatientId() != null) {
            person = personRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            Person.class, "id", request.getPatientId().toString()));
        } else {
            if (request.getPerson() == null) {
                throw new IllegalTypeException(
                        HtsEncounterRequest.class, "person",
                        "must be provided when patientId is null");
            }
            PersonResponseDto created = personService.createPerson(request.getPerson());
            person = personRepository.findById(created.getId())
                    .orElseThrow(() -> new IllegalStateException("Person creation failed"));
        }

        HtsEncounter encounter = new HtsEncounter();
        encounter.setPerson(person);
        encounter.setPatientUuid(resolveUuid(person.getUuid()));
        encounter.setClientCode(request.getClientCode());
        encounter.setDateOfVisit(request.getDateOfVisit());
        encounter.setSetting(request.getSetting());
        encounter.setFacilityId(request.getFacilityId());
        encounter.setPmtctHts(request.getPmtctHts() != null ? request.getPmtctHts() : false);
        encounter.setSource(request.getSource() != null ? request.getSource() : "web");
        encounter.setLongitude(request.getLongitude());
        encounter.setLatitude(request.getLatitude());
        encounter.setObservation(buildObservation(request));

        encounter = repository.save(encounter);
        return toResponse(encounter);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public HtsEncounterResponse update(Long id, HtsEncounterRequest request) {
        HtsEncounter existing = repository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(
                        HtsEncounter.class, "id", id.toString()));

        if (request.getClientCode() != null) existing.setClientCode(request.getClientCode());
        if (request.getDateOfVisit() != null) existing.setDateOfVisit(request.getDateOfVisit());
        if (request.getSetting() != null) existing.setSetting(request.getSetting());
        if (request.getFacilityId() != null) existing.setFacilityId(request.getFacilityId());
        if (request.getPmtctHts() != null) existing.setPmtctHts(request.getPmtctHts());
        if (request.getSource() != null) existing.setSource(request.getSource());
        if (request.getLongitude() != null) existing.setLongitude(request.getLongitude());
        if (request.getLatitude() != null) existing.setLatitude(request.getLatitude());
        existing.setObservation(buildObservation(request));

        existing = repository.save(existing);
        return toResponse(existing);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

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

    public HtsEncounterResponse getForProphylaxis(LocalDate screeningDate, UUID patientUuid) {
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

    // ── Delete ────────────────────────────────────────────────────────────────

    public void delete(Long id) {
        HtsEncounter encounter = repository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(
                        HtsEncounter.class, "id", id.toString()));
        encounter.setArchived(true);
        repository.save(encounter);
    }


    public Page<PatientHtsSummaryDto> getPatientSummaries(Long facilityId, String search, Pageable pageable) {
        String searchParam = (search == null || search.trim().isEmpty() || search.equals("*"))
                ? null : "%" + search.trim() + "%";
        Page<PatientHtsSummaryProjection> page =
                repository.findPatientSummaries(facilityId, searchParam, pageable);
        return page.map(proj -> new PatientHtsSummaryDto(
                proj.getPersonId(),
                proj.getFirstName(),
                proj.getSurname(),
                proj.getOtherName(),
                proj.getHospitalNumber(),
                proj.getEncounterCount()
        ));
    }


    public Page<HtsPatientSummaryDto> getHtsPatientSummaries(String search, Pageable pageable) {
        String searchParam = (search == null || search.trim().isEmpty() || search.equals("*"))
                ? null
                : "%" + search.trim() + "%";

        // *** FIX: Strip any sort from the Pageable to prevent Spring Data from
        // appending an invalid ORDER BY to the native query.
        // The native query already has ORDER BY e.id DESC, which will be used.
        Pageable pageableWithoutSort = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize()
        );

        Page<Object[]> raw = repository.findHtsPatientSummaries(searchParam, pageableWithoutSort);

        return raw.map(row -> {
            HtsPatientSummaryDto dto = new HtsPatientSummaryDto();

            // row[0] = e.id
            dto.setId(toLong(row[0]));

            // row[1] = e.uuid
            dto.setUuid(row[1] != null ? UUID.fromString(row[1].toString()) : null);

            // row[2] = p.id  (person_id)
            Long personId = toLong(row[2]);
            dto.setPersonId(personId);

            // row[3] = client_code
            dto.setClientCode(row[3] != null ? row[3].toString() : null);

            // row[4] = date_of_visit
            if (row[4] != null) {
                dto.setDateOfVisit(row[4] instanceof LocalDate
                        ? (LocalDate) row[4]
                        : LocalDate.parse(row[4].toString()));
            }

            // row[5] = setting
            dto.setSetting(row[5] != null ? row[5].toString() : null);

            // row[6] = observation (Hibernate returns JSONB as String in native queries)
            if (row[6] != null) {
                try {
                    dto.setObservation(objectMapper.readTree(row[6].toString()));
                } catch (Exception e) {
                    // log.warn("Failed to parse observation JSON for encounter id {}", dto.getId(), e);
                }
            }

            // row[7] = facility_id
            dto.setFacilityId(toLong(row[7]));

            // row[8] = hts_count
            dto.setHtsCount(toLong(row[8]));

            // row[9] = ict_count
            dto.setIctCount(toLong(row[9]));

            // Hydrate full person object — keeps all existing consumers working
            if (personId != null && personId > 0) {
                personRepository.findById(personId).ifPresent(person ->
                        dto.setPerson(personService.getDtoFromPerson(person)));
            }

            return dto;
        });
    }

    // ── Observation builder ───────────────────────────────────────────────────

    private ObjectNode buildObservation(HtsEncounterRequest r) {
        ObjectNode obs = objectMapper.createObjectNode();

        // Visit / Setting
        putStr(obs, "facilityName",        r.getFacilityName());
        putStr(obs, "facilitySetting",     r.getFacilitySetting());
        putStr(obs, "communityEntryPoint", r.getCommunityEntryPoint());
        putStr(obs, "typeOfSession",       r.getTypeOfSession());
        putStr(obs, "indexTesting",        r.getIndexTesting());
        putStr(obs, "indexRelationship",   r.getIndexRelationship());
        putStr(obs, "indexClientCode",     r.getIndexClientCode());

        // Demographics
        putStr(obs, "surname",     r.getSurname());
        putStr(obs, "firstName",   r.getFirstName());
        putStr(obs, "middleName",  r.getMiddleName());
        putStr(obs, "dobType",     r.getDobType());
        if (r.getDateOfBirth() != null)              obs.put("dateOfBirth",              r.getDateOfBirth().toString());
        if (r.getAge()         != null)              obs.put("age",                       r.getAge());
        putStr(obs, "sex",              r.getSex());
        putStr(obs, "phoneNumber",      r.getPhoneNumber());
        putStr(obs, "maritalStatus",    r.getMaritalStatus());
        if (r.getNumberOfWives()              != null) obs.put("numberOfWives",              r.getNumberOfWives());
        if (r.getNumberOfCoWives()            != null) obs.put("numberOfCoWives",            r.getNumberOfCoWives());
        if (r.getNumberOfBiologicalChildren() != null) obs.put("numberOfBiologicalChildren", r.getNumberOfBiologicalChildren());
        putStr(obs, "pregnancyStatus",      r.getPregnancyStatus());
        putStr(obs, "breastfeedingDuration", r.getBreastfeedingDuration());
        putStr(obs, "clientState",           r.getClientState());
        putStr(obs, "clientLga",             r.getClientLga());
        putStr(obs, "address",               r.getAddress());
        putStr(obs, "landmark", r.getLandmark());
        putStr(obs, "modality", r.getModality());


        // Knowledge Assessment
        putStr(obs, "previouslyTestedNegative",        r.getPreviouslyTestedNegative());
        putStr(obs, "timeOfLastNegativeTest",           r.getTimeOfLastNegativeTest());
        putStr(obs, "clientInformedTransmissionRoutes", r.getClientInformedTransmissionRoutes());
        putStr(obs, "clientInformedRiskFactors",        r.getClientInformedRiskFactors());
        putStr(obs, "clientInformedPreventionMethods",  r.getClientInformedPreventionMethods());
        putStr(obs, "clientInformedPossibleResults",    r.getClientInformedPossibleResults());
        putStr(obs, "informedConsentGiven",             r.getInformedConsentGiven());

        // Personal HIV Risk
        putStr(obs, "everHadSexualIntercourse",   r.getEverHadSexualIntercourse());
        putStr(obs, "moreThanOneSexPartner",       r.getMoreThanOneSexPartner());
        putStr(obs, "unprotectedVaginalSex",       r.getUnprotectedVaginalSex());
        putStr(obs, "unprotectedAnalSex",          r.getUnprotectedAnalSex());
        putStr(obs, "bloodTransfusionLast3Months", r.getBloodTransfusionLast3Months());
        putStr(obs, "sexUnderInfluence",           r.getSexUnderInfluence());
        putStr(obs, "historyOfSTI",                r.getHistoryOfSTI());

        // TB Screening
        putStr(obs, "currentCough", r.getCurrentCough());
        putStr(obs, "weightLoss",   r.getWeightLoss());
        putStr(obs, "fever",        r.getFever());
        putStr(obs, "nightSweats",  r.getNightSweats());

        // STI Screening
        putStr(obs, "complaintsVaginalDischarge",   r.getComplaintsVaginalDischarge());
        putStr(obs, "complaintsLowerAbdominalPain", r.getComplaintsLowerAbdominalPain());
        putStr(obs, "complaintsUrethralDischarge",  r.getComplaintsUrethralDischarge());
        putStr(obs, "complaintsScroralSwelling",    r.getComplaintsScroralSwelling());
        putStr(obs, "complaintsGenitalSores",       r.getComplaintsGenitalSores());
        putStr(obs, "complaintsSwollenLymphNodes",  r.getComplaintsSwollenLymphNodes());

        // Sex Partner Risk
        putStr(obs, "partnerNewlyDiagnosed",                   r.getPartnerNewlyDiagnosed());
        putStr(obs, "partnerPregnantOnArv",                    r.getPartnerPregnantOnArv());
        putStr(obs, "adolescentHivPositive",                   r.getAdolescentHivPositive());
        putStr(obs, "partnerNotRegularlyOnDrugs",              r.getPartnerNotRegularlyOnDrugs());
        putStr(obs, "partnerRecentlyReturnedToTreatment",      r.getPartnerRecentlyReturnedToTreatment());
        putStr(obs, "hadSexWithHivPositivePartnerInRiskGroup", r.getHadSexWithHivPositivePartnerInRiskGroup());

        // Diagnostic Testing
        putStr(obs, "typeOfHivTestDone",  r.getTypeOfHivTestDone());
        putStr(obs, "hivEarlyDetectResult",    r.getHivEarlyDetectResult());
        putStr(obs, "initialHivTest",          r.getInitialHivTest());
        putStr(obs, "suspectedAcuteInfection", r.getSuspectedAcuteInfection());
        putStr(obs, "confirmatoryHivTest",     r.getConfirmatoryHivTest());
        putStr(obs, "finalHivTestResult",     r.getFinalHivTestResult());
        putStr(obs, "syphilisTestResult",      r.getSyphilisTestResult());
        putStr(obs, "recencyTest",             r.getRecencyTest());

        // Post-Test Counselling
        putStr(obs, "previouslyTestedThisYear",     r.getPreviouslyTestedThisYear());
        putStr(obs, "clientReceivedTestResult",      r.getClientReceivedTestResult());
        putStr(obs, "hivTestKitsProvided",           r.getHivTestKitsProvided());
        putStr(obs, "categoryOfClients",             r.getCategoryOfClients());
        putStr(obs, "acceptedIndexTesting",          r.getAcceptedIndexTesting());
        putStr(obs, "providedFpInfo",                r.getProvidedFpInfo());
        putStr(obs, "clientPartnerUseFpMethods",     r.getClientPartnerUseFpMethods());
        putStr(obs, "clientPartnerUseCondoms",       r.getClientPartnerUseCondoms());
        putStr(obs, "correctCondomUseDemonstrated",  r.getCorrectCondomUseDemonstrated());
        putStr(obs, "condomsProvided",               r.getCondomsProvided());
        putStr(obs, "clientReferredToOtherServices", r.getClientReferredToOtherServices());
        putStr(obs, "completedBy",                   r.getCompletedBy());
        putStr(obs, "designation",                   r.getDesignation());

        return obs;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void putStr(ObjectNode node, String key, String value) {
        if (value != null) node.put(key, value);
    }

    private UUID resolveUuid(Object uuid) {
        if (uuid instanceof UUID)   return (UUID) uuid;
        if (uuid instanceof String) return UUID.fromString((String) uuid);
        return null;
    }

    private long toLong(Object val) {
        if (val == null)               return 0L;
        if (val instanceof Long)       return (Long) val;
        if (val instanceof BigInteger) return ((BigInteger) val).longValue();
        if (val instanceof Integer)    return ((Integer) val).longValue();
        if (val instanceof Number)     return ((Number) val).longValue();
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
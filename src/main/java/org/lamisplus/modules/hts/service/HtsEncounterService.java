package org.lamisplus.modules.hts.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.hts.domain.dto.HtsEncounterRequest;
import org.lamisplus.modules.hts.domain.dto.HtsEncounterResponse;
import org.lamisplus.modules.hts.domain.dto.PatientHtsSummaryDto;
import org.lamisplus.modules.hts.domain.dto.PatientHtsSummaryProjection;
import org.lamisplus.modules.hts.domain.entity.HtsEncounter;
import org.lamisplus.modules.hts.repository.HtsEncounterRepository;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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

    public HtsEncounterResponse save(HtsEncounterRequest request) {
        Person person;
        if (request.getPatientId() != null) {
            person = personRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", request.getPatientId().toString()));
        } else {
            if (request.getPerson() == null) {
                throw new IllegalTypeException(HtsEncounterRequest.class, "person", "must be provided when patientId is null");
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
        encounter.setObservation(buildObservation(request));
        encounter.setFacilityId(request.getFacilityId());   // ← add this line

        encounter = repository.save(encounter);
        return toResponse(encounter);
    }

    public HtsEncounterResponse update(Long id, HtsEncounterRequest request) {
        HtsEncounter existing = repository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HtsEncounter.class, "id", id.toString()));

        if (request.getClientCode() != null) existing.setClientCode(request.getClientCode());
        if (request.getDateOfVisit() != null) existing.setDateOfVisit(request.getDateOfVisit());
        if (request.getSetting() != null) existing.setSetting(request.getSetting());
        existing.setObservation(buildObservation(request));
        existing.setFacilityId(request.getFacilityId());

        existing = repository.save(existing);
        return toResponse(existing);
    }

    public HtsEncounterResponse getById(Long id) {
        HtsEncounter encounter = repository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HtsEncounter.class, "id", id.toString()));
        return toResponse(encounter);
    }

    public Page<HtsEncounterResponse> search(Long facilityId, String search, Pageable pageable) {
        String searchParam = (search == null || search.equals("*")) ? null : "%" + search + "%";
        Page<HtsEncounter> page = repository.search(facilityId, searchParam, pageable);
        return page.map(this::toResponse);
    }

    public void delete(Long id) {
        HtsEncounter encounter = repository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HtsEncounter.class, "id", id.toString()));
        encounter.setArchived(true);
        repository.save(encounter);
    }

    public List<HtsEncounterResponse> getEncountersByPatientId(Long patientId) {
        personRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", patientId.toString()));
        List<HtsEncounter> encounters = repository.findByPerson_IdAndArchivedOrderByDateOfVisitDesc(patientId, false);
        return encounters.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<PatientHtsSummaryDto> getPatientSummaries(Long facilityId, String search, Pageable pageable) {
        String searchParam = (search == null || search.equals("*") || search.trim().isEmpty())
                ? null : "%" + search.trim() + "%";
        Page<PatientHtsSummaryProjection> page = repository.findPatientSummaries(facilityId, searchParam, pageable);
        return page.map(proj -> new PatientHtsSummaryDto(
                proj.getPersonId(),
                proj.getFirstName(),
                proj.getSurname(),
                proj.getOtherName(),
                proj.getHospitalNumber(),
                proj.getEncounterCount()
        ));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Serialises every clinical field from the request into the observation
     * JsonNode column so they survive round-trips.
     */
    private ObjectNode buildObservation(HtsEncounterRequest r) {
        ObjectNode obs = objectMapper.createObjectNode();

        // Visit / Setting
        putStr(obs, "facilityName",             r.getFacilityName());
        putStr(obs, "facilitySetting",           r.getFacilitySetting());
        putStr(obs, "communityEntryPoint",       r.getCommunityEntryPoint());
        putStr(obs, "typeOfSession",             r.getTypeOfSession());
        putStr(obs, "indexTesting",              r.getIndexTesting());
        putStr(obs, "indexRelationship",         r.getIndexRelationship());
        putStr(obs, "indexClientCode",           r.getIndexClientCode());

        // Demographics (stored for display / reporting)
        putStr(obs, "surname",                   r.getSurname());
        putStr(obs, "firstName",                 r.getFirstName());
        putStr(obs, "middleName",                r.getMiddleName());
        putStr(obs, "dobType",                   r.getDobType());
        if (r.getDateOfBirth() != null) obs.put("dateOfBirth", r.getDateOfBirth().toString());
        if (r.getAge()         != null) obs.put("age",         r.getAge());
        putStr(obs, "sex",                       r.getSex());
        putStr(obs, "phoneNumber",               r.getPhoneNumber());
        putStr(obs, "maritalStatus",             r.getMaritalStatus());
        if (r.getNumberOfWives()             != null) obs.put("numberOfWives",             r.getNumberOfWives());
        if (r.getNumberOfCoWives()           != null) obs.put("numberOfCoWives",           r.getNumberOfCoWives());
        if (r.getNumberOfBiologicalChildren()!= null) obs.put("numberOfBiologicalChildren",r.getNumberOfBiologicalChildren());
        putStr(obs, "pregnancyStatus",           r.getPregnancyStatus());
        putStr(obs, "breastfeedingDuration",     r.getBreastfeedingDuration());
        putStr(obs, "clientState",               r.getClientState());
        putStr(obs, "clientLga",                 r.getClientLga());
        putStr(obs, "address",                   r.getAddress());

        // Knowledge Assessment
        putStr(obs, "previouslyTestedNegative",          r.getPreviouslyTestedNegative());
        putStr(obs, "timeOfLastNegativeTest",             r.getTimeOfLastNegativeTest());
        putStr(obs, "clientInformedTransmissionRoutes",   r.getClientInformedTransmissionRoutes());
        putStr(obs, "clientInformedRiskFactors",          r.getClientInformedRiskFactors());
        putStr(obs, "clientInformedPreventionMethods",    r.getClientInformedPreventionMethods());
        putStr(obs, "clientInformedPossibleResults",      r.getClientInformedPossibleResults());
        putStr(obs, "informedConsentGiven",               r.getInformedConsentGiven());

        // Personal HIV Risk
        putStr(obs, "everHadSexualIntercourse",    r.getEverHadSexualIntercourse());
        putStr(obs, "moreThanOneSexPartner",        r.getMoreThanOneSexPartner());
        putStr(obs, "unprotectedVaginalSex",        r.getUnprotectedVaginalSex());
        putStr(obs, "unprotectedAnalSex",           r.getUnprotectedAnalSex());
        putStr(obs, "bloodTransfusionLast3Months",  r.getBloodTransfusionLast3Months());
        putStr(obs, "sexUnderInfluence",            r.getSexUnderInfluence());
        putStr(obs, "historyOfSTI",                 r.getHistoryOfSTI());

        // TB Screening
        putStr(obs, "currentCough",   r.getCurrentCough());
        putStr(obs, "weightLoss",     r.getWeightLoss());
        putStr(obs, "fever",          r.getFever());
        putStr(obs, "nightSweats",    r.getNightSweats());

        // STI Screening
        putStr(obs, "complaintsVaginalDischarge",    r.getComplaintsVaginalDischarge());
        putStr(obs, "complaintsLowerAbdominalPain",  r.getComplaintsLowerAbdominalPain());
        putStr(obs, "complaintsUrethralDischarge",   r.getComplaintsUrethralDischarge());
        putStr(obs, "complaintsScroralSwelling",     r.getComplaintsScroralSwelling());
        putStr(obs, "complaintsGenitalSores",        r.getComplaintsGenitalSores());
        putStr(obs, "complaintsSwollenLymphNodes",   r.getComplaintsSwollenLymphNodes());

        // Sex Partner Risk
        putStr(obs, "partnerNewlyDiagnosed",                   r.getPartnerNewlyDiagnosed());
        putStr(obs, "partnerPregnantOnArv",                    r.getPartnerPregnantOnArv());
        putStr(obs, "adolescentHivPositive",                   r.getAdolescentHivPositive());
        putStr(obs, "partnerNotRegularlyOnDrugs",              r.getPartnerNotRegularlyOnDrugs());
        putStr(obs, "partnerRecentlyReturnedToTreatment",      r.getPartnerRecentlyReturnedToTreatment());
        putStr(obs, "hadSexWithHivPositivePartnerInRiskGroup", r.getHadSexWithHivPositivePartnerInRiskGroup());

        // Diagnostic Testing
        putStr(obs, "hivEarlyDetectTestDone",   r.getHivEarlyDetectTestDone());
        putStr(obs, "hivEarlyDetectResult",     r.getHivEarlyDetectResult());
        putStr(obs, "initialHivTest",           r.getInitialHivTest());
        putStr(obs, "suspectedAcuteInfection",  r.getSuspectedAcuteInfection());
        putStr(obs, "confirmatoryHivTest",      r.getConfirmatoryHivTest());
        putStr(obs, "syphilisTestResult",       r.getSyphilisTestResult());
        putStr(obs, "recencyTest",              r.getRecencyTest());

        // Post-Test Counselling
        putStr(obs, "previouslyTestedThisYear",       r.getPreviouslyTestedThisYear());
        putStr(obs, "clientReceivedTestResult",        r.getClientReceivedTestResult());
        putStr(obs, "hivTestKitsProvided",             r.getHivTestKitsProvided());
        putStr(obs, "categoryOfClients",               r.getCategoryOfClients());
        putStr(obs, "acceptedIndexTesting",            r.getAcceptedIndexTesting());
        putStr(obs, "providedFpInfo",                  r.getProvidedFpInfo());
        putStr(obs, "clientPartnerUseFpMethods",       r.getClientPartnerUseFpMethods());
        putStr(obs, "clientPartnerUseCondoms",         r.getClientPartnerUseCondoms());
        putStr(obs, "correctCondomUseDemonstrated",    r.getCorrectCondomUseDemonstrated());
        putStr(obs, "condomsProvided",                 r.getCondomsProvided());
        putStr(obs, "clientReferredToOtherServices",   r.getClientReferredToOtherServices());
        putStr(obs, "completedBy",                     r.getCompletedBy());
        putStr(obs, "designation",                     r.getDesignation());

        return obs;
    }

    private void putStr(ObjectNode node, String key, String value) {
        if (value != null) node.put(key, value);
    }

    private UUID resolveUuid(Object uuid) {
        if (uuid instanceof UUID)   return (UUID) uuid;
        if (uuid instanceof String) return UUID.fromString((String) uuid);
        return null;
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
        return response;
    }
}
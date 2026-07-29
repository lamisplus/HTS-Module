package org.lamisplus.modules.hts.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.hts.domain.dto.HivstEncounterRequestDTO;
import org.lamisplus.modules.hts.domain.dto.HivstEncounterResponseDTO;
import org.lamisplus.modules.hts.domain.dto.HivstPatientSummaryDto;
import org.lamisplus.modules.hts.domain.entity.HivstEncounter;
import org.lamisplus.modules.hts.repository.HivstEncounterRepository;
import org.lamisplus.modules.hts.repository.HivstResultRepository;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HivstEncounterService {

    private final HivstEncounterRepository encounterRepository;
    private final HivstResultRepository resultRepository;
    private final PersonRepository personRepository;
    private final PersonService personService;
    private final ObjectMapper objectMapper;
    private final CurrentUserOrganizationService currentUserOrganizationService;

    public HivstEncounterResponseDTO save(HivstEncounterRequestDTO request) {
        Person person = personRepository.findById(request.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", request.getPatientId().toString()));

        HivstEncounter encounter = new HivstEncounter();
        encounter.setPerson(person);
        encounter.setPatientUuid(person.getUuid().toString());
        encounter.setClientCode(request.getClientCode());
        encounter.setDateOfVisit(request.getDateOfVisit());
        encounter.setFacilityId(request.getFacilityId());
        encounter.setSetting(request.getSetting());
        encounter.setSource("Web");
        encounter.setLongitude(request.getLongitude());
        encounter.setLatitude(request.getLatitude());
        encounter.setObservation(buildObservation(request));

        encounter = encounterRepository.save(encounter);
        return toResponse(encounter);
    }

    public HivstEncounterResponseDTO update(Long id, HivstEncounterRequestDTO request) {
        HivstEncounter existing = encounterRepository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HivstEncounter.class, "id", id.toString()));

        // Update only allowed fields (not patient demographics)
        if (request.getClientCode() != null) existing.setClientCode(request.getClientCode());
        if (request.getDateOfVisit() != null) existing.setDateOfVisit(request.getDateOfVisit());
        if (request.getSetting() != null) existing.setSetting(request.getSetting());
        if (request.getFacilityId() != null) existing.setFacilityId(request.getFacilityId());
        if (request.getLongitude() != null) existing.setLongitude(request.getLongitude());
        if (request.getLatitude() != null) existing.setLatitude(request.getLatitude());

        // Update observation: only HIVST-specific fields, keep demographics as snapshot
        JsonNode currentObs = existing.getObservation();
        ObjectNode updatedObs = currentObs != null ? currentObs.deepCopy() : objectMapper.createObjectNode();
        // Note: "setting" is intentionally NOT duplicated into the observation JSON here —
        // it already lives as its own column (existing.setSetting(...) above), matching
        // how HTS's buildObservation() keeps "setting" out of the JSON entirely.
        putStr(updatedObs, "facilitySetting", request.getFacilitySetting());
        putStr(updatedObs, "communityEntryPoint", request.getCommunityEntryPoint());
        putStr(updatedObs, "typeOfSession", request.getTypeOfSession());
        putStr(updatedObs, "htsPopulationType", request.getHtsPopulationType());
        putStr(updatedObs, "indexTesting", request.getIndexTesting());
        putStr(updatedObs, "indexRelationship", request.getIndexRelationship());
        putStr(updatedObs, "indexClientCode", request.getIndexClientCode());
        if (request.getNumberOfWives() != null) updatedObs.put("numberOfWives", request.getNumberOfWives());
        if (request.getNumberOfCoWives() != null) updatedObs.put("numberOfCoWives", request.getNumberOfCoWives());
        if (request.getNumberOfBiologicalChildren() != null) updatedObs.put("numberOfBiologicalChildren", request.getNumberOfBiologicalChildren());
        putStr(updatedObs, "pregnancyStatus", request.getPregnancyStatus());
        putStr(updatedObs, "breastfeedingDuration", request.getBreastfeedingDuration());
        // HIVST-specific
        putStr(updatedObs, "hivTestKitsProvided", request.getHivTestKitsProvided());
        putStr(updatedObs, "categoryOfClients", request.getCategoryOfClients());
        if (request.getNumberOfHivstKitDistributed() != null) updatedObs.put("numberOfHivstKitDistributed", request.getNumberOfHivstKitDistributed());
        putStr(updatedObs, "completedBy", request.getCompletedBy());
        putStr(updatedObs, "designation", request.getDesignation());

        existing.setObservation(updatedObs);
        existing = encounterRepository.save(existing);
        return toResponse(existing);
    }

    public void delete(Long id) {
        HivstEncounter encounter = encounterRepository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HivstEncounter.class, "id", id.toString()));
        encounter.setArchived(true);
        encounterRepository.save(encounter);

        // Cascade archive the associated result
        resultRepository.findByEncounter_IdAndArchived(id, false)
                .ifPresent(result -> {
                    result.setArchived(true);
                    resultRepository.save(result);
                });
    }

    public HivstEncounterResponseDTO getById(Long id) {
        HivstEncounter encounter = encounterRepository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HivstEncounter.class, "id", id.toString()));
        return toResponse(encounter);
    }

    public List<HivstEncounterResponseDTO> getByPatientId(Long patientId) {
        personRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", patientId.toString()));
        return encounterRepository.findByPerson_IdAndArchivedOrderByDateOfVisitDesc(patientId, false)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<HivstEncounterResponseDTO> getByPatientUuid(String patientUuid) {
        // We need to find person by uuid first
        Person person = personRepository.findByUuid(patientUuid)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "uuid", patientUuid));
        return getByPatientId(person.getId());
    }

    public Page<HivstPatientSummaryDto> getPatientSummaries(String search, Pageable pageable) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        String searchParam = (search == null || search.trim().isEmpty() || search.equals("*")) ? null : "%" + search.trim() + "%";

        Page<Object[]> rawPage = encounterRepository.findHivstPatientSummaries(facilityId, searchParam, pageable);
        List<HivstPatientSummaryDto> dtos = new ArrayList<>();
        for (Object[] row : rawPage.getContent()) {
            HivstPatientSummaryDto dto = new HivstPatientSummaryDto();
            dto.setPatientId(toLong(row[0]));
            dto.setFirstName((String) row[1]);
            dto.setSurname((String) row[2]);
            dto.setOtherName((String) row[3]);
            dto.setHospitalNumber((String) row[4]);
            // age: row[5] is double (from EXTRACT)
            dto.setAge(row[5] != null ? String.valueOf(((Number) row[5]).intValue()) : null);
            dto.setSex((String) row[6]);
            dto.setPhoneNumber((String) row[7]);
            dto.setLatestClientCode((String) row[8]);
            dto.setEncounterCount(toLong(row[9]));
            dto.setResultCount(toLong(row[10]));
            dtos.add(dto);
        }
        return new PageImpl<>(dtos, pageable, rawPage.getTotalElements());
    }

    // Helper methods
    private JsonNode buildObservation(HivstEncounterRequestDTO request) {
        ObjectNode obs = objectMapper.createObjectNode();

        // Note: "setting" intentionally lives only as its own column
        // (encounter.setSetting(...) in save()), not duplicated here —
        // matches HTS's buildObservation().
        putStr(obs, "facilitySetting", request.getFacilitySetting());
        putStr(obs, "communityEntryPoint", request.getCommunityEntryPoint());
        putStr(obs, "typeOfSession", request.getTypeOfSession());
        putStr(obs, "htsPopulationType", request.getHtsPopulationType());
        putStr(obs, "indexTesting", request.getIndexTesting());
        putStr(obs, "indexRelationship", request.getIndexRelationship());
        putStr(obs, "indexClientCode", request.getIndexClientCode());
        if (request.getNumberOfWives() != null) obs.put("numberOfWives", request.getNumberOfWives());
        if (request.getNumberOfCoWives() != null) obs.put("numberOfCoWives", request.getNumberOfCoWives());
        if (request.getNumberOfBiologicalChildren() != null) obs.put("numberOfBiologicalChildren", request.getNumberOfBiologicalChildren());
        putStr(obs, "pregnancyStatus", request.getPregnancyStatus());
        putStr(obs, "breastfeedingDuration", request.getBreastfeedingDuration());
        putStr(obs, "hivTestKitsProvided", request.getHivTestKitsProvided());
        putStr(obs, "categoryOfClients", request.getCategoryOfClients());
        if (request.getNumberOfHivstKitDistributed() != null) obs.put("numberOfHivstKitDistributed", request.getNumberOfHivstKitDistributed());
        putStr(obs, "completedBy", request.getCompletedBy());
        putStr(obs, "designation", request.getDesignation());

        return obs;
    }

    private void putStr(ObjectNode node, String key, String value) {
        if (value != null) node.put(key, value);
    }

    private long toLong(Object val) {
        if (val == null) return 0L;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }

    private HivstEncounterResponseDTO toResponse(HivstEncounter entity) {
        HivstEncounterResponseDTO response = new HivstEncounterResponseDTO();
        response.setId(entity.getId());
        response.setUuid(entity.getUuid());
        response.setPatientId(entity.getPerson().getId());
        response.setPatientUuid(entity.getPatientUuid());
        response.setPerson(personService.getDtoFromPerson(entity.getPerson()));
        response.setClientCode(entity.getClientCode());
        response.setDateOfVisit(entity.getDateOfVisit());
        response.setSetting(entity.getSetting());
        response.setFacilityId(entity.getFacilityId());
        response.setObservation(entity.getObservation());
        response.setSource(entity.getSource());
        response.setLongitude(entity.getLongitude());
        response.setLatitude(entity.getLatitude());
        return response;
    }
}
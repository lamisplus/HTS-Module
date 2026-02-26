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

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@RequiredArgsConstructor
@Slf4j
public class HtsEncounterService {

    private final HtsEncounterRepository repository;
    private final PersonRepository personRepository;
    private final PersonService personService;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final ObjectMapper objectMapper;

    public HtsEncounterResponse save(@Valid HtsEncounterRequest request) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();

        // 1. Resolve person
        Person person;
        if (request.getPersonId() != null) {
            person = personRepository.findById(request.getPersonId())
                    .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", request.getPersonId().toString()));
        } else {
            if (request.getPerson() == null) {
                throw new IllegalTypeException(HtsEncounterRequest.class, "person", "must be provided when personId is null");
            }
            PersonResponseDto created = personService.createPerson(request.getPerson());
            person = personRepository.findById(created.getId())
                    .orElseThrow(() -> new IllegalStateException("Person creation failed"));
        }

        // 2. Build HtsEncounter entity
        HtsEncounter encounter = new HtsEncounter();
        encounter.setPerson(person);
        encounter.setClientCode(request.getClientCode());
        encounter.setDateOfVisit(request.getDateOfVisit());
        encounter.setFacilityId(facilityId);
        encounter.setSetting(request.getSetting());

        // Store full request as JSONB
        JsonNode dataNode = objectMapper.valueToTree(request);
        encounter.setData(dataNode);

        // 3. Save
        encounter = repository.save(encounter);
        return toResponse(encounter);
    }

    public HtsEncounterResponse update(Long id, @Valid HtsEncounterRequest request) {
        HtsEncounter existing = repository.findByIdAndArchived(id, UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(HtsEncounter.class, "id", id.toString()));

        JsonNode currentData = existing.getData();
        JsonNode requestData = objectMapper.valueToTree(request);

        // Merge non-null fields from request into existing data
        ObjectNode merged = currentData.deepCopy();
        requestData.fields().forEachRemaining(entry -> {
            JsonNode value = entry.getValue();
            if (!value.isNull()) {
                merged.set(entry.getKey(), value);
            }
        });

        // Update extracted columns
        if (request.getClientCode() != null) existing.setClientCode(request.getClientCode());
        if (request.getDateOfVisit() != null) existing.setDateOfVisit(request.getDateOfVisit());
        if (request.getSetting() != null) existing.setSetting(request.getSetting());

        existing.setData(merged);
        existing = repository.save(existing);
        return toResponse(existing);
    }

    public HtsEncounterResponse getById(Long id) {
        HtsEncounter encounter = repository.findByIdAndArchived(id, UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(HtsEncounter.class, "id", id.toString()));
        return toResponse(encounter);
    }

    public Page<HtsEncounterResponse> search(String search, Pageable pageable) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        String searchParam = (search == null || search.equals("*")) ? null : "%" + search + "%";
        Page<HtsEncounter> page = repository.search(facilityId, searchParam, pageable);
        return page.map(this::toResponse);
    }

    public void delete(Long id) {
        HtsEncounter encounter = repository.findByIdAndArchived(id, UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(HtsEncounter.class, "id", id.toString()));
        encounter.setArchived(1);
        repository.save(encounter);
    }

    public List<HtsEncounterResponse> getEncountersByPersonId(Long personId) {
        // Verify person exists
        personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", personId.toString()));

        List<HtsEncounter> encounters = repository.findByPerson_IdAndArchivedOrderByDateOfVisitDesc(personId, UN_ARCHIVED);
        return encounters.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<PatientHtsSummaryDto> getPatientSummaries(String search, Pageable pageable) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        String searchParam = (search == null || search.equals("*")) ? null : "%" + search + "%";
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

    private HtsEncounterResponse toResponse(HtsEncounter entity) {
        HtsEncounterResponse response = new HtsEncounterResponse();
        response.setId(entity.getId());
        response.setUuid(entity.getUuid());
        response.setPersonId(entity.getPerson().getId());
        response.setPerson(personService.getDtoFromPerson(entity.getPerson()));
        response.setClientCode(entity.getClientCode());
        response.setDateOfVisit(entity.getDateOfVisit());
        response.setSetting(entity.getSetting());
        response.setData(entity.getData());
        response.setFacilityId(entity.getFacilityId());
        return response;
    }
}
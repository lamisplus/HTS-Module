package org.lamisplus.modules.hts.service;

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

    public HtsEncounterResponse save(HtsEncounterRequest request) {
        // 1. Resolve person
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

        // 2. Build entity
        HtsEncounter encounter = new HtsEncounter();
        encounter.setPerson(person);
        // getUuid() may return String or UUID depending on your Person entity;
        // cast or parse as needed:
        Object uuid = person.getUuid();
        if (uuid instanceof UUID) {
            encounter.setPatientUuid((UUID) uuid);
        } else if (uuid instanceof String) {
            encounter.setPatientUuid(UUID.fromString((String) uuid));
        }
        encounter.setClientCode(request.getClientCode());
        encounter.setDateOfVisit(request.getDateOfVisit());
        encounter.setSetting(request.getSetting());

        encounter = repository.save(encounter);
        return toResponse(encounter);
    }

    public HtsEncounterResponse update(Long id, HtsEncounterRequest request) {
        HtsEncounter existing = repository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HtsEncounter.class, "id", id.toString()));

        if (request.getClientCode() != null) existing.setClientCode(request.getClientCode());
        if (request.getDateOfVisit() != null) existing.setDateOfVisit(request.getDateOfVisit());
        if (request.getSetting() != null) existing.setSetting(request.getSetting());

        existing = repository.save(existing);
        return toResponse(existing);
    }

    public HtsEncounterResponse getById(Long id) {
        HtsEncounter encounter = repository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HtsEncounter.class, "id", id.toString()));
        return toResponse(encounter);
    }

    public Page<HtsEncounterResponse> search(String search, Pageable pageable) {
        String searchParam = (search == null || search.equals("*")) ? null : "%" + search + "%";
        // facilityId removed — adjust your repository query signature if needed,
        // or pass null / a default. Update the call below to match your repo method:
        Page<HtsEncounter> page = repository.search(null, searchParam, pageable);
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

    public Page<PatientHtsSummaryDto> getPatientSummaries(String search, Pageable pageable) {
        String searchParam;
        if (search == null || search.equals("*") || search.trim().isEmpty()) {
            searchParam = null;
        } else {
            searchParam = "%" + search.trim() + "%";
        }
        Page<PatientHtsSummaryProjection> page = repository.findPatientSummaries(null, searchParam, pageable);
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
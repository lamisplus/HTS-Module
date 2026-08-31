package org.lamisplus.modules.hts.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.hts.domain.dto.HivstResultRequestDTO;
import org.lamisplus.modules.hts.domain.dto.HivstResultResponseDTO;
import org.lamisplus.modules.hts.domain.entity.HivstEncounter;
import org.lamisplus.modules.hts.domain.entity.HivstResult;
import org.lamisplus.modules.hts.repository.HivstEncounterRepository;
import org.lamisplus.modules.hts.repository.HivstResultRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HivstResultService {

    private final HivstResultRepository resultRepository;
    private final HivstEncounterRepository encounterRepository;

    public HivstResultResponseDTO save(HivstResultRequestDTO request) {
        HivstEncounter encounter = encounterRepository.findByIdAndArchived(request.getEncounterId(), false)
                .orElseThrow(() -> new EntityNotFoundException(HivstEncounter.class, "id", request.getEncounterId().toString()));

        // Check if result already exists
        resultRepository.findByEncounter_IdAndArchived(request.getEncounterId(), false)
                .ifPresent(r -> {
                    throw new IllegalTypeException(HivstResult.class, "encounterId", "Result already exists for this encounter");
                });

        // Get numberOfKits from observation
        JsonNode obs = encounter.getObservation();
        if (obs == null || !obs.has("numberOfHivstKitDistributed")) {
            throw new IllegalTypeException(HivstResult.class, "numberOfKits", "Encounter missing number of kits");
        }
        Integer numberOfKits = obs.get("numberOfHivstKitDistributed").asInt(0);

        // Validate sum constraint
        int totalReactive = request.getReactiveGt15() + request.getReactiveLe15();
        if (totalReactive > numberOfKits) {
            throw new IllegalTypeException(HivstResult.class, "reactive sum", "Total reactive results cannot exceed number of kits distributed");
        }

        HivstResult result = new HivstResult();
        result.setEncounter(encounter);
        result.setFacilityId(encounter.getFacilityId()); 
        result.setNumberOfKits(numberOfKits);
        result.setReactiveGt15(request.getReactiveGt15());
        result.setReactiveLe15(request.getReactiveLe15());

        result = resultRepository.save(result);
        return toResponse(result);
    }

    public HivstResultResponseDTO update(Long id, HivstResultRequestDTO request) {
        HivstResult result = resultRepository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HivstResult.class, "id", id.toString()));

        // Re-fetch encounter to get numberOfKits
        HivstEncounter encounter = result.getEncounter();
        JsonNode obs = encounter.getObservation();
        Integer numberOfKits = obs != null && obs.has("numberOfHivstKitDistributed")
                ? obs.get("numberOfHivstKitDistributed").asInt(0) : 0;

        int totalReactive = request.getReactiveGt15() + request.getReactiveLe15();
        if (totalReactive > numberOfKits) {
            throw new IllegalTypeException(HivstResult.class, "reactive sum", "Total reactive results cannot exceed number of kits distributed");
        }

        result.setReactiveGt15(request.getReactiveGt15());
        result.setReactiveLe15(request.getReactiveLe15());

        result = resultRepository.save(result);
        return toResponse(result);
    }

    public void delete(Long id) {
        HivstResult result = resultRepository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HivstResult.class, "id", id.toString()));
        result.setArchived(true);
        resultRepository.save(result);
    }

    public HivstResultResponseDTO getById(Long id) {
        HivstResult result = resultRepository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new EntityNotFoundException(HivstResult.class, "id", id.toString()));
        return toResponse(result);
    }

    public HivstResultResponseDTO getByEncounterId(Long encounterId) {
        HivstResult result = resultRepository.findByEncounter_IdAndArchived(encounterId, false)
                .orElseThrow(() -> new EntityNotFoundException(HivstResult.class, "encounterId", encounterId.toString()));
        return toResponse(result);
    }

    public List<HivstResultResponseDTO> getByPatientId(Long patientId) {
        return resultRepository.findByPatientId(patientId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<HivstResultResponseDTO> getByPatientUuid(String patientUuid) {
        return resultRepository.findByPatientUuid(patientUuid).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private HivstResultResponseDTO toResponse(HivstResult result) {
        HivstResultResponseDTO response = new HivstResultResponseDTO();
        response.setId(result.getId());
        response.setUuid(result.getUuid());
        response.setEncounterId(result.getEncounter().getId());
        response.setNumberOfKits(result.getNumberOfKits());
        response.setReactiveGt15(result.getReactiveGt15());
        response.setReactiveLe15(result.getReactiveLe15());
        return response;
    }
}
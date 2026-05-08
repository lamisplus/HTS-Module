package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class HtsEncounterResponse {
    private Long id;
    private UUID uuid;
    private Long patientId;
    private UUID patientUuid;
    private PersonResponseDto person;
    private String clientCode;
    private LocalDate dateOfVisit;
    private String setting;
    private JsonNode observation;
    private Long facilityId;
}
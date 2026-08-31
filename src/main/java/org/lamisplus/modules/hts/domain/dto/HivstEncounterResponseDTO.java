package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import java.time.LocalDate;

@Data
public class HivstEncounterResponseDTO {
    private Long id;
    private String uuid;
    private Long patientId;
    private String patientUuid;
    private PersonResponseDto person;
    private String clientCode;
    private LocalDate dateOfVisit;
    private String setting;
    private Long facilityId;
    private JsonNode observation;
    private String source;
    private String longitude;
    private String latitude;
}
package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import java.time.LocalDate;
import java.util.UUID;

/**
 * One row per patient in the HTS patient list.
 * Shape mirrors the existing HtsEncounterResponse enough that all existing
 * consumers in PatientDetail / PatientHistory keep working unchanged.
 */
@Data
public class HtsPatientSummaryDto {

    private Long   id;
    private String uuid;
    private Long   personId;
    private PersonResponseDto person;
    private String    clientCode;
    private LocalDate dateOfVisit;
    private String    setting;
    private JsonNode  observation;
    private Long      facilityId;
    private long htsCount;
    private long ictCount;
}

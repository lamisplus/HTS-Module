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

    // ── Identity fields expected by existing consumers ────────────────────
    private Long   id;           // id of the most recent HTS encounter
    private UUID   uuid;         // uuid of the most recent HTS encounter
    private Long   personId;     // patient_person.id   (PatientDetail reads this)
    private PersonResponseDto person; // full person object  (PatientCardDetail reads this)

    // ── HTS encounter fields ──────────────────────────────────────────────
    private String    clientCode;   // most recent client code
    private LocalDate dateOfVisit;  // most recent visit date
    private String    setting;
    private JsonNode  observation;  // observation of the most recent encounter
    private Long      facilityId;

    // ── Aggregate counts ──────────────────────────────────────────────────
    private long htsCount;   // total HTS encounters for this patient
    private long ictCount;   // total ICT encounters for this patient
}

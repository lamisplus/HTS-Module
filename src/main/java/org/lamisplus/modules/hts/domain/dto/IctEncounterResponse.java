package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class IctEncounterResponse {
    private Long id;
    private String uuid;
    private Long patientId;
    private UUID patientUuid;
    private Long htsEncounterId;
    private Long facilityId;
    private LocalDate dateOfService;
    private String setting;
    private String clientCategory;
    private String offeredPns;
    private String acceptedPns;
    private JsonNode data;
    private List<IctContactResponse> contacts;
}
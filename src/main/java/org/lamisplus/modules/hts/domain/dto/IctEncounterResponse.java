package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class IctEncounterResponse {
    private Long id;
    private String uuid;
    private Long personId;
    private Long htsEncounterId;
    private Long facilityId;
    private LocalDate dateOfService;
    private String setting;
    private String clientCategory;
    private String offeredPns;
    private String acceptedPns;

    /** JSONB overflow: facilitySetting, communityEntryPoint, artClinic,
     *  clientCategoryOther, full index client demographic snapshot */
    private JsonNode data;

    /** Full contact list — always returned together with the encounter */
    private List<IctContactResponse> contacts;
}

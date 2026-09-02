package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

// PMTCT-only nested block. Entirely optional - HTS never sends this. testResult is stored
// here in addition to (not instead of) the pre-existing flat syphilisTestResult key -
// intentional, confirmed with the product owner: PMTCT's own structured shape is preserved
// alongside HTS's existing flat field.
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SyphilisInfoDto {
    private String testResult;
    private String treatment;
    private String drugName;
}

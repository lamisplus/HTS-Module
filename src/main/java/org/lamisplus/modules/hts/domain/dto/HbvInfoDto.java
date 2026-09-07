package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

// PMTCT-only nested block. Entirely optional - HTS never sends this, and has no existing
// equivalent field for any of these (Hepatitis B is not captured anywhere else in HTS).
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class HbvInfoDto {
    private String knownPositive;
    private String testResult;
    private String treatment;
    private String vlResultDate;
    private String vlResult;
    private String drugName;
}

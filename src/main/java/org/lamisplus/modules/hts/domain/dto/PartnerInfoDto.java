package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

// PMTCT-only nested block (MTCT partner-testing plan). Entirely optional - HTS never sends
// this. Distinct from HTS's own indexTesting/acceptedIndexTesting fields, which model a
// different (index-testing-network) workflow - not merged with those on purpose.
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PartnerInfoDto {
    private String notificationAgreed;
    private String testedHiv;
    private String testedSyphilis;
    private String testedHbv;
    private String referral;
}

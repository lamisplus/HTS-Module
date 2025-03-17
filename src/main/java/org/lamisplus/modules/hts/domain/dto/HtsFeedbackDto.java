package org.lamisplus.modules.hts.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class HtsFeedbackDto {
    private Long id;
    private Integer facilityId;
    private String patientId;
    private String primaryBasisToTest;
    private String clientTestedDespiteLowRiskScore;
    private String reasonForTestingDespiteLowRiskScore;
    private String clientTestedDespiteHighRiskScore;
    private String mainReasonForTestingThisClient;
    private String optionMainReasonForTestingThisClient;
    private String mainReasonForNotTestingThisClient;
    private String optionMainReasonForNotTestingThisClient;
    private String riskScoreContributeToTheClinicalDecision;
}


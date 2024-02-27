package org.lamisplus.modules.hts.domain.dto;

import lombok.Data;

@Data
public class HtsPreTestCounselingDto {
    private final Long htsClientId;
    private  final Long personId;
    //PRE TEST COUNSELING
    private  Object knowledgeAssessment;
    private  Object riskAssessment;
    private  Object tbScreening;
    private  Object stiScreening;
    private  Object sexPartnerRiskAssessment;

}

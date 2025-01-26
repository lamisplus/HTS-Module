package org.lamisplus.modules.hts.domain.dto;

import lombok.*;
import org.lamisplus.modules.hts.domain.entity.IndexElicitation;
import org.lamisplus.modules.hts.domain.enums.Source;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import javax.persistence.Column;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class HtsClientDto {
    @NotNull(message = "id is mandatory")
    private  Long id;
    private  String targetGroup;
    @NotNull(message = "clientCode is mandatory")
    private  String clientCode;
    @NotNull(message = "dateVisit is mandatory")
    private  LocalDate dateVisit;
    private  Long referredFrom;
    private  String testingSetting;
    private  Boolean firstTimeVisit;
    private  Integer numChildren;
    private  Integer numWives;
    private  Long typeCounseling;
    private  Boolean indexClient;
    private  Boolean previouslyTested;
    @NotNull(message = "personId is mandatory")
    private  Long personId;
    private PersonResponseDto personResponseDto;
    private  Object extra;
    private Long pregnant;
    private Boolean breastFeeding;
    private Long relationWithIndexClient;
    private String capturedBy;

    private Object recency;


    //PRE TEST COUNSELING
    private  Object knowledgeAssessment;
    private  Object riskAssessment;
    private  Object tbScreening;
    private  Object stiScreening;
    private Object sexPartnerRiskAssessment;

    //Request & Result Form[
    private  Object test1;
    private  Object confirmatoryTest;
    private  Object tieBreakerTest;
    private String  hivTestResult;
    private Object syphilisTesting;
    private Object hepatitisTesting;
    private Object others;
    private Object cd4;

    //Second test if first test positive
    private  Object test2;
    private  Object confirmatoryTest2;
    private  Object tieBreakerTest2;
    private String  hivTestResult2;
    //Post Test Counseling
    private Object postTestCounselingKnowledgeAssessment;
    //index notification services - Elicitation
    private Object indexNotificationServicesElicitation;
    private String indexClientCode;
    public List<IndexElicitation> indexElicitation;
    private RiskStratificationResponseDto riskStratificationResponseDto;
    private String riskStratificationCode;
    private Boolean prepOffered;
    private Boolean prepAccepted;
    private String prepGiven;
    private String otherDrugs;
    private String source;
    private String referredForSti;
    private String comment;
    private String htsClientUUid;


}

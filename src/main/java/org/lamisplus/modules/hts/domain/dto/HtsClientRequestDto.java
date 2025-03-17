package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.lamisplus.modules.hts.domain.enums.Source;
import org.lamisplus.modules.patient.domain.dto.PersonDto;

import javax.persistence.Basic;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class HtsClientRequestDto {
    @NotBlank(message = "targetGroup is mandatory")
    private final String targetGroup;
    @NotBlank(message = "clientCode is mandatory")
    private final String clientCode;
    @NotNull(message = "dateVisit is mandatory")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private final LocalDate dateVisit;
    private final Long referredFrom;
    @NotBlank(message = "testingSetting is mandatory")
    private final String testingSetting;
    private final String riskStratificationCode;
    @NotNull(message = "firstTimeVisit is mandatory")
    private final Boolean firstTimeVisit;
    private final Integer numChildren;
    private final Integer numWives;
    @NotNull(message = "typeCounseling is mandatory")
    private final Long typeCounseling;
    @NotNull(message = "indexClient is mandatory")
    private final Boolean indexClient;
    private final String indexClientCode;
    @NotNull(message = "previouslyTested is mandatory")
    private final Boolean previouslyTested;
    private final Object extra;
    private Long personId;
    private PersonDto personDto;
    private final Long pregnant;
    private final Boolean breastFeeding;
    private final Long relationWithIndexClient;
    private String prepGiven;
    private boolean prepOffered;
    private boolean prepAccepted;
    private String otherDrugs;
    private String hivTestResult;
    private String ConfirmatoryTest2;
    private String source = Source.Web.toString();
    private String uuid;
    private String referredForSti;
    private String comment;
    @Basic
    private String longitude;
    @Basic
    private  String latitude;
    @Basic
    private String familyIndex;
    @Basic
    private String partnerNotificationService;
}

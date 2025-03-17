package org.lamisplus.modules.hts.domain.dto;

import lombok.*;

import javax.persistence.Basic;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;


@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class RiskStratificationResponseDto {
    private long id;
    private int age;
    private String entryPoint;
    private String testingSetting;
    private String modality;
    private String spokeFacility;
    private String healthFacility;

    private String targetGroup;
    private LocalDate dob;
    private String code;
    private LocalDate visitDate;
    private long personId;
    private String communityEntryPoint ;
    private  Object riskAssessment;
    private String source;
    @Basic
    private String longitude;
    @Basic
    private  String latitude;
}

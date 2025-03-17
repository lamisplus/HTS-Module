package org.lamisplus.modules.hts.domain.dto;

import lombok.*;
import org.lamisplus.modules.hts.domain.enums.Source;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class RiskStratificationDto {
    private Long id;
    @NotNull(message = "age is mandatory")
    private Integer age;
    @NotBlank(message = "entryPoint is mandatory")
    private String entryPoint;
    @NotBlank(message = "testingSetting is mandatory")
    private String testingSetting;
//    @NotBlank(message = "modality is mandatory")
    private String modality;

    private String  spokeFacility;
    private String healthFacility;

    @NotBlank(message = "targetGroup is mandatory")
    private String targetGroup;
    @NotNull(message = "visitDate is mandatory")
    private LocalDate visitDate;
    private LocalDate dob;
    private String code;
    private Long personId;
    private String communityEntryPoint ;
    private  Object riskAssessment;
    private String source = Source.Web.toString();
}

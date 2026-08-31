package org.lamisplus.modules.hts.domain.dto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@Data
public class HivstResultRequestDTO {
    @NotNull
    private Long encounterId;

    @NotNull
    @Min(0)
    private Integer reactiveGt15;

    @NotNull
    @Min(0)
    private Integer reactiveLe15;
}
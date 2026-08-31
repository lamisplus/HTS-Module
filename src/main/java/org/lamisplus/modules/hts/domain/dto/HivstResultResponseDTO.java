package org.lamisplus.modules.hts.domain.dto;

import lombok.Data;

@Data
public class HivstResultResponseDTO {
    private Long id;
    private String uuid;
    private Long encounterId;
    private Integer numberOfKits;
    private Integer reactiveGt15;
    private Integer reactiveLe15;
}
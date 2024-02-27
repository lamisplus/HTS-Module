package org.lamisplus.modules.hts.domain.dto;

import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import java.util.ArrayList;
import java.util.List;

@Data
public class HtsClientDtos {
    private Long personId;
    private Integer htsCount;
    private String clientCode;
    private PersonResponseDto personResponseDto;
    private List<HtsClientDto> htsClientDtoList;
    private Boolean hivPositive;
    private List<RiskStratificationResponseDto> riskStratificationResponseDtos = new ArrayList<>();
}

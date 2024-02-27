package org.lamisplus.modules.hts.domain.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class HtsRecencyDto {
    @NotNull(message = "htsClientId is mandatory")
    private final Long htsClientId;
    @NotNull(message = "personId is mandatory")
    private final Long personId;
    //Request & Result
    @NotNull(message = "recency is mandatory")
    private final Object recency;
}

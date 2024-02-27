package org.lamisplus.modules.hts.domain.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class PostTestCounselingDto {
    @NotNull(message = "htsClientId is mandatory")
    private final Long htsClientId;
    @NotNull(message = "personId is mandatory")
    private final Long personId;
    //Request & Result
    @NotNull(message = "post test counseling knowledge assessment test is mandatory")
    private final Object postTestCounselingKnowledgeAssessment;
}

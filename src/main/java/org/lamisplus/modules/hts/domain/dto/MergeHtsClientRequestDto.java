package org.lamisplus.modules.hts.domain.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class MergeHtsClientRequestDto {
    @NotNull(message = "Master HTS client ID is mandatory")
    private Long masterHtsClientId;

    @NotNull(message = "Duplicate HTS client IDs are mandatory")
    private List<Long> duplicateHtsClientIds;
}

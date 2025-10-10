package org.lamisplus.modules.hts.domain.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class MergeDuplicateRequestDto {
    @NotNull(message = "Master person ID is mandatory")
    private Long masterPersonId;

    @NotNull(message = "Duplicate person IDs are mandatory")
    private List<Long> duplicatePersonIds;
}

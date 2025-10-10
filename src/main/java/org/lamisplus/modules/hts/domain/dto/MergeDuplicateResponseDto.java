package org.lamisplus.modules.hts.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MergeDuplicateResponseDto {
    private String message;
    private Long masterPersonId;
    private Integer archivedCount;
}

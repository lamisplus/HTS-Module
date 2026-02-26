package org.lamisplus.modules.hts.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PatientHtsSummaryDto {
    private Long personId;
    private String firstName;
    private String surname;
    private String otherName;
    private String hospitalNumber;
    private Long encounterCount;
}
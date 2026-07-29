package org.lamisplus.modules.hts.domain.dto;

import lombok.Data;

@Data
public class HivstPatientSummaryDto {
    private Long patientId;
    private String firstName;
    private String surname;
    private String otherName;
    private String hospitalNumber;
    private String age;
    private String sex;
    private String phoneNumber;
    private String latestClientCode;
    private Long encounterCount;
    private Long resultCount;
}
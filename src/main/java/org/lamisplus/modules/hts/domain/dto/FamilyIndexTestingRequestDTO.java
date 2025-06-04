package org.lamisplus.modules.hts.domain.dto;

import lombok.*;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class FamilyIndexTestingRequestDTO {
    @NotNull(message = "htsClientId is mandatory")
    private Long htsClientId;
//    @NotNull(message = "htsClientUuid is mandatory")
    private String htsClientUuid;
    private Object extra;
    private String state;
    private String lga;
    private String facilityName;
    private LocalDate visitDate;
    private String setting;
    private String familyIndexClient;
    private String sex;
    @NotNull(message = "indexClient id is mandatory")
    private String indexClientId;
    private String name;
    private LocalDate dateOfBirth;
    private String age;
    private String maritalStatus;
    private String phoneNumber;
    private String alternatePhoneNumber;
    private LocalDate dateIndexClientConfirmedHivPositiveTestResult;
    private String virallyUnSuppressed;
    private String isClientCurrentlyOnHivTreatment;
    private String dateClientEnrolledOnTreatment;
    private String recencyTesting;
    private FamilyIndexRequestDto familyIndexRequestDto;
    private String willingToHaveChildrenTestedElseWhere;

    private String contactId;
}

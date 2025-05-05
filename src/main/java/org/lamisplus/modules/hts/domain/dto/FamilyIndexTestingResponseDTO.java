package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.lamisplus.modules.hts.domain.entity.FamilyIndex;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class FamilyIndexTestingResponseDTO {

    private Long id;
    private String uuid;
    private String htsClientUuid;
    private Long htsClientId;
    private Object extra;
    private String state;
    private String lga;
    private String facilityName;
    private String contactId;
    private LocalDate visitDate;
    private String setting;
    private String familyIndexClient;
    private String sex;
    private String indexClientId;
    private String name;
    private String middleName;
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
    private List<FamilyIndexResponseDTO> familyIndexList = new ArrayList<>();
    private String willingToHaveChildrenTestedElseWhere;

}

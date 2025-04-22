package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class FamilyIndexResponseDTO {
    private Long id;
    private String uuid;
    private String familyRelationship;
    private String statusOfContact;
    private String contactId;

    private int childNumber;
    private int otherChildNumber;
    private String motherDead;
    private String UAN;
    private LocalDate yearMotherDead;
    private String familyIndexTestingUuid;

    private LocalDate dateOfHts;
    private LocalDate dateOfBirth;
    private int age;
    private String firstName;
    private String lastName;
    private String middleName;
    private String childDead;
    private LocalDate yearChildDead;
    private String liveWithParent;
    private List<FamilyTestingTrackerResponseDTO> familyTestingTrackerResponseDTO;
    private Boolean isDateOfBirthEstimated;
    private String isHtsClient;
}

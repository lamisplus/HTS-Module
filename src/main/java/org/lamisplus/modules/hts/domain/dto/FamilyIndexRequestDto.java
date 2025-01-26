package org.lamisplus.modules.hts.domain.dto;

import lombok.*;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class FamilyIndexRequestDto {

    @NotBlank(message = "Family relationship is required")
    private String familyRelationship;

    @NotBlank(message = "Contact status is required")
    private String statusOfContact;

    @NotNull(message = "Child number is required")
    private int childNumber;
    private int otherChildNumber;

    private String motherDead;

    private LocalDate yearMotherDead;

    private String UAN;

    private LocalDate dateOfHts;
    private LocalDate dateOfBirth;
    private int age;
    private String firstName;
    private String lastName;
    private String middleName;
    private String childDead;
    private LocalDate yearChildDead;
    private String liveWithParent;
    private Boolean isDateOfBirthEstimated;
    private String isHtsClient;
    private FamilyTestingTrackerRequestDTO familyTestingTrackerRequestDTO;

}

package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class IctContactRequest {

    /** Frontend-generated human-readable contact ID */
    private String contactId;

    @NotBlank(message = "Name of contact is required")
    private String nameOfContact;

    @NotBlank(message = "Relationship to index client is required")
    private String relationshipToIndex;

    @NotBlank(message = "Contact sex is required")
    private String contactSex;

    @NotBlank(message = "Contact age group is required")
    private String contactAgeGroup;

    private String contactPhone;
    private String contactAddress;
    private Boolean sameAddressAsIndex;

    @NotBlank(message = "Notification method is required")
    private String notificationMethod;

    @NotBlank(message = "Follow-up location is required")
    private String followUpLocation;

    private Integer attempts;

    @NotBlank(message = "Known HIV positive status is required")
    private String knownHivPositive;

    // Conditional: required when knownHivPositive = No
    private String hivTestResult;

    // Required when knownHivPositive is Yes or No (date of test/previous test)
    private LocalDate dateTestedHiv;

    // Required when knownHivPositive = Yes OR hivTestResult = Positive
    private LocalDate dateEnrolledArt;

    // OVC fields: only applicable when contactAgeGroup = "<15"
    private Boolean enrolledInOvc;
    private LocalDate dateEnrolledOvc;
    private String ovcId;
}

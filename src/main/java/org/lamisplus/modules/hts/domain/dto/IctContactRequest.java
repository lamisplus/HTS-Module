package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class IctContactRequest {

    private String contactId;

    @NotBlank(message = "First name of contact is required")
    private String firstnameOfContact;

    private String middlenameOfContact;

    @NotBlank(message = "Surname of contact is required")
    private String surnameOfContact;

    @NotBlank(message = "Relationship to index client is required")
    private String relationshipToIndex;

    @NotBlank(message = "Contact sex is required")
    private String contactSex;

    @NotBlank(message = "Contact age group is required")
    private String contactAgeGroup;

    @NotNull(message = "Contact age is required")   // ← fixed: was @NotBlank
    private Integer contactAge;

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

    private String hivTestResult;
    private LocalDate dateTestedHiv;
    private LocalDate dateEnrolledArt;
    private String contactOnArt;
    private String contactArtClinic;

    private Boolean enrolledInOvc;
    private LocalDate dateEnrolledOvc;
    private String ovcId;
}
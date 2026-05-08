package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class IctContactRequest {

    // Renamed from contactId → contactCode (item 7)
    private String contactCode;

    // Renamed from firstnameOfContact → firstName (item 6)
    @NotBlank(message = "First name is required")
    private String firstName;

    // Renamed from middlenameOfContact → middleName (item 6)
    private String middleName;

    // Renamed from surnameOfContact → surname (item 6)
    @NotBlank(message = "Surname is required")
    private String surname;

    @NotBlank(message = "Relationship to index client is required")
    private String relationshipToIndex;

    // Renamed from contactSex → sex (item 6)
    @NotBlank(message = "Sex is required")
    private String sex;

    // contactAgeGroup REMOVED (item 5)
    // contactAge      REMOVED (item 5)

    // Renamed from contactPhone → phone (item 6)
    private String phone;

    // Renamed from contactAddress → address (item 6)
    private String address;

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

    // Renamed from contactOnArt → onArt (item 6)
    private String onArt;

    // Renamed from contactArtClinic → artClinic (item 6)
    private String artClinic;

    private Boolean enrolledInOvc;
    private LocalDate dateEnrolledOvc;
    private String ovcId;
}
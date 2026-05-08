package org.lamisplus.modules.hts.domain.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class IctContactResponse {
    private Long id;
    private UUID uuid;
    // Renamed from contactId → contactCode (item 7)
    private String contactCode;
    // Renamed from firstnameOfContact → firstName (item 6)
    private String firstName;
    // Renamed from middlenameOfContact → middleName (item 6)
    private String middleName;
    // Renamed from surnameOfContact → surname (item 6)
    private String surname;
    private String relationshipToIndex;
    // Renamed from contactSex → sex (item 6)
    private String sex;
    // contactAgeGroup REMOVED (item 5)
    // contactAge      REMOVED (item 5)
    // Renamed from contactPhone → phone (item 6)
    private String phone;
    // Renamed from contactAddress → address (item 6)
    private String address;
    private Boolean sameAddressAsIndex;
    private String notificationMethod;
    private String followUpLocation;
    private Integer attempts;
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
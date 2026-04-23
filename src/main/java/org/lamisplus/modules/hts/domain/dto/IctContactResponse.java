package org.lamisplus.modules.hts.domain.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class IctContactResponse {
    private Long id;
    private String uuid;
    private String contactId;
    private String firstnameOfContact;
    private String middlenameOfContact;
    private String surnameOfContact;
    private String relationshipToIndex;
    private String contactSex;
    private String contactAgeGroup;
    private Integer contactAge;
    private String contactPhone;
    private String contactAddress;
    private Boolean sameAddressAsIndex;
    private String notificationMethod;
    private String followUpLocation;
    private Integer attempts;
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

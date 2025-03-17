package org.lamisplus.modules.hts.domain.dto;

import lombok.*;
import org.lamisplus.modules.hts.domain.enums.Source;

import javax.persistence.Basic;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class IndexElicitationDto {
    @NotNull(message = "htsClientId is mandatory")
    private Long htsClientId;
    private LocalDate dob;
    private Boolean isDateOfBirthEstimated;
    private Long sex;
    private String address;
    private String lastName;
    private String firstName;
    private String middleName;
    private String phoneNumber;
    private String altPhoneNumber;
    private String hangOutSpots;
    private Long physicalHurt;
    private Long threatenToHurt;
    private Long notificationMethod;
    private Long partnerTestedPositive;
    private Long relationshipToIndexClient;
    private Long sexuallyUncomfortable;
    private Boolean currentlyLiveWithPartner;
    private LocalDate datePartnerCameForTesting;
    private String offeredIns;
    private String acceptedIns;
    private String source = Source.Web.toString();
    private  String uuid;
    @Basic
    private String longitude;
    @Basic
    private  String latitude;
}

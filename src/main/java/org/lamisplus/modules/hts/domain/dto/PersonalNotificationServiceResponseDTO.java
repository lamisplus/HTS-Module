package org.lamisplus.modules.hts.domain.dto;


import lombok.*;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PersonalNotificationServiceResponseDTO {

    @NotNull(message = "htsClientId is mandatory")
    private Long htsClientId;
    private Long id;
    private String offeredPns;
    private String acceptedPns;
    private String reasonForDecline;
    private String otherReasonForDecline;
    private LocalDate dob;
    private String indexClientId;
    private Long facilityId;
    private String lastName;
    private String firstName;
    private String middleName;
    private String uuid;
    private String htsClientUuid;
    private String notificationMethod;
    private String sex;
    private String address;
    private String phoneNumber;
    private  String alternatePhoneNumber;
    private Object contactTracing;
    private Object intermediatePartnerViolence;
    private String relationshipToIndexClient;
    private String knownHivPositive;
    private LocalDate datePartnerTested;
    private String hivTestResult;
    private String acceptedHts;
    private LocalDate dateEnrollmentOnART;
    private Object htsClientInformation;
    private String partnerId;
    private String familyIndex;
    private String partnerNotificationService;
    private PersonResponseDto personResponseDto;
    private String isHtsClient;

}

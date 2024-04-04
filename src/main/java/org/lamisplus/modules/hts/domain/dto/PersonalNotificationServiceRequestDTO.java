package org.lamisplus.modules.hts.domain.dto;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import javax.validation.constraints.NotNull;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PersonalNotificationServiceRequestDTO {
    @NotNull(message = "htsClientId is mandatory")
    private Long htsClientId;
    private String offeredPns;
    private String acceptedPns;
    private LocalDate dob;
    private String indexClientId;
    private Long facilityId;
    private String lastName;
    private String firstName;
    private String middleName;
    private String hivTreatment;
    private String notificationMethod;
    private String sex;
    private String address;
    private String phoneNumber;
    private Object contactTracing;
    private Object intermediatePartnerViolence;
    private String relationshipToIndexClient;
    private Boolean knownHivPositive;
    private LocalDate datePartnerTested;

    private String hivTestResult;
    private String acceptedHts;

    private LocalDate dateEnrollmentOnART;

}

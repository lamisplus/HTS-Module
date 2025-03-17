package org.lamisplus.modules.hts.domain.dto;


import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class FamilyTestingTrackerResponseDTO implements Serializable {

    private Long id;
    private String uuid;
    private Long familyIndex;
    private int positionOfChildEnumerated;
    private String trackerSex;
    private int trackerAge;
    private LocalDate scheduleVisitDate;
    private String followUpAppointmentLocation;
    private LocalDate dateVisit;
    private String knownHivPositive;
    private String hiveTestResult;
    private LocalDate dateTested;
    private LocalDate dateEnrolledOnArt;
    private LocalDate dateEnrolledInOVC;
    private String ovcId;
    private Long facilityId;
    private String familyIndexUuid;
    private Long familyIndexTestingId;
//    private Long familyIndexTestingId;
//    private String familyIndexTestingUuid;

    private String attempt;
}

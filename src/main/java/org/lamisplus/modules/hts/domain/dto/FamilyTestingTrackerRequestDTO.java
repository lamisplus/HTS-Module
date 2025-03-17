package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;

import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class FamilyTestingTrackerRequestDTO {
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
    private String attempt;
    private Long familyIndexId;
    private Long familyIndexTestingId;

}

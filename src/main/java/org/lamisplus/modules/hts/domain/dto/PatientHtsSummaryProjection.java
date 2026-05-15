package org.lamisplus.modules.hts.domain.dto;

public interface PatientHtsSummaryProjection {
    Long getPersonId();
    String getFirstName();
    String getSurname();
    String getOtherName();
    String getHospitalNumber();
    Long getEncounterCount();
}
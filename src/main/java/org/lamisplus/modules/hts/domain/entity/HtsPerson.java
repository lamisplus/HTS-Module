package org.lamisplus.modules.hts.domain.entity;

import lombok.*;

import java.time.LocalDate;

public interface HtsPerson {
    Long getPersonId();
    String getFirstName();
    String getSurname();
    String getOtherName();
    String getHospitalNumber();
    Integer getAge();
    String getGender();
    LocalDate getDateOfBirth();
    String getClientCode();
    String getPersonUuid();

    Integer getHtsCount();
}

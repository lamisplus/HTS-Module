package org.lamisplus.modules.hts.domain.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface HtsPersonPatientDuplicate {
    Long getHtsClientId();
    String getHospitalNumber();
    String getPersonUuid();
    Long getPersonId();
    String getFirstName();
    String getSurname();
    String getOtherName();
    LocalDate getDateOfBirth();
    LocalDate getDateOfRegistration();
    LocalDateTime getDateModified();
    Integer getAge();
    String getGender();
    String getPhoneNumber();
    LocalDateTime getHtsRegistrationDate();
    String getInHivEnrollment();
    String getHasArtCommencement();
    Integer getDuplicateCount();
    Integer getUniquePersonUuids();
    String getDuplicateHtsIds();
    Long getSuggestedMasterHtsId();
    String getSuggestedMasterUuid();
    Boolean getIsSuggestedMaster();
    Boolean getShouldArchive();
}

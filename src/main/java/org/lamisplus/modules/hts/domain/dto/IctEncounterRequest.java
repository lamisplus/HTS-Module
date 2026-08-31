package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
// @ValidIctEncounter ← REMOVED
public class IctEncounterRequest {

    @NotNull(message = "patientId is required - ICT must be linked to an existing patient")
    private Long patientId;

    @NotNull(message = "facilityId is required")
    private Long facilityId;

    private Long htsEncounterId;

    @NotNull(message = "dateOfService is required")
    private LocalDate dateOfService;

    private String setting;
    private String facilitySetting;
    private String communityEntryPoint;
    private String artClinic;

    private String indexClientId;
    private String artUniqueId;
    private String indexFirstName;
    private String indexMiddleName;
    private String indexSurname;
    private String indexSex;
    private LocalDate indexDob;
    private Integer indexAge;
    private String indexPhone;
    private String indexAltPhone;
    private String indexAddress;
    private String facilityName;
    private String state;
    private String lga;

    private String clientCategory;
    private String clientCategoryOther;
    private String offeredPns;
    private String acceptedPns;

    @Valid
    private List<IctContactRequest> contacts = new ArrayList<>();
}
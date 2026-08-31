package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class HivstEncounterRequestDTO {

    @NotNull(message = "patientId is required")
    private Long patientId;

    @NotNull(message = "dateOfVisit is required")
    private LocalDate dateOfVisit;

    @NotBlank(message = "clientCode is required")
    private String clientCode;

    @NotNull(message = "facilityId is required")
    private Long facilityId;

    @NotBlank(message = "setting is required")
    private String setting;


    private String facilitySetting;
    private String communityEntryPoint;
    private String typeOfSession;
    private String htsPopulationType;
    private String indexTesting;
    private String indexRelationship;
    private String indexClientCode;


    private Integer numberOfWives;
    private Integer numberOfCoWives;
    private Integer numberOfBiologicalChildren;
    private String pregnancyStatus;
    private String breastfeedingDuration;


    private String hivTestKitsProvided;
    private String categoryOfClients;
    private Integer numberOfHivstKitDistributed;
    private String completedBy;
    private String designation;

    private String longitude;
    private String latitude;
}
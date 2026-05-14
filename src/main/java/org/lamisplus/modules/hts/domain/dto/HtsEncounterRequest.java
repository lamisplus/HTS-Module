package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonDto;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
// @ValidHtsEncounter  ← REMOVED
public class HtsEncounterRequest {

    private Long patientId;

    @Valid
    private PersonDto person;

    @NotNull(message = "dateOfVisit is required")
    private LocalDate dateOfVisit;

    @NotBlank(message = "clientCode is required")
    private String clientCode;

    @NotBlank(message = "setting is required")
    private String setting;

    private String facilitySetting;
    private String facilityName;
    private Long facilityId;
    private String communityEntryPoint;
    private String modality;
    private String typeOfSession;
    private String indexTesting;
    private String indexRelationship;
    private String indexClientCode;

    private String surname;
    private String firstName;
    private String middleName;
    private String dobType;
    private LocalDate dateOfBirth;
    private Integer age;
    private String sex;
    private String phoneNumber;
    private String maritalStatus;
    private Integer numberOfWives;
    private Integer numberOfCoWives;
    private Integer numberOfBiologicalChildren;
    private String pregnancyStatus;
    private String breastfeedingDuration;
    private String clientState;
    private String clientLga;
    private String address;
    private String landmark;

    private String previouslyTestedNegative;
    private String timeOfLastNegativeTest;
    private String clientInformedTransmissionRoutes;
    private String clientInformedRiskFactors;
    private String clientInformedPreventionMethods;
    private String clientInformedPossibleResults;
    private String informedConsentGiven;

    private String everHadSexualIntercourse;
    private String moreThanOneSexPartner;
    private String unprotectedVaginalSex;
    private String unprotectedAnalSex;
    private String bloodTransfusionLast3Months;
    private String sexUnderInfluence;
    private String historyOfSTI;

    private String currentCough;
    private String weightLoss;
    private String fever;
    private String nightSweats;

    private String complaintsVaginalDischarge;
    private String complaintsLowerAbdominalPain;
    private String complaintsUrethralDischarge;
    private String complaintsScroralSwelling;
    private String complaintsGenitalSores;
    private String complaintsSwollenLymphNodes;

    private String partnerNewlyDiagnosed;
    private String partnerPregnantOnArv;
    private String adolescentHivPositive;
    private String partnerNotRegularlyOnDrugs;
    private String partnerRecentlyReturnedToTreatment;
    private String hadSexWithHivPositivePartnerInRiskGroup;

    private String typeOfHivTestDone;
    private String initialHivTest;
    private String suspectedAcuteInfection;
    private String confirmatoryHivTest;
    private String finalHivTestResult;
    private String syphilisTestResult;
    private String recencyTest;
    private String hivEarlyDetectResult;

    private String previouslyTestedThisYear;
    private String clientReceivedTestResult;
    private String hivTestKitsProvided;
    private String categoryOfClients;
    private String acceptedIndexTesting;
    private String providedFpInfo;
    private String clientPartnerUseFpMethods;
    private String clientPartnerUseCondoms;
    private String correctCondomUseDemonstrated;
    private String condomsProvided;
    private String clientReferredToOtherServices;
    private String completedBy;
    private String designation;
    private Boolean pmtctHts = false;

    private String source;
    private String longitude;
    private String latitude;
}
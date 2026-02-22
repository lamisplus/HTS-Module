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
public class HtsEncounterRequest {

    // Reference to existing person (if any)
    private Long personId;

    // For new person creation (required when personId is null)
    @Valid
    private PersonDto person;

    // --- Core encounter fields (all will be stored in JSON) ---
    @NotNull(message = "dateOfVisit is required")
    private LocalDate dateOfVisit;

    @NotBlank(message = "clientCode is required")
    private String clientCode;

    @NotBlank(message = "setting is required")
    private String setting;

    private String facilitySetting;
    private String facilityName;
    private String communityEntryPoint;
    private String modality;
    private String typeOfSession;
    private String indexTesting;
    private String indexRelationship;
    private String indexClientCode;

    // Demographics (also stored in JSON, but used for validation)
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

    // Pre-test counselling: Knowledge Assessment
    private String previouslyTestedNegative;
    private String timeOfLastNegativeTest;
    private String clientInformedTransmissionRoutes;
    private String clientInformedRiskFactors;
    private String clientInformedPreventionMethods;
    private String clientInformedPossibleResults;
    private String informedConsentGiven;

    // Pre-test counselling: Personal HIV Risk Assessment
    private String everHadSexualIntercourse;
    private String moreThanOneSexPartner;
    private String unprotectedVaginalSex;
    private String unprotectedAnalSex;
    private String bloodTransfusionLast3Months;
    private String sexUnderInfluence;
    private String historyOfSTI;

    // TB Screening
    private String currentCough;
    private String weightLoss;
    private String fever;
    private String nightSweats;

    // STI Screening
    private String complaintsVaginalDischarge;
    private String complaintsLowerAbdominalPain;
    private String complaintsUrethralDischarge;
    private String complaintsScroralSwelling;
    private String complaintsGenitalSores;
    private String complaintsSwollenLymphNodes;

    // Sex Partner Risk Assessment
    private String partnerNewlyDiagnosed;
    private String partnerPregnantOnArv;
    private String adolescentHivPositive;
    private String partnerNotRegularlyOnDrugs;
    private String partnerRecentlyReturnedToTreatment;

    // Diagnostic Testing
    private String hivEarlyDetectResult;
    private String initialHivTest;
    private String suspectedAcuteInfection;
    private String confirmatoryHivTest;
    private String syphilisTestResult;
    private String recencyTest;

    // Post-Test Counselling
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
}
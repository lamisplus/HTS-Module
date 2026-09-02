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

public class HtsEncounterRequestDTO {

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
    private String htsPopulationType;
    private String indexTesting;
    private String indexRelationship;
    private String indexClientCode;
    private Integer numberOfWives;
    private Integer numberOfCoWives;
    private Integer numberOfBiologicalChildren;
    private String pregnancyStatus;
    private String breastfeedingDuration;
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
    private String dateOfFinalHivTestDone;
    private String syphilisTestResult;
    private String recencyTest;
    private String hivEarlyDetectResult;
    private String previouslyTestedThisYear;
    private String clientReceivedTestResult;
    private String hivTestKitsProvided;
    private String categoryOfClients;
    private Integer numberOfHivstKitDistributed;
    private String acceptedIndexTesting;
    private String providedFpInfo;
    private String clientPartnerUseFpMethods;
    private String clientPartnerUseCondoms;
    private String correctCondomUseDemonstrated;
    private String condomsProvided;
    private String clientReferredToOtherServices;
    private String completedBy;
    private String designation;
    // No default here on purpose: create() falls back to false explicitly when this is
    // omitted, and update()'s "if (request.getPmtctHts() != null)" guard depends on an
    // omitted field genuinely deserializing to null - defaulting it to false here made
    // that guard always pass, silently clearing pmtctHts on every edit that doesn't send it
    // (e.g. the HTS edit form, which has no field for it at all).
    // No default here on purpose: create() falls back to false explicitly when this is
    // omitted, and update()'s "if (request.getPmtctHts() != null)" guard depends on an
    // omitted field genuinely deserializing to null - defaulting it to false here made
    // that guard always pass, silently clearing pmtctHts on every edit that doesn't send it
    // (e.g. the HTS edit form, which has no field for it at all).
    private Boolean pmtctHts;
    // Sent by PMTCT alongside pmtctHts=true when the client's positive status was already
    // known prior to this encounter - used in HtsEncounterService to bypass the "only one
    // active positive result" rule for that specific case. Expected as a plain "Yes"/"No"
    // string (matched case-insensitively), not one of this app's internal codeset codes,
    // since PMTCT is an external producer.
    private String previouslyKnownHivPositive;

    // ---- PMTCT-only fields below (from PMTCT_vs_HTS_field_comparison.xlsx audit) ----
    // All optional/nullable, no validation - HTS itself never sends any of these, only
    // PMTCT does. Field names match PMTCT's observation JSON keys EXACTLY (including
    // testEntryPoint/testSetting, which intentionally duplicate the values already mapped
    // into the shared setting/facilitySetting/communityEntryPoint fields elsewhere, and
    // dateoffinalHivTestResult, whose unconventional casing is intentional and exact - not
    // a typo, not to be confused with the existing dateOfFinalHivTestDone field) so that
    // PMTCT's existing GET-side consumers keep working against these observation keys
    // unchanged.
    private String pmtctCycleUuid;
    private String testingType;
    private String pmtctTestEntryPoint;
    private String testEntryPoint;
    private String testSetting;
    private String stageOfPregnancy;
    private String pregnancyStatusAtEntry;
    private String hospitalNumber;
    private String enrolledOnArt;
    private String initiatedOnProphylaxis;
    private String viralLoadMonitoring;
    private String hivEarlyDetectViralLoad;
    private String confirmatoryFromSpokes;
    private String tbScreeningStatus;
    private String tbReferred;
    private String hepatitisC;
    private String dateoffinalHivTestResult;

    private SyphilisInfoDto syphilisInfo;
    private HbvInfoDto hbvInfo;
    private PartnerInfoDto partnerInfo;
    private String source ="Web";
    private String longitude;
    private String latitude;
}
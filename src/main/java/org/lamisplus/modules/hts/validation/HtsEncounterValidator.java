package org.lamisplus.modules.hts.validation;

import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.hts.domain.dto.HtsEncounterRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.time.Period;

@Component
@Slf4j
public class HtsEncounterValidator implements ConstraintValidator<ValidHtsEncounter, HtsEncounterRequest> {

    @Value("${hts.encounter.validation.enabled:true}")
    private boolean validationEnabled;

    @Override
    public boolean isValid(HtsEncounterRequest request, ConstraintValidatorContext context) {
        if (!validationEnabled) {
            return true; // skip all elaborate validation
        }

        boolean valid = true;

        // --- Demographics validation (only if personId is null, i.e., new person) ---
        if (request.getPersonId() == null) {
            // Number of wives required for married males
            if ("Male".equalsIgnoreCase(request.getSex()) && "Married".equalsIgnoreCase(request.getMaritalStatus())) {
                if (request.getNumberOfWives() == null || request.getNumberOfWives() < 1) {
                    context.buildConstraintViolationWithTemplate("Number of wives is required and must be at least 1")
                            .addPropertyNode("numberOfWives").addConstraintViolation();
                    valid = false;
                }
            }

            // Number of co-wives required for married females
            if ("Female".equalsIgnoreCase(request.getSex()) && "Married".equalsIgnoreCase(request.getMaritalStatus())) {
                if (request.getNumberOfCoWives() == null || request.getNumberOfCoWives() < 0) {
                    context.buildConstraintViolationWithTemplate("Number of co-wives is required")
                            .addPropertyNode("numberOfCoWives").addConstraintViolation();
                    valid = false;
                }
            }

            // Pregnancy status required for females
            if ("Female".equalsIgnoreCase(request.getSex()) && request.getPregnancyStatus() == null) {
                context.buildConstraintViolationWithTemplate("Pregnancy status is required for female clients")
                        .addPropertyNode("pregnancyStatus").addConstraintViolation();
                valid = false;
            }

            // Breastfeeding duration required when pregnancyStatus == Breastfeeding
            if ("Breastfeeding".equalsIgnoreCase(request.getPregnancyStatus()) && request.getBreastfeedingDuration() == null) {
                context.buildConstraintViolationWithTemplate("Duration of breastfeeding is required")
                        .addPropertyNode("breastfeedingDuration").addConstraintViolation();
                valid = false;
            }

            // Date of birth validation based on dobType
            if ("Actual".equalsIgnoreCase(request.getDobType())) {
                if (request.getDateOfBirth() == null) {
                    context.buildConstraintViolationWithTemplate("Date of birth is required when dobType is Actual")
                            .addPropertyNode("dateOfBirth").addConstraintViolation();
                    valid = false;
                } else if (request.getDateOfBirth().isAfter(LocalDate.now())) {
                    context.buildConstraintViolationWithTemplate("Date of birth cannot be in the future")
                            .addPropertyNode("dateOfBirth").addConstraintViolation();
                    valid = false;
                }
            } else if ("Estimated".equalsIgnoreCase(request.getDobType())) {
                if (request.getAge() == null) {
                    context.buildConstraintViolationWithTemplate("Age is required when dobType is Estimated")
                            .addPropertyNode("age").addConstraintViolation();
                    valid = false;
                } else if (request.getAge() < 0 || request.getAge() > 130) {
                    context.buildConstraintViolationWithTemplate("Age must be between 0 and 130")
                            .addPropertyNode("age").addConstraintViolation();
                    valid = false;
                }
            } else {
                context.buildConstraintViolationWithTemplate("dobType must be Actual or Estimated")
                        .addPropertyNode("dobType").addConstraintViolation();
                valid = false;
            }

            // Phone number basic check (if provided)
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().matches("^[0-9]{10,11}$")) {
                context.buildConstraintViolationWithTemplate("Phone number must be 10 or 11 digits")
                        .addPropertyNode("phoneNumber").addConstraintViolation();
                valid = false;
            }
        }

        // --- Facility/Community conditional ---
        if ("Facility".equalsIgnoreCase(request.getSetting())) {
            if (request.getFacilitySetting() == null || request.getFacilitySetting().trim().isEmpty()) {
                context.buildConstraintViolationWithTemplate("Facility setting is required when setting is Facility")
                        .addPropertyNode("facilitySetting").addConstraintViolation();
                valid = false;
            }
        } else if ("Community".equalsIgnoreCase(request.getSetting())) {
            if (request.getCommunityEntryPoint() == null || request.getCommunityEntryPoint().trim().isEmpty()) {
                context.buildConstraintViolationWithTemplate("Community entry point is required when setting is Community")
                        .addPropertyNode("communityEntryPoint").addConstraintViolation();
                valid = false;
            }
        }

        // --- Index testing conditional ---
        if ("index contact testing".equalsIgnoreCase(request.getTypeOfSession())) {
            if (request.getIndexTesting() == null) {
                context.buildConstraintViolationWithTemplate("Please indicate whether this is index testing")
                        .addPropertyNode("indexTesting").addConstraintViolation();
                valid = false;
            } else if ("Yes".equalsIgnoreCase(request.getIndexTesting())) {
                if (request.getIndexRelationship() == null || request.getIndexRelationship().trim().isEmpty()) {
                    context.buildConstraintViolationWithTemplate("Relationship of index client is required")
                            .addPropertyNode("indexRelationship").addConstraintViolation();
                    valid = false;
                }
                if (request.getIndexClientCode() == null || request.getIndexClientCode().trim().isEmpty()) {
                    context.buildConstraintViolationWithTemplate("Index client code/ID is required")
                            .addPropertyNode("indexClientCode").addConstraintViolation();
                    valid = false;
                }
            }
        }

        // --- Determine if Knowledge & Risk blocks should be skipped ---
        boolean skipKnowledge = false;
        if ("PMTCT".equalsIgnoreCase(request.getModality())) {
            skipKnowledge = true;
        } else {
            Integer age = resolveAge(request);
            if (age != null && age <= 15) {
                skipKnowledge = true;
            }
        }

        // --- Knowledge Assessment ---
        if (!skipKnowledge) {
            if (request.getPreviouslyTestedNegative() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("previouslyTestedNegative").addConstraintViolation();
                valid = false;
            }
            if ("Yes".equalsIgnoreCase(request.getPreviouslyTestedNegative()) && request.getTimeOfLastNegativeTest() == null) {
                context.buildConstraintViolationWithTemplate("Time of last negative test is required")
                        .addPropertyNode("timeOfLastNegativeTest").addConstraintViolation();
                valid = false;
            }
            if (request.getClientInformedTransmissionRoutes() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("clientInformedTransmissionRoutes").addConstraintViolation();
                valid = false;
            }
            if (request.getClientInformedRiskFactors() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("clientInformedRiskFactors").addConstraintViolation();
                valid = false;
            }
            if (request.getClientInformedPreventionMethods() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("clientInformedPreventionMethods").addConstraintViolation();
                valid = false;
            }
            if (request.getClientInformedPossibleResults() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("clientInformedPossibleResults").addConstraintViolation();
                valid = false;
            }
            if (request.getInformedConsentGiven() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("informedConsentGiven").addConstraintViolation();
                valid = false;
            }
        }

        // --- Personal HIV Risk Assessment ---
        if (!skipKnowledge) {
            if (request.getEverHadSexualIntercourse() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("everHadSexualIntercourse").addConstraintViolation();
                valid = false;
            }
            if ("Yes".equalsIgnoreCase(request.getEverHadSexualIntercourse())) {
                if (request.getMoreThanOneSexPartner() == null) {
                    context.buildConstraintViolationWithTemplate("This field is required")
                            .addPropertyNode("moreThanOneSexPartner").addConstraintViolation();
                    valid = false;
                }
                if (request.getUnprotectedVaginalSex() == null) {
                    context.buildConstraintViolationWithTemplate("This field is required")
                            .addPropertyNode("unprotectedVaginalSex").addConstraintViolation();
                    valid = false;
                }
                if (request.getUnprotectedAnalSex() == null) {
                    context.buildConstraintViolationWithTemplate("This field is required")
                            .addPropertyNode("unprotectedAnalSex").addConstraintViolation();
                    valid = false;
                }
                if (request.getSexUnderInfluence() == null) {
                    context.buildConstraintViolationWithTemplate("This field is required")
                            .addPropertyNode("sexUnderInfluence").addConstraintViolation();
                    valid = false;
                }
                if (request.getHistoryOfSTI() == null) {
                    context.buildConstraintViolationWithTemplate("This field is required")
                            .addPropertyNode("historyOfSTI").addConstraintViolation();
                    valid = false;
                }
            }
            if (request.getBloodTransfusionLast3Months() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("bloodTransfusionLast3Months").addConstraintViolation();
                valid = false;
            }
        }

        // --- TB Screening (always required) ---
        if (request.getCurrentCough() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("currentCough").addConstraintViolation();
            valid = false;
        }
        if (request.getWeightLoss() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("weightLoss").addConstraintViolation();
            valid = false;
        }
        if (request.getFever() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("fever").addConstraintViolation();
            valid = false;
        }
        if (request.getNightSweats() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("nightSweats").addConstraintViolation();
            valid = false;
        }

        // --- STI Screening (sex‑conditional) ---
        if ("Female".equalsIgnoreCase(request.getSex())) {
            if (request.getComplaintsVaginalDischarge() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("complaintsVaginalDischarge").addConstraintViolation();
                valid = false;
            }
            if (request.getComplaintsLowerAbdominalPain() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("complaintsLowerAbdominalPain").addConstraintViolation();
                valid = false;
            }
        } else if ("Male".equalsIgnoreCase(request.getSex())) {
            if (request.getComplaintsUrethralDischarge() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("complaintsUrethralDischarge").addConstraintViolation();
                valid = false;
            }
            if (request.getComplaintsScroralSwelling() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("complaintsScroralSwelling").addConstraintViolation();
                valid = false;
            }
        }
        if (request.getComplaintsGenitalSores() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("complaintsGenitalSores").addConstraintViolation();
            valid = false;
        }
        if (request.getComplaintsSwollenLymphNodes() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("complaintsSwollenLymphNodes").addConstraintViolation();
            valid = false;
        }

        // --- Sex Partner Risk Assessment (requires everHadSexualIntercourse=Yes and not skip) ---
        if (!skipKnowledge && "Yes".equalsIgnoreCase(request.getEverHadSexualIntercourse())) {
            if (request.getPartnerNewlyDiagnosed() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("partnerNewlyDiagnosed").addConstraintViolation();
                valid = false;
            }
            if (request.getPartnerPregnantOnArv() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("partnerPregnantOnArv").addConstraintViolation();
                valid = false;
            }
            if (request.getAdolescentHivPositive() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("adolescentHivPositive").addConstraintViolation();
                valid = false;
            }
            if (request.getPartnerNotRegularlyOnDrugs() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("partnerNotRegularlyOnDrugs").addConstraintViolation();
                valid = false;
            }
            if (request.getPartnerRecentlyReturnedToTreatment() == null) {
                context.buildConstraintViolationWithTemplate("This field is required")
                        .addPropertyNode("partnerRecentlyReturnedToTreatment").addConstraintViolation();
                valid = false;
            }
        }

        // --- Diagnostic Testing ---
        if (request.getInitialHivTest() == null) {
            context.buildConstraintViolationWithTemplate("Initial HIV test result is required")
                    .addPropertyNode("initialHivTest").addConstraintViolation();
            valid = false;
        }
        if ("Negative".equalsIgnoreCase(request.getInitialHivTest()) && request.getSuspectedAcuteInfection() == null) {
            context.buildConstraintViolationWithTemplate("This field is required when initial test is Negative")
                    .addPropertyNode("suspectedAcuteInfection").addConstraintViolation();
            valid = false;
        }
        if ("Positive".equalsIgnoreCase(request.getInitialHivTest())) {
            if (request.getConfirmatoryHivTest() == null) {
                context.buildConstraintViolationWithTemplate("Confirmatory HIV test is required for positive results")
                        .addPropertyNode("confirmatoryHivTest").addConstraintViolation();
                valid = false;
            }
            if (request.getRecencyTest() == null) {
                context.buildConstraintViolationWithTemplate("Recency test is required for positive clients")
                        .addPropertyNode("recencyTest").addConstraintViolation();
                valid = false;
            }
        }

        // --- Post-Test Counselling (all required) ---
        if (request.getPreviouslyTestedThisYear() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("previouslyTestedThisYear").addConstraintViolation();
            valid = false;
        }
        if (request.getClientReceivedTestResult() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("clientReceivedTestResult").addConstraintViolation();
            valid = false;
        }
        if (request.getHivTestKitsProvided() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("hivTestKitsProvided").addConstraintViolation();
            valid = false;
        }
        if (request.getCategoryOfClients() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("categoryOfClients").addConstraintViolation();
            valid = false;
        }
        if (request.getAcceptedIndexTesting() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("acceptedIndexTesting").addConstraintViolation();
            valid = false;
        }
        if (request.getProvidedFpInfo() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("providedFpInfo").addConstraintViolation();
            valid = false;
        }
        if (request.getClientPartnerUseFpMethods() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("clientPartnerUseFpMethods").addConstraintViolation();
            valid = false;
        }
        if (request.getClientPartnerUseCondoms() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("clientPartnerUseCondoms").addConstraintViolation();
            valid = false;
        }
        if (request.getCorrectCondomUseDemonstrated() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("correctCondomUseDemonstrated").addConstraintViolation();
            valid = false;
        }
        if (request.getCondomsProvided() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("condomsProvided").addConstraintViolation();
            valid = false;
        }
        if (request.getClientReferredToOtherServices() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("clientReferredToOtherServices").addConstraintViolation();
            valid = false;
        }
        if (request.getCompletedBy() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("completedBy").addConstraintViolation();
            valid = false;
        }
        if (request.getDesignation() == null) {
            context.buildConstraintViolationWithTemplate("This field is required")
                    .addPropertyNode("designation").addConstraintViolation();
            valid = false;
        }

        if (!valid) {
            context.disableDefaultConstraintViolation();
        }
        return valid;
    }

    private Integer resolveAge(HtsEncounterRequest request) {
        if ("Estimated".equalsIgnoreCase(request.getDobType())) {
            return request.getAge();
        } else if (request.getDateOfBirth() != null) {
            return Period.between(request.getDateOfBirth(), LocalDate.now()).getYears();
        }
        return null;
    }
}
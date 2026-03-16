package org.lamisplus.modules.hts.validation;

import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.hts.domain.dto.IctContactRequest;
import org.lamisplus.modules.hts.domain.dto.IctEncounterRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.util.List;

@Component
@Slf4j
public class IctEncounterValidator implements ConstraintValidator<ValidIctEncounter, IctEncounterRequest> {

    @Value("${ict.encounter.validation.enabled:true}")
    private boolean validationEnabled;

    @Override
    public boolean isValid(IctEncounterRequest request, ConstraintValidatorContext context) {
        if (!validationEnabled) return true;

        boolean valid = true;
        context.disableDefaultConstraintViolation();

        // ── Section A: Setting ────────────────────────────────────────────────
        if (request.getSetting() != null) {
            if ("Facility".equalsIgnoreCase(request.getSetting())) {
                if (isBlank(request.getFacilitySetting())) {
                    addViolation(context, "Facility setting is required when setting is Facility", "facilitySetting");
                    valid = false;
                }
            } else if ("Community".equalsIgnoreCase(request.getSetting())) {
                if (isBlank(request.getCommunityEntryPoint())) {
                    addViolation(context, "Community entry point is required when setting is Community", "communityEntryPoint");
                    valid = false;
                }
            }
        }

        // ── Section A: Client Category ────────────────────────────────────────
        if ("Other".equalsIgnoreCase(request.getClientCategory())) {
            if (isBlank(request.getClientCategoryOther())) {
                addViolation(context, "Please specify the client category", "clientCategoryOther");
                valid = false;
            }
        }

        // ── Section A: PNS fields ─────────────────────────────────────────────
        if (isBlank(request.getOfferedPns())) {
            addViolation(context, "offeredPns is required", "offeredPns");
            valid = false;
        }

        if ("Yes".equalsIgnoreCase(request.getOfferedPns())) {
            if (isBlank(request.getAcceptedPns())) {
                addViolation(context, "acceptedPns is required when PNS was offered", "acceptedPns");
                valid = false;
            }
        }

        // ── Section B: Contacts (only validate when PNS offered AND accepted) ─
        boolean contactsRequired =
                "Yes".equalsIgnoreCase(request.getOfferedPns()) &&
                "Yes".equalsIgnoreCase(request.getAcceptedPns());

        if (contactsRequired) {
            List<IctContactRequest> contacts = request.getContacts();
            if (contacts == null || contacts.isEmpty()) {
                addViolation(context,
                        "At least one contact must be added when client has accepted PNS",
                        "contacts");
                valid = false;
            } else {
                for (int i = 0; i < contacts.size(); i++) {
                    valid = validateContact(contacts.get(i), i, context) && valid;
                }
            }
        }

        return valid;
    }

    // ── Per-contact cross-field validation ────────────────────────────────────
    private boolean validateContact(IctContactRequest c, int index, ConstraintValidatorContext context) {
        boolean valid = true;
        String prefix = "contacts[" + index + "].";

        // Phone: digits only, 10-11 chars (if provided)
        if (!isBlank(c.getContactPhone()) && !c.getContactPhone().matches("^[0-9]{10,11}$")) {
            addViolation(context,
                    "Contact phone number must be 10 or 11 digits",
                    prefix + "contactPhone");
            valid = false;
        }

        // Dates must not be in the future
        if (c.getDateTestedHiv() != null && c.getDateTestedHiv().isAfter(LocalDate.now())) {
            addViolation(context, "Date tested for HIV cannot be in the future", prefix + "dateTestedHiv");
            valid = false;
        }
        if (c.getDateEnrolledArt() != null && c.getDateEnrolledArt().isAfter(LocalDate.now())) {
            addViolation(context, "Date enrolled on ART cannot be in the future", prefix + "dateEnrolledArt");
            valid = false;
        }

        // Known HIV Positive = Yes → dateTestedHiv and dateEnrolledArt required
        if ("Yes".equalsIgnoreCase(c.getKnownHivPositive())) {
            if (c.getDateTestedHiv() == null) {
                addViolation(context, "Date previously tested for HIV is required", prefix + "dateTestedHiv");
                valid = false;
            }
            if (c.getDateEnrolledArt() == null) {
                addViolation(context, "Date enrolled on ART is required for known positive contact", prefix + "dateEnrolledArt");
                valid = false;
            }
        }

        // Known HIV Positive = No → hivTestResult and dateTestedHiv required
        if ("No".equalsIgnoreCase(c.getKnownHivPositive())) {
            if (isBlank(c.getHivTestResult())) {
                addViolation(context, "HIV test result is required for this contact", prefix + "hivTestResult");
                valid = false;
            }
            if (c.getDateTestedHiv() == null) {
                addViolation(context, "Date partner tested is required", prefix + "dateTestedHiv");
                valid = false;
            }
            // HIV test result = Positive → dateEnrolledArt required
            if ("Positive".equalsIgnoreCase(c.getHivTestResult()) && c.getDateEnrolledArt() == null) {
                addViolation(context, "Date enrolled on ART is required when HIV test is Positive", prefix + "dateEnrolledArt");
                valid = false;
            }
        }

        // OVC fields: only when contactAgeGroup = "<15"
        if ("<15".equals(c.getContactAgeGroup())) {
            if (Boolean.TRUE.equals(c.getEnrolledInOvc())) {
                if (c.getDateEnrolledOvc() == null) {
                    addViolation(context, "Date enrolled in OVC is required", prefix + "dateEnrolledOvc");
                    valid = false;
                }
                if (isBlank(c.getOvcId())) {
                    addViolation(context, "OVC ID is required", prefix + "ovcId");
                    valid = false;
                }
                if (c.getDateEnrolledOvc() != null && c.getDateEnrolledOvc().isAfter(LocalDate.now())) {
                    addViolation(context, "Date enrolled in OVC cannot be in the future", prefix + "dateEnrolledOvc");
                    valid = false;
                }
            }
        }

        return valid;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private void addViolation(ConstraintValidatorContext context, String message, String field) {
        context.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(field)
                .addConstraintViolation();
    }
}

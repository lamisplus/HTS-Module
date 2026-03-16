package org.lamisplus.modules.hts.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.lamisplus.modules.hts.validation.ValidIctEncounter;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@ValidIctEncounter
public class IctEncounterRequest {

    // ── Person linkage ────────────────────────────────────────────────────────
    /**
     * Always required. ICT is always for a person already in the system
     * (either registered via HTS new patient flow, or an existing patient).
     */
    @NotNull(message = "personId is required — ICT must be linked to an existing person")
    private Long personId;

    /**
     * Facility where this ICT encounter takes place.
     * Sent by the frontend as currentOrganisationUnitId — same pattern as HTS.
     */
    @NotNull(message = "facilityId is required")
    private Long facilityId;

    /**
     * Optional. The HTS encounter that triggered this ICT session.
     * Present for Newly Diagnosed path (HTS → ICT orchestrator).
     * Null for Virally Unsuppressed / RTT paths triggered from ART module.
     */
    private Long htsEncounterId;

    // ── Section A — Visit & Setting ───────────────────────────────────────────
    @NotNull(message = "dateOfService is required")
    private LocalDate dateOfService;

    private String setting;
    private String facilitySetting;
    private String communityEntryPoint;
    private String artClinic;

    // ── Section A — Index Client Snapshot ────────────────────────────────────
    // These fields snapshot the index client's identity at time of ICT.
    // They are stored in the JSONB data column (not individual DB columns)
    // because they are read-only context, not independently queryable fields.
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

    // ── Section A — Client Category & PNS ────────────────────────────────────
    /**
     * Newly Diagnosed / Virally Unsuppressed / RTT (after IIT) / Other
     * Stored as a column for reporting.
     */
    private String clientCategory;
    private String clientCategoryOther;

    /**
     * Was PNS offered to this index client?
     * Stored as a column. Drives Section B availability.
     */
    private String offeredPns;

    /**
     * Did the client accept PNS?
     * Only present (and required) when offeredPns = Yes.
     */
    private String acceptedPns;

    // ── Section B — Contacts ──────────────────────────────────────────────────
    /**
     * List of contacts elicited.
     * Only populated (and validated) when offeredPns = Yes AND acceptedPns = Yes.
     * Each contact is persisted as a separate IctContact row.
     */
    @Valid
    private List<IctContactRequest> contacts = new ArrayList<>();
}
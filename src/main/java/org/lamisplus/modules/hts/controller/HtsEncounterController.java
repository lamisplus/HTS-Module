package org.lamisplus.modules.hts.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.base.util.PaginationUtil;
import org.lamisplus.modules.hts.domain.dto.HtsEncounterRequestDTO;
import org.lamisplus.modules.hts.domain.dto.HtsEncounterResponse;
import org.lamisplus.modules.hts.domain.dto.PatientHtsSummaryDto;
import org.lamisplus.modules.hts.service.HtsEncounterService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.lamisplus.modules.hts.domain.dto.HtsPatientSummaryDto;
import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hts-encounter")
@RequiredArgsConstructor
public class HtsEncounterController {

    private final HtsEncounterService service;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('hts_create', 'hts_encounter_create')")
    public ResponseEntity<HtsEncounterResponse> create(@Valid @RequestBody HtsEncounterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('hts_view', 'hts_encounter_view')")
    public ResponseEntity<HtsEncounterResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('hts_update', 'hts_encounter_update')")
    public ResponseEntity<HtsEncounterResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody HtsEncounterRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    // Called by the HIV module when a patient's viral load result is >= 1000.
    // Flags the given HTS encounter's finalHivTestResult as an acute HIV infection.
    // Does not touch hts_ict_encounter or any other observation field on the record.
    @PatchMapping("/{id}/final-result/acute-hiv-infection")
    @PreAuthorize("hasAnyAuthority('hts_update', 'hts_encounter_update')")
    public ResponseEntity<HtsEncounterResponse> markAcuteHivInfection(@PathVariable Long id) {
        return ResponseEntity.ok(service.markAcuteHivInfection(id));
    }

    // Called by the HIV module when a patient's viral load result is < 1000.
    // Flags the given HTS encounter's finalHivTestResult as negative.
    // Does not touch hts_ict_encounter or any other observation field on the record.
    @PatchMapping("/{id}/final-result/negative")
    @PreAuthorize("hasAnyAuthority('hts_update', 'hts_encounter_update')")
    public ResponseEntity<HtsEncounterResponse> markNegative(@PathVariable Long id) {
        return ResponseEntity.ok(service.markNegative(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('hts_delete', 'hts_encounter_delete')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('hts_view', 'hts_encounter_view')")
    public ResponseEntity<PageDTO> search(
            @RequestParam(required = false, defaultValue = "*") String search,
            @RequestParam Long facilityId,
            @PageableDefault(sort = "dateOfVisit", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<HtsEncounterResponse> page = service.search(facilityId, search, pageable);
        return ResponseEntity.ok(PaginationUtil.generatePagination(page, page.getContent()));
    }

    // Path variable renamed from personId → patientId
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('hts_view', 'hts_encounter_view')")
    public ResponseEntity<List<HtsEncounterResponse>> getEncountersByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getEncountersByPatientId(patientId));
    }

    @GetMapping("/patients")
    @PreAuthorize("hasAnyAuthority('hts_view', 'hts_encounter_view')")
    public ResponseEntity<PageDTO> getPatientSummaries(
            @RequestParam(required = false, defaultValue = "*") String search,
            @RequestParam Long facilityId,
            @PageableDefault(sort = "surname", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<PatientHtsSummaryDto> page = service.getPatientSummaries(facilityId, search, pageable);
        return ResponseEntity.ok(PaginationUtil.generatePagination(page, page.getContent()));
    }

    @GetMapping("/htsForProphylaxis/{screening-date}/{patient-uuid}")
    @PreAuthorize("hasAnyAuthority('hts_view', 'hts_encounter_view')")
    public ResponseEntity<HtsEncounterResponse> getForProphylaxis(
            @PathVariable("screening-date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate screeningDate,
            // patientUuid taken as a raw String (not java.util.UUID) so legacy/migrated
            // patient_uuid values that aren't well-formed UUIDs don't 400 at binding time.
            @PathVariable("patient-uuid") String patientUuid) {
        return ResponseEntity.ok(service.getForProphylaxis(screeningDate, patientUuid));
    }

    @GetMapping("/hts-patients")
    @PreAuthorize("hasAnyAuthority('hts_view', 'hts_encounter_view')")
    public ResponseEntity<PageDTO> getHtsPatients(
            @RequestParam(required = false, defaultValue = "*") String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<HtsPatientSummaryDto> page = service.getHtsPatientSummaries(search, pageable);
        return ResponseEntity.ok(PaginationUtil.generatePagination(page, page.getContent()));
    }

}
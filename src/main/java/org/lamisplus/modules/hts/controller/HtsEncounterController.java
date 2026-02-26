package org.lamisplus.modules.hts.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.base.util.PaginationUtil;
import org.lamisplus.modules.hts.domain.dto.HtsEncounterRequest;
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
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hts-encounter")
@RequiredArgsConstructor
public class HtsEncounterController {

    private final HtsEncounterService service;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('hts_create', 'hts_encounter_create')")
    public ResponseEntity<HtsEncounterResponse> create(@Valid @RequestBody HtsEncounterRequest request) {
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
                                                       @Valid @RequestBody HtsEncounterRequest request) {
        return ResponseEntity.ok(service.update(id, request));
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
            @PageableDefault(sort = "dateOfVisit", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<HtsEncounterResponse> page = service.search(search, pageable);
        return ResponseEntity.ok(PaginationUtil.generatePagination(page, page.getContent()));
    }

    @GetMapping("/patient/{personId}")
    @PreAuthorize("hasAnyAuthority('hts_view', 'hts_encounter_view')")
    public ResponseEntity<List<HtsEncounterResponse>> getEncountersByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(service.getEncountersByPersonId(personId));
    }

    @GetMapping("/patients")
    @PreAuthorize("hasAnyAuthority('hts_view', 'hts_encounter_view')")
    public ResponseEntity<PageDTO> getPatientSummaries(
            @RequestParam(required = false, defaultValue = "*") String search,
            @PageableDefault(sort = "surname", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<PatientHtsSummaryDto> page = service.getPatientSummaries(search, pageable);
        return ResponseEntity.ok(PaginationUtil.generatePagination(page, page.getContent()));
    }
}
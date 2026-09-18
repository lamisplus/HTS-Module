package org.lamisplus.modules.hts.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.base.util.PaginationUtil;
import org.lamisplus.modules.hts.domain.dto.IctEncounterRequest;
import org.lamisplus.modules.hts.domain.dto.IctEncounterResponse;
import org.lamisplus.modules.hts.service.IctEncounterService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ict-encounter")
@RequiredArgsConstructor
public class IctEncounterController {

    private final IctEncounterService service;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('hts_create', 'ict_encounter_create')")
    public ResponseEntity<IctEncounterResponse> create(@Valid @RequestBody IctEncounterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('hts_view', 'ict_encounter_view')")
    public ResponseEntity<IctEncounterResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('hts_update', 'ict_encounter_update')")
    public ResponseEntity<IctEncounterResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody IctEncounterRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('hts_delete', 'ict_encounter_delete')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyAuthority('hts_view', 'ict_encounter_view')")
    public ResponseEntity<List<IctEncounterResponse>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/hts/{htsEncounterId}")
    @PreAuthorize("hasAnyAuthority('hts_view', 'ict_encounter_view')")
    public ResponseEntity<IctEncounterResponse> getByHtsEncounterId(@PathVariable Long htsEncounterId) {
        return ResponseEntity.ok(service.getByHtsEncounterId(htsEncounterId));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('hts_view', 'ict_encounter_view')")
    public ResponseEntity<PageDTO> search(
            @RequestParam(required = false, defaultValue = "*") String search,
            @RequestParam Long facilityId,
            @PageableDefault(sort = "dateOfService", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<IctEncounterResponse> page = service.search(facilityId, search, pageable);
        return ResponseEntity.ok(PaginationUtil.generatePagination(page, page.getContent()));
    }

    // ResponseStatusException is thrown by IctEncounterService for the confirmed-positive
    // HTS link check and the HIV Transfer-In eligibility check. Without this handler it
    // falls through to Spring's default error handler and comes back with no message - this
    // surfaces the real message instead, mirroring HtsEncounterController's identical
    // handler for IllegalTypeException.
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(Collections.singletonMap("message", ex.getReason()));
    }
}
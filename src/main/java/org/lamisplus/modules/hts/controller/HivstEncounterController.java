package org.lamisplus.modules.hts.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.base.util.PaginationUtil;
import org.lamisplus.modules.hts.domain.dto.HivstEncounterRequestDTO;
import org.lamisplus.modules.hts.domain.dto.HivstEncounterResponseDTO;
import org.lamisplus.modules.hts.domain.dto.HivstPatientSummaryDto;
import org.lamisplus.modules.hts.service.HivstEncounterService;
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
@RequestMapping("/api/v1/hivst-encounter")
@RequiredArgsConstructor
public class HivstEncounterController {

    private final HivstEncounterService service;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HivstEncounterResponseDTO> create(@Valid @RequestBody HivstEncounterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HivstEncounterResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HivstEncounterResponseDTO> update(@PathVariable Long id, @Valid @RequestBody HivstEncounterRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HivstEncounterResponseDTO>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient-uuid/{patientUuid}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HivstEncounterResponseDTO>> getByPatientUuid(@PathVariable String patientUuid) {
        return ResponseEntity.ok(service.getByPatientUuid(patientUuid));
    }

    @GetMapping("/patients")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageDTO> getPatientSummaries(
            @RequestParam(required = false, defaultValue = "*") String search,
            @PageableDefault(sort = "dateOfVisit", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<HivstPatientSummaryDto> page = service.getPatientSummaries(search, pageable);
        return ResponseEntity.ok(PaginationUtil.generatePagination(page, page.getContent()));
    }
}
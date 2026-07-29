package org.lamisplus.modules.hts.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.hts.domain.dto.HivstResultRequestDTO;
import org.lamisplus.modules.hts.domain.dto.HivstResultResponseDTO;
import org.lamisplus.modules.hts.service.HivstResultService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hivst-result")
@RequiredArgsConstructor
public class HivstResultController {

    private final HivstResultService service;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HivstResultResponseDTO> create(@Valid @RequestBody HivstResultRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HivstResultResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HivstResultResponseDTO> update(@PathVariable Long id, @Valid @RequestBody HivstResultRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/encounter/{encounterId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HivstResultResponseDTO> getByEncounterId(@PathVariable Long encounterId) {
        return ResponseEntity.ok(service.getByEncounterId(encounterId));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HivstResultResponseDTO>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient-uuid/{patientUuid}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HivstResultResponseDTO>> getByPatientUuid(@PathVariable String patientUuid) {
        return ResponseEntity.ok(service.getByPatientUuid(patientUuid));
    }
}
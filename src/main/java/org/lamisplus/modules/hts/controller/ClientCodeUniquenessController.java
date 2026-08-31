package org.lamisplus.modules.hts.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.hts.service.ClientCodeUniquenessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Exposes a single, lightweight endpoint the frontend can call in real time to
 * validate whether a client code is already taken before submitting the HTS or
 * ICT form.
 *
 * <pre>
 * GET /api/v1/hts-client-code/exists?clientCode=H01/26/05/1714RA
 *
 * 200 OK  →  { "exists": true }   // code is taken - reject on the frontend
 * 200 OK  →  { "exists": false }  // code is free  - allow the form to proceed
 * </pre>
 *
 * Reuses the existing {@code hts_view} / {@code hts_encounter_view} authority -
 * no new permissions need to be registered.
 */
@RestController
@RequestMapping("/api/v1/hts-client-code")
@RequiredArgsConstructor
public class ClientCodeUniquenessController {

    private final ClientCodeUniquenessService service;

    /**
     * Check whether a client code is already used anywhere in the system.
     *
     * @param clientCode the code to validate
     * @return {@code { "exists": true|false }}
     */
    @GetMapping("/exists")
    @PreAuthorize("hasAnyAuthority('hts_view', 'hts_encounter_view')")
    public ResponseEntity<Map<String, Boolean>> checkExists(
            @RequestParam String clientCode) {

        Map<String, Boolean> body = new HashMap<>();

        if (clientCode == null || clientCode.trim().isEmpty()) {
            body.put("exists", false);
            return ResponseEntity.ok(body);
        }

        body.put("exists", service.isClientCodeTaken(clientCode));
        return ResponseEntity.ok(body);
    }
}
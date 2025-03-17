package org.lamisplus.modules.hts.controller;

import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.hts.domain.dto.HtsClientReferralDTO;
import org.lamisplus.modules.hts.domain.dto.HtsClientReferralRequestDTO;
import org.lamisplus.modules.hts.domain.dto.ReceivingOrganizationDTO;
import org.lamisplus.modules.hts.service.ClientReferralService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/hts-client-referral")
public class HtsClientReferralController {

    private final ClientReferralService clientReferralService;

    @PostMapping
    public ResponseEntity<HtsClientReferralDTO>  registerHtsClientReferral(@Valid @RequestBody HtsClientReferralRequestDTO reqDTO) {
       return ResponseEntity.ok(clientReferralService.registerClientReferralForm(reqDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HtsClientReferralDTO> updateHtsClientReferralWithServiceOrganizationProvider(@PathVariable Long id, @Valid @RequestBody ReceivingOrganizationDTO reqDTO) {
        return ResponseEntity.ok(clientReferralService.updateClientReferralWithServiceOrganizationProvider(id, reqDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HtsClientReferralDTO> getHtsClientReferralById(@PathVariable Long id) {
        return ResponseEntity.ok(clientReferralService.getHtsClientReferralById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHtsClientReferral(@PathVariable Long id) {
        return ResponseEntity.ok(clientReferralService.deleteHtsClientReferral(id));
    }


//    update htsClientReferral
    @PutMapping("/update-hts-client-referral/{id}")
    public ResponseEntity<HtsClientReferralDTO> updateHtsClientReferral(@PathVariable Long id, @Valid @RequestBody HtsClientReferralRequestDTO reqDTO) {
        return ResponseEntity.ok(clientReferralService.updateHtsClientReferral(id, reqDTO));
    }

    @GetMapping("/all/{id}")
    public ResponseEntity<List<HtsClientReferralDTO>> getAllHtsClientReferralByHtsClientId(@PathVariable Long id) {
        return ResponseEntity.ok(clientReferralService.getAllHtsClientReferral(id));
    }

}

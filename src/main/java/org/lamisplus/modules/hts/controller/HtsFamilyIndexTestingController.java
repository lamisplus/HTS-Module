package org.lamisplus.modules.hts.controller;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.hts.domain.dto.*;
import org.lamisplus.modules.hts.domain.entity.FamilyIndex;
import org.lamisplus.modules.hts.domain.entity.FamilyTestingTracker;
import org.lamisplus.modules.hts.service.FamilyIndexTestingService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.sql.SQLOutput;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;


@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/hts-family-index-testing")
public class HtsFamilyIndexTestingController {

   private final FamilyIndexTestingService familyIndexTestingService;

    @PostMapping
    public ResponseEntity<FamilyIndexTestingResponseDTO> save(@Valid @RequestBody FamilyIndexTestingRequestDTO familyIndexTestingDTO) {
        return ResponseEntity.ok(this.familyIndexTestingService.save(familyIndexTestingDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FamilyIndexTestingResponseDTO> getFamilyIndexTestingById(@PathVariable Long id) {
        return ResponseEntity.ok(this.familyIndexTestingService.getFamilyIndexTestingById(id));
    }



    @GetMapping("/{id}/hts-client")
    public ResponseEntity<FamilyIndexTestingResponseDTO> getFamilyIndexTestingByHtsClientId(@PathVariable Long id) {
        return ResponseEntity.ok(this.familyIndexTestingService.getFamilyIndexTestingByHtsClient(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFamilyIndexTesting(@PathVariable Long id) {
        return ResponseEntity.ok(this.familyIndexTestingService.deleteFamilyIndexTestingById(id));
    }

    @GetMapping("/family-index")
    public ResponseEntity<List<FamilyIndexResponseDTO>> getAllFamilyIndicesByFamilyIndexTestingUuid(@RequestParam String familyIndexTestingUuid) {
        List<FamilyIndexResponseDTO> familyIndices = familyIndexTestingService.getFamilyIndexByFamilyIndexTestingUuid(familyIndexTestingUuid);
        return ResponseEntity.ok(familyIndices);
    }




    @GetMapping("/getCurrentTreatment")
    public ResponseEntity<String> getCurrentTreatment(@RequestParam String personUuid) {

      String Result =  familyIndexTestingService.getCurrentTreatmentAndDate(personUuid);

        return ResponseEntity.ok(Result);
    }

    @GetMapping("/getViralLoad")
    public ResponseEntity<String> getViralLoad(@RequestParam String personUuid) {

        String Result =  familyIndexTestingService.getVirallySuppressedByPersonUuid(personUuid);
        return ResponseEntity.ok(Result);



    }


    //  get familyIndex by id
    @GetMapping("/family-index/{id}")
    public ResponseEntity<FamilyIndexResponseDTO> getFamilyIndexById(@PathVariable Long id) {
        return ResponseEntity.ok(this.familyIndexTestingService.getFamilyIndexById(id));
    }

    @DeleteMapping("/family-index/{id}")
    public ResponseEntity<?> deleteFamilyIndex(@PathVariable Long id) {
        return ResponseEntity.ok(this.familyIndexTestingService.deleteFamilyIndex(id));
    }

    @GetMapping("/family-index-tracker/{id}")
    public ResponseEntity<FamilyTestingTrackerResponseDTO> getFamilyTestingTrackerById(@PathVariable Long id) {
        return ResponseEntity.ok(this.familyIndexTestingService.getFamilyTestingTrackerById(id));
    }

    @PutMapping("/family-index-tracker/{id}")
    public ResponseEntity<FamilyTestingTrackerResponseDTO> updateFamilyTestingTracker(@PathVariable Long id, @Valid @RequestBody FamilyTestingTrackerResponseDTO familyTestingTrackerResponseDTO) {
        return ResponseEntity.ok(this.familyIndexTestingService.updateFamilyTracker(id, familyTestingTrackerResponseDTO));
    }

    @DeleteMapping("/family-index-tracker/{id}")
    public ResponseEntity<?> deleteFamilyTestingTracker(@PathVariable Long id) {
        return ResponseEntity.ok(this.familyIndexTestingService.deleteFamilyTracker(id));
    }

    @GetMapping("/family-index-tracker/by-family-index-uuid")
    public ResponseEntity<List<FamilyTestingTrackerResponseDTO>> getAllFamilyTestingTrackerByFamilyIndexUuid(@RequestParam String familyIndexUuid) {
        List<FamilyTestingTrackerResponseDTO> familyTestingTrackerResponseDTO = familyIndexTestingService.getFamilyTestingTrackerByFamilyIndexUuid(familyIndexUuid);
        return ResponseEntity.ok(familyTestingTrackerResponseDTO);
    }


    @PutMapping("/family-indexr/{id}")
    public ResponseEntity<FamilyIndexResponseDTO> updateFamilyIndex(@PathVariable Long id, @Valid @RequestBody FamilyIndexResponseDTO req) {
        return ResponseEntity.ok(this.familyIndexTestingService.updateFamilyIndex(id, req));
    }

    @PostMapping("/family-index-tracker")
    public ResponseEntity<FamilyTestingTrackerResponseDTO> addFamilyIndexTracker(@Valid @RequestBody FamilyTestingTrackerRequestDTO req) {
        return ResponseEntity.ok(this.familyIndexTestingService.addFamilyTracker(req));
    }

    @PostMapping("/update-family-index/{id}")
    public ResponseEntity<FamilyIndexResponseDTO>  updateSingleFamilyIndex(@PathVariable Long id, @RequestBody FamilyIndexResponseDTO req) {
        return ResponseEntity.ok(this.familyIndexTestingService.updateSingleFamilyIndex(id, req));
    }

    @PutMapping("/update-index-testing-and-index/{id}")
    public ResponseEntity<String> updateFamilyIndexTestingAndIndex(@PathVariable Long id, @RequestBody FamilyIndexTestingResponseDTO req) {
        String response = familyIndexTestingService.updateFamilyIndexTestingAndIndex(id, req);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/get-contact-id")
    public ResponseEntity<String> generatePartnerId(@RequestParam Long htsClientId, @RequestParam String clientCode) {
        return ResponseEntity.ok(this.familyIndexTestingService.generateContactId(htsClientId, clientCode));
    }


    @GetMapping("/hts-client-uuid")
    public ResponseEntity<UuidProjection> getHTSClientUUID(@RequestParam String uuid) {
        UuidProjection result = this.familyIndexTestingService.getHTSClientUUID(uuid);
        return ResponseEntity.ok(result);
    }

}

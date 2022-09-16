package org.lamisplus.modules.hts.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.hts.domain.dto.*;
import org.lamisplus.modules.hts.domain.entity.HtsClient;
import org.lamisplus.modules.hts.service.HtsClientService;
import org.lamisplus.modules.hts.service.IndexElicitationService;
import org.lamisplus.modules.hts.util.PaginationUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class HtsClientController {
    private final HtsClientService htsClientService;
    private final String HTS_URL_VERSION_ONE = "/api/v1/hts";

    private final IndexElicitationService indexElicitationService;

    @PostMapping(HTS_URL_VERSION_ONE)
    public ResponseEntity<HtsClientDto> save(@Valid @RequestBody HtsClientRequestDto htsClientRequestDto) {
        return ResponseEntity.ok(this.htsClientService.save(htsClientRequestDto));
    }

    @PutMapping(HTS_URL_VERSION_ONE +"/{id}/pre-test-counseling")
    public ResponseEntity<HtsClientDto> updatePreTestCounseling(@PathVariable Long id, @Valid @RequestBody HtsPreTestCounselingDto htsPreTestCounselingDto) {
        return ResponseEntity.ok(this.htsClientService.updatePreTestCounseling(id, htsPreTestCounselingDto));
    }
    @PutMapping(HTS_URL_VERSION_ONE +"/{id}/recency")
    public ResponseEntity<HtsClientDto> updateRecency(@PathVariable Long id, @Valid @RequestBody HtsRecencyDto htsRecencyDto) {
        return ResponseEntity.ok(this.htsClientService.updateRecency(id, htsRecencyDto));
    }
    @PutMapping(HTS_URL_VERSION_ONE +"/{id}/request-result")
    public ResponseEntity<HtsClientDto> updateRequestResult(@PathVariable Long id, @Valid @RequestBody HtsRequestResultDto htsRequestResultDto) {
        return ResponseEntity.ok(this.htsClientService.updateRequestResult(id, htsRequestResultDto));
    }
    @PutMapping(HTS_URL_VERSION_ONE +"/{id}/post-test-counseling")
    public ResponseEntity<HtsClientDto> updatePostTestCounselingKnowledgeAssessment(@PathVariable Long id, @Valid @RequestBody PostTestCounselingDto postTestCounselingDto) {
        return ResponseEntity.ok(this.htsClientService.updatePostTestCounselingKnowledgeAssessment(id, postTestCounselingDto));
    }
    @PutMapping(HTS_URL_VERSION_ONE +"/{id}/index-notification-services-elicitation")
    public ResponseEntity<HtsClientDto> updateIndexNotificationServicesElicitation(@PathVariable Long id, @Valid @RequestBody IndexElicitationDto indexElicitationDto) {
        return ResponseEntity.ok(this.htsClientService.updateIndexNotificationServicesElicitation(id, indexElicitationDto));
    }
    @GetMapping(HTS_URL_VERSION_ONE + "/{id}")
    public ResponseEntity<HtsClientDtos> getHtsClientById(@PathVariable Long id) {
        return ResponseEntity.ok(this.htsClientService.getHtsClientById(id));
    }
    @GetMapping(HTS_URL_VERSION_ONE + "/{id}/index-elicitation")
    public ResponseEntity<List<IndexElicitationResponseDto>> getAllByHtsClientId(@PathVariable Long id) {
        return ResponseEntity.ok(this.indexElicitationService.getAllByHtsClientId(id));
    }
    @GetMapping(HTS_URL_VERSION_ONE + "/persons/{personId}")
    public ResponseEntity<HtsClientDtos> getHtsClientByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(this.htsClientService.getHtsClientByPersonId(personId));
    }
    @GetMapping(HTS_URL_VERSION_ONE + "/code/client-code")
    public ResponseEntity<String> getHtsClientCode() {
        return ResponseEntity.ok(this.htsClientService.getHtsClientCode());
    }
    @GetMapping(HTS_URL_VERSION_ONE + "/code/{indexCode}")
    public ResponseEntity<String> getIndexCodeHtsClientCode(@PathVariable Long personId) {
        return ResponseEntity.ok(this.htsClientService.getHtsClientCode());
    }

    @GetMapping(HTS_URL_VERSION_ONE)
    public ResponseEntity<HtsClientDtos> getHtsClients(@PageableDefault(value = 50) Pageable pageable) {
        Page<HtsClient> page = htsClientService.findHtsClientPage(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return new ResponseEntity<>(this.htsClientService.getAllHtsClientDtos(page, null), headers, HttpStatus.OK);
    }

    @GetMapping(HTS_URL_VERSION_ONE + "/persons")
    public ResponseEntity<List<HtsClientDtos>> getAllPerson() {
        return ResponseEntity.ok(this.htsClientService.getAllPatients());
    }

    @DeleteMapping(HTS_URL_VERSION_ONE + "/{id}")
    public void delete(@PathVariable Long id) {
        this.htsClientService.delete(id);
    }
}

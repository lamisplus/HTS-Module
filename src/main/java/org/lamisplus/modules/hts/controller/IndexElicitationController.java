package org.lamisplus.modules.hts.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.hts.domain.dto.*;
import org.lamisplus.modules.hts.service.IndexElicitationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequiredArgsConstructor
public class IndexElicitationController {
    private final IndexElicitationService indexElicitationService;
    private final String INDEX_ELICITATION_URL_VERSION_ONE = "/api/v1/index-elicitation";

    @PostMapping(INDEX_ELICITATION_URL_VERSION_ONE)
    public ResponseEntity<IndexElicitationResponseDto> save(@Valid @RequestBody IndexElicitationDto indexElicitationDto) {
        return ResponseEntity.ok(this.indexElicitationService.save(indexElicitationDto));
    }

    @GetMapping(INDEX_ELICITATION_URL_VERSION_ONE + "/{id}")
    public ResponseEntity<IndexElicitationResponseDto> getIndexElicitationById(@PathVariable Long id) {
        return ResponseEntity.ok(this.indexElicitationService.getIndexElicitationById(id));
    }

    @PutMapping(INDEX_ELICITATION_URL_VERSION_ONE + "/{id}")
    public ResponseEntity<IndexElicitationResponseDto> update(@PathVariable Long id, @Valid @RequestBody IndexElicitationResponseDto indexElicitationResponseDto) {
        return ResponseEntity.ok(this.indexElicitationService.update(id, indexElicitationResponseDto));
    }

    @DeleteMapping(INDEX_ELICITATION_URL_VERSION_ONE + "/{id}")
    @ApiOperation("Deleting index Elicitation")
    public void delete(@PathVariable Long id) {
        this.indexElicitationService.delete(id);
    }
}

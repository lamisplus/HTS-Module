package org.lamisplus.modules.hts.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.hts.domain.dto.RiskStratificationDto;
import org.lamisplus.modules.hts.domain.dto.RiskStratificationResponseDto;
import org.lamisplus.modules.hts.service.RiskStratificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequiredArgsConstructor
@Api(tags = "RiskStratification API")
public class RiskStratificationController {
    private final RiskStratificationService riskStratificationService;
    private final String RISK_STRATIFICATION_URL_VERSION_ONE = "/api/v1/risk-stratification";

    @PostMapping(RISK_STRATIFICATION_URL_VERSION_ONE)
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation("Saving a new Risk Stratification")
    public RiskStratificationResponseDto save(@RequestBody RiskStratificationDto riskStratificationDTO) {
        return riskStratificationService.save(riskStratificationDTO);
    }

    @PutMapping(RISK_STRATIFICATION_URL_VERSION_ONE +"/{id}")
    @ApiOperation("Update Risk Stratification by id")
    public ResponseEntity<RiskStratificationDto> update(@PathVariable Long id, @Valid @RequestBody RiskStratificationDto stratificationDto) {
        return ResponseEntity.ok(riskStratificationService.update(id, stratificationDto));
    }

    @GetMapping(RISK_STRATIFICATION_URL_VERSION_ONE + "/{personId}")
    @ApiOperation("Get Risk Stratification by person id")
    public ResponseEntity<RiskStratificationResponseDto> getStratificationByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(riskStratificationService.getStratificationByPersonId(personId));
    }
}
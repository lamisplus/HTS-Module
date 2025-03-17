package org.lamisplus.modules.hts.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.base.util.PaginationUtil;
import org.lamisplus.modules.hts.domain.dto.HivstDto;
import org.lamisplus.modules.hts.domain.entity.HivstPerson;
import org.lamisplus.modules.hts.service.HivstService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hivst")
@RequiredArgsConstructor
public class HivstController {
    @Autowired
    private HivstService hivstService;

    @PostMapping
    public List<HivstDto> saveHivst(@RequestBody HivstDto hivstDto) {
        return hivstService.saveHivst(hivstDto);
    }

    @GetMapping("/{id}")
    public HivstDto getHivstById(@PathVariable("id") Long id) {
        return hivstService.getHivstById(id);
    }

    @GetMapping
    public List<HivstDto> getHivstByPatientId(@RequestParam("patientId") Long patientId){
        return hivstService.getAllHivstByPatientId(patientId);
    }



    @PutMapping("/{id}")
    public List<HivstDto> updateHivst(@RequestBody HivstDto hivstDto, @PathVariable Long id) {
        return hivstService.updateHivst(hivstDto, id);
    }

    @DeleteMapping("/{id}")
    public String deleteHivst(@PathVariable("id") Long id) {
        return hivstService.deleteHivst(id);
    }

    @GetMapping("/persons")
    @ApiOperation("Get Hivst Clients")
    @PreAuthorize("hasAnyAuthority('hts_view')")
    public ResponseEntity<PageDTO> getHivstPerson(@RequestParam (required = false, defaultValue = "*")  String searchValue,
                                                @RequestParam (required = false, defaultValue = "20")int pageSize,
                                                @RequestParam (required = false, defaultValue = "0") int pageNo) {
        Page<HivstPerson> page = hivstService.getAllHivstPerson(searchValue, pageNo, pageSize);
        return new ResponseEntity<>(PaginationUtil.generatePagination(page, page.getContent()), HttpStatus.OK);
    }

}

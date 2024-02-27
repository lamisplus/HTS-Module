package org.lamisplus.modules.covid.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.covid.domain.entity.CodeSet;
import org.lamisplus.modules.covid.domain.entity.PatientStatus;
import org.lamisplus.modules.covid.service.PatientStatusService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/covid/patientstatus")
public class CovidPatientStatusController {
    private final PatientStatusService service;

    @PostMapping("")
    public PatientStatus SaveCurrentStatus(@RequestBody PatientStatus patientStatus){
        return service.SaveStatus(patientStatus);
    }

    @GetMapping("/{patient_id}")
    public PatientStatus GetCurrentStatus(@PathVariable Integer patient_id){
        return service.GetStatusByPatientId(patient_id);
    }

    @DeleteMapping("/{patient_id}")
    public String DeleteCurrentStatus(@PathVariable Integer patient_id){
        return service.DeleteStatus(patient_id);
    }

    @GetMapping("/vaccination-status-codeset")
    public List<CodeSet> GetVaccinationStatusCodeset(){
        return service.GetVaccinationStatusCodeSet();
    }

    @GetMapping("/current-status-codeset")
    public List<CodeSet> GetCurrentStatusCodeset(){
        return service.GetCurrentStatusCodeSet();
    }
}

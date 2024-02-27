package org.lamisplus.modules.covid.service;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.covid.domain.entity.CodeSet;
import org.lamisplus.modules.covid.domain.entity.PatientStatus;
import org.lamisplus.modules.covid.repository.PatientStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientStatusService {
    @Autowired
    private PatientStatusRepository repository;

    public PatientStatus SaveStatus(PatientStatus patientStatus){
        return repository.save(patientStatus);
    }

    public PatientStatus UpdateStatus(PatientStatus patientStatus){
        return repository.save(patientStatus);
    }

    public PatientStatus GetStatusByPatientId(int patient_id) {
        return repository.findByPatientId(patient_id);
    }

    public String DeleteStatus(int patient_id) {
        return repository.delete(patient_id);
    }

    public List<CodeSet> GetVaccinationStatusCodeSet(){
        return repository.FindVaccinationStatusCodesets();
    }

    public List<CodeSet> GetCurrentStatusCodeSet(){
        return repository.FindCurrentStatusCodesets();
    }
}

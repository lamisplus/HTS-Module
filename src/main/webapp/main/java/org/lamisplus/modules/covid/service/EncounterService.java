package org.lamisplus.modules.covid.service;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.covid.domain.entity.Encounter;
import org.lamisplus.modules.covid.domain.entity.Patient;
import org.lamisplus.modules.covid.repository.EncounterRepository;
import org.lamisplus.modules.covid.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EncounterService {
    @Autowired
    private EncounterRepository repository;

    public Encounter Save(Encounter encounter){
        return repository.Save(encounter);
    }

    public Encounter Update(int id, Encounter encounter){
        return repository.Update(id, encounter);
    }

    public List<Encounter> GetAllEncountersByPatientId(int patient_id, String category) {
        return repository.findEncounterByPatientId(patient_id, category);
    }

    public String Delete(int id) {
        return repository.Delete(id);
    }
}

package org.lamisplus.modules.covid.repository;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.covid.domain.entity.CodeSet;
import org.lamisplus.modules.covid.domain.entity.Patient;
import org.lamisplus.modules.covid.domain.entity.PatientStatus;
import org.lamisplus.modules.covid.domain.entity.QuestionAnswer;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class PatientStatusRepository {
    private final JdbcTemplate jdbcTemplate;

    public PatientStatus save(PatientStatus patientStatus) {
        jdbcTemplate.update("UPDATE covid_patient set current_status=? where id=? ",
                patientStatus.getCurrent_status(),
                patientStatus.getPatient_id()
        );
        return patientStatus;
    }

    public PatientStatus findByPatientId(int patient_id) {
        return jdbcTemplate.query("SELECT id as patient_id, current_status FROM covid_patient where id = ? ",
                new BeanPropertyRowMapper<PatientStatus>(PatientStatus.class), patient_id).stream().findFirst().orElse(null);
    }

    public PatientStatus update(PatientStatus patientStatus) {
        return save(patientStatus);
    }

    public String delete(int patient_id){
        jdbcTemplate.update("UPDATE covid_patient set current_status='' where id=? ", patient_id);
        return "Patient current status deleted successfully";
    }

    public List<CodeSet> FindVaccinationStatusCodesets() {
        return jdbcTemplate.query("SELECT * FROM covid_codeset where category = 'VACCINATION_STATUS' ",
                new BeanPropertyRowMapper<CodeSet>(CodeSet.class));
    }

    public List<CodeSet> FindCurrentStatusCodesets() {
        return jdbcTemplate.query("SELECT * FROM covid_codeset where category = 'CURRENT_STATUS' ",
                new BeanPropertyRowMapper<CodeSet>(CodeSet.class));
    }
}

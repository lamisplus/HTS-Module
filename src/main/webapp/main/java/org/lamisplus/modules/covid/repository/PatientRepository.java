package org.lamisplus.modules.covid.repository;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.covid.domain.entity.Patient;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class PatientRepository {
    private final JdbcTemplate jdbcTemplate;

    public Patient save(Patient patient) {
        jdbcTemplate.update("INSERT INTO covid_patient (uuid, first_name, mid_name, " +
                        "last_name, participant_id, gender, dob, phone, address, vaccination_status) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(),
                patient.getFirst_name(),
                patient.getMid_name(),
                patient.getLast_name(),
                patient.getParticipant_id(),
                patient.getGender(),
                patient.getDob(),
                patient.getPhone(),
                patient.getAddress(),
                patient.getVaccination_status()
        );
        return findByUUID(patient.getUuid());
    }

    public Patient update(int id, Patient patient) {
        jdbcTemplate.update("UPDATE covid_patient set first_name=?, mid_name=?, " +
                        "last_name=?, participant_id=?, gender=?, dob=?, phone=?, address=?, vaccination_status=? where id=? ",
                patient.getFirst_name(),
                patient.getMid_name(),
                patient.getLast_name(),
                patient.getParticipant_id(),
                patient.getGender(),
                patient.getDob(),
                patient.getPhone(),
                patient.getAddress(),
                patient.getVaccination_status(),
                id
        );
        return findByUUID(patient.getUuid());
    }

    public List<Patient> findAll() {
        return jdbcTemplate.query("SELECT * FROM covid_patient",
                new BeanPropertyRowMapper<Patient>(Patient.class));
    }

    public String delete(int id){
        jdbcTemplate.update("delete from covid_patient where id=? ", id);
        return id + " deleted successfully";
    }

    public Patient findByUUID(String uuid) {
        return jdbcTemplate.query("SELECT * FROM covid_patient where uuid = ? ",
                new BeanPropertyRowMapper<Patient>(Patient.class), uuid).stream().findFirst().orElse(null);
    }
}

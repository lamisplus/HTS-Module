package org.lamisplus.modules.covid.repository;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.covid.domain.entity.Encounter;
import org.lamisplus.modules.covid.domain.entity.QuestionAnswer;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
@RequiredArgsConstructor
public class EncounterRepository {
    private final JdbcTemplate jdbcTemplate;

    public Encounter Save(Encounter encounter) {
        String uuid = UUID.randomUUID().toString();

        jdbcTemplate.update("INSERT INTO covid_encounter (uuid, patient_id, visit_date, category, location) " +
                        "VALUES (?, ?, ?, ?, ?)",
                uuid,
                encounter.getPatient_id(),
                encounter.getVisit_date(),
                encounter.getCategory(),
                encounter.getLocation()
        );

        Encounter saved_encounter = findEncounterByUUID(uuid).orElse(null);

        for(QuestionAnswer answer : encounter.getQuestionAnswers()) {
            SaveAnswer(answer, saved_encounter.getId());
        }

        List<QuestionAnswer> answers = findAnswersByEncounterId(saved_encounter.getId());
        saved_encounter.setQuestionAnswers(answers);
        
        return saved_encounter;
    }

    public QuestionAnswer SaveAnswer(QuestionAnswer answer, int encounter_id){
        String uuid = UUID.randomUUID().toString();

        jdbcTemplate.update("INSERT INTO covid_question_answer (uuid, question_id, answer, encounter_id) " +
                        "VALUES (?, ?, ?, ?) ",
                uuid,
                answer.getQuestion_id(),
                answer.getAnswer(),
                encounter_id
        );

        return findAnswerByUUID(uuid).orElse(null);
    }

    public Encounter Update(int encounter_id, Encounter encounter) {
        jdbcTemplate.update("update covid_encounter set patient_id=?, visit_date=?, category=?, location=? " +
                        "where id=? ",
                encounter.getPatient_id(),
                encounter.getVisit_date(),
                encounter.getCategory(),
                encounter.getLocation(),
                encounter_id
        );

        jdbcTemplate.update("delete from covid_question_answer where encounter_id=? ", encounter_id);

        List<QuestionAnswer> answerList = new ArrayList<>();
        for(QuestionAnswer answer : encounter.getQuestionAnswers()) {
            answerList.add(SaveAnswer(answer, encounter_id));
        }

        Encounter updated_encounter = findEncounterByUUID(encounter.getUuid()).orElse(null);
        assert updated_encounter != null;
        updated_encounter.setQuestionAnswers(answerList);

        return updated_encounter;
    }

    public String Delete(int id){
        jdbcTemplate.update("delete from covid_encounter where id=? ", id);
        jdbcTemplate.update("delete from covid_question_answer where encounter_id=? ", id);
        return id + " deleted successfully";
    }

    public List<Encounter> findEncounterByPatientId(int patient_id, String category) {
        List<Encounter> encounters =  jdbcTemplate.query("SELECT * FROM covid_encounter where patient_id = ? " +
                        "and category=? ",
                new BeanPropertyRowMapper<Encounter>(Encounter.class), patient_id, category);

        for(Encounter encounter : encounters) {
            List<QuestionAnswer> answers = findAnswersByEncounterId(encounter.getId());
            encounter.setQuestionAnswers(answers);
        }

        return encounters;
    }

    public List<QuestionAnswer> findAnswersByEncounterId(int encounter_id) {
        return jdbcTemplate.query("SELECT * FROM covid_question_answer where encounter_id = ? ",
                new BeanPropertyRowMapper<QuestionAnswer>(QuestionAnswer.class), encounter_id);
    }

    public Optional<Encounter> findEncounterByUUID(String uuid) {
        return jdbcTemplate.query("SELECT * FROM covid_encounter where uuid = ? ",
                new BeanPropertyRowMapper<Encounter>(Encounter.class), uuid).stream().findFirst();
    }

    public Optional<QuestionAnswer> findAnswerByUUID(String uuid) {
        return jdbcTemplate.query("SELECT * FROM covid_question_answer where uuid = ? ",
                new BeanPropertyRowMapper<QuestionAnswer>(QuestionAnswer.class), uuid).stream().findFirst();
    }
}

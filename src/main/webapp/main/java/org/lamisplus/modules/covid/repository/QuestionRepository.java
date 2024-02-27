package org.lamisplus.modules.covid.repository;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.covid.domain.entity.Question;
import org.lamisplus.modules.covid.domain.entity.QuestionResponse;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class QuestionRepository {
    private final JdbcTemplate jdbcTemplate;

    public List<QuestionResponse> findAllByQuestionId(int question_id) {
        return jdbcTemplate.query("SELECT * FROM covid_question_response where question_id=? ",
                new BeanPropertyRowMapper<QuestionResponse>(QuestionResponse.class), question_id);
    }

    public List<Question> findAllByCategory(String category) {
        List<Question> questions =  jdbcTemplate.query("SELECT * FROM covid_question where category=? ",
                new BeanPropertyRowMapper<Question>(Question.class), category);

        for (Question question: questions) {
            List<QuestionResponse> responses = findAllByQuestionId(question.getId());
            question.setResponses(responses);
        }

        return questions;
    }
}

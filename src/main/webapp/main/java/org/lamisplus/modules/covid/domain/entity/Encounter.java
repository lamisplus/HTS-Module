package org.lamisplus.modules.covid.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Encounter {
    @Id
    @GeneratedValue

    private int id;
    private String uuid;
    private int patient_id;
    private LocalDate visit_date;
    private String category;
    private String location;
    private List<QuestionAnswer> questionAnswers;
}

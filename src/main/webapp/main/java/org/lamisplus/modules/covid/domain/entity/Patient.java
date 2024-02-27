package org.lamisplus.modules.covid.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDate;
import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "covid_patient")
public class Patient {
    @Id
    @GeneratedValue
    private int id;
    private String uuid;
    private String first_name;
    private String mid_name;
    private String last_name;
    private String participant_id;
    private int gender;
    private LocalDate dob;
    private String phone;
    private String current_status;
    private String vaccination_status;
    private String address;
}

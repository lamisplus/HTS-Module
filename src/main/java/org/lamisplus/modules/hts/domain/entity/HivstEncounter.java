package org.lamisplus.modules.hts.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.GenerationTime;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.lamisplus.modules.base.domain.entities.Audit;
import org.lamisplus.modules.patient.domain.entity.Person;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "hivst_encounter")
@Data
@EqualsAndHashCode(callSuper = false)
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class HivstEncounter extends Audit<HivstEncounter> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Generated(GenerationTime.INSERT)
    @Column(columnDefinition = "varchar(50)", insertable = false, updatable = false, unique = true, nullable = false)
    private String uuid;

    @Generated(GenerationTime.INSERT)
    @Column(columnDefinition = "varchar(36)", insertable = false, updatable = false, unique = true, nullable = false)
    private String visitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Person person;

    @Column(name = "patient_uuid", length = 50)
    private String patientUuid;

    @Column(name = "client_code", nullable = false, length = 200)
    private String clientCode;

    @Column(name = "date_of_visit", nullable = false)
    private LocalDate dateOfVisit;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Column(length = 200)
    private String setting;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private JsonNode observation;

    @Column(nullable = false)
    private Boolean archived = false;

    @Column(length = 200)
    private String source = "Web";

    @Column(length = 200)
    private String longitude;

    @Column(length = 200)
    private String latitude;
}
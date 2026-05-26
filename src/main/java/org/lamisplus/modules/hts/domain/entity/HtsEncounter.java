package org.lamisplus.modules.hts.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.lamisplus.modules.base.domain.entities.Audit;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.GenerationTime;


import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "hts_encounter")
@Data
@EqualsAndHashCode(callSuper = false)
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class HtsEncounter extends Audit<HtsEncounter> implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Generated(GenerationTime.INSERT)
    @Column(columnDefinition = "varchar(50)", insertable = false, updatable = false, unique = true, nullable = false)
    private String uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Person person;

    @Column(name = "patient_uuid", columnDefinition = "uuid")
    private UUID patientUuid;

    @Column(name = "client_code", nullable = false, length = 50)
    private String clientCode;

    @Column(name = "date_of_visit", nullable = false)
    private LocalDate dateOfVisit;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Column(name = "setting", length = 50)
    private String setting;

    @Column(name = "pmtct_hts", nullable = false)
    private Boolean pmtctHts = false;


    @Column(name = "source", length = 50, nullable = false)
    private String source = "Web";

    @Column(name = "longitude", length = 50)
    private String longitude;

    @Column(name = "latitude", length = 50)
    private String latitude;
    @Type(type = "jsonb")
    @Column(name = "observation", columnDefinition = "jsonb")
    private JsonNode observation;



    @Column(nullable = false)
    private Boolean archived = false;
}

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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "hts_ict_encounter")
@Data
@EqualsAndHashCode(callSuper = false)
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class IctEncounter extends Audit<IctEncounter> implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_category_other", columnDefinition = "TEXT")
    private String clientCategoryOther;


    @Generated(GenerationTime.INSERT)
    @Column(columnDefinition = "varchar(50)", insertable = false, updatable = false, unique = true, nullable = false)
    private String uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Person person;

    @Column(name = "patient_uuid", columnDefinition = "uuid")
    private UUID patientUuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hts_encounter_id", nullable = true)
    private HtsEncounter htsEncounter;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Column(name = "hts_encounter_uuid", length = 36)
    private String htsEncounterUuid;
    @Column(name = "date_of_service", nullable = false)
    private LocalDate dateOfService;

    @Column(name = "setting", length = 100)
    private String setting;

    @Column(name = "client_category", length = 100)
    private String clientCategory;

    @Column(name = "offered_pns", length = 10)
    private String offeredPns;

    @Column(name = "accepted_pns", length = 10)
    private String acceptedPns;

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private JsonNode data;

    @OneToMany(mappedBy = "ictEncounter", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<IctContact> contacts = new ArrayList<>();

    @Column(nullable = false)
    private Boolean archived = false;
}

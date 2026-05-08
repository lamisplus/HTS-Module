package org.lamisplus.modules.hts.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "hts_ict_encounter")
@Data
@EqualsAndHashCode(callSuper = false)
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
@EntityListeners(AuditingEntityListener.class)
public class IctEncounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "uuid", insertable = false, updatable = false, unique = true, nullable = false)
    private UUID uuid;

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

    @CreatedBy
    @Column(name = "created_by")
    private String createdBy;

    @CreatedDate
    @Column(name = "date_created")
    private LocalDateTime dateCreated;

    @LastModifiedBy
    @Column(name = "modified_by")
    private String modifiedBy;

    @LastModifiedDate
    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate;
}
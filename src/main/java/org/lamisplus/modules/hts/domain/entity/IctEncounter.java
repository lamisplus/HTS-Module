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

    @Column(unique = true, nullable = false, length = 36)
    private String uuid;

    /** The person (index client) this ICT encounter belongs to. Always required. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    /**
     * The HTS encounter that triggered this ICT session.
     * Nullable: ICT can be opened from the ART module (Virally Unsuppressed / RTT)
     * without a same-session HTS encounter.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hts_encounter_id", nullable = true)
    private HtsEncounter htsEncounter;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Column(name = "date_of_service", nullable = false)
    private LocalDate dateOfService;

    /** Stored as a column for easy filtering/reporting. Also included in data JSONB. */
    @Column(name = "setting", length = 100)
    private String setting;

    /** Newly Diagnosed / Virally Unsuppressed / RTT / Other */
    @Column(name = "client_category", length = 100)
    private String clientCategory;

    @Column(name = "offered_pns", length = 10)
    private String offeredPns;

    @Column(name = "accepted_pns", length = 10)
    private String acceptedPns;

    /**
     * JSONB overflow: stores the remaining Section A fields that don't need
     * individual columns (facilitySetting, communityEntryPoint, artClinic,
     * clientCategoryOther, index client demographic snapshot, etc.).
     */
    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private JsonNode data;

    /** Contacts collected in Section B. Owned by this encounter. */
    @OneToMany(mappedBy = "ictEncounter", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<IctContact> contacts = new ArrayList<>();

    @Column(nullable = false)
    private Integer archived = 0;

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

    @PrePersist
    public void prePersist() {
        if (uuid == null) {
            uuid = java.util.UUID.randomUUID().toString();
        }
    }
}

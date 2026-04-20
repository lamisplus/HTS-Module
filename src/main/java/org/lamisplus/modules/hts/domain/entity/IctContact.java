package org.lamisplus.modules.hts.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "hts_ict_contact")
@Data
@EqualsAndHashCode(callSuper = false)
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
@EntityListeners(AuditingEntityListener.class)
public class IctContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 36)
    private String uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ict_encounter_id", nullable = false)
    private IctEncounter ictEncounter;

    /** Frontend-generated human-readable ID, e.g. ICT-CLIENT001-1-abc123 */
    @Column(name = "contact_id", length = 100)
    private String contactId;

    @Column(name = "firstname_of_contact", nullable = false)
    private String firstnameOfContact;

    @Column(name = "middlename_of_contact")
    private String middlenameOfContact;

    @Column(name = "surname_of_contact", nullable = false)
    private String surnameOfContact;

    @Column(name = "relationship_to_index", length = 100)
    private String relationshipToIndex;

    @Column(name = "contact_sex", length = 20)
    private String contactSex;

    @Column(name = "contact_age_group", length = 20)
    private String contactAgeGroup;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "contact_address", columnDefinition = "TEXT")
    private String contactAddress;

    @Column(name = "same_address_as_index")
    private Boolean sameAddressAsIndex = false;

    @Column(name = "notification_method", length = 100)
    private String notificationMethod;

    @Column(name = "follow_up_location", length = 100)
    private String followUpLocation;

    @Column(name = "attempts")
    private Integer attempts = 0;

    @Column(name = "known_hiv_positive", length = 10)
    private String knownHivPositive;

    @Column(name = "hiv_test_result", length = 20)
    private String hivTestResult;

    @Column(name = "date_tested_hiv")
    private LocalDate dateTestedHiv;

    @Column(name = "date_enrolled_art")
    private LocalDate dateEnrolledArt;

    @Column(name = "contact_on_art")
    private String contactOnArt;

    @Column(name = "enrolled_in_ovc")
    private Boolean enrolledInOvc = false;

    @Column(name = "date_enrolled_ovc")
    private LocalDate dateEnrolledOvc;

    @Column(name = "ovc_id", length = 100)
    private String ovcId;

    /** JSONB overflow for future/optional contact fields */
    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    private JsonNode data;

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

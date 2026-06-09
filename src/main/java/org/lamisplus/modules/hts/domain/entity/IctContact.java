package org.lamisplus.modules.hts.domain.entity;


import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.TypeDef;
import org.lamisplus.modules.base.domain.entities.Audit;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.GenerationTime;


import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "hts_ict_contact")
@Data
@EqualsAndHashCode(callSuper = false)
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class IctContact extends Audit<IctContact> implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Generated(GenerationTime.INSERT)
    @Column(columnDefinition = "varchar(50)", insertable = false, updatable = false, unique = true, nullable = false)
    private String uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ict_encounter_id", nullable = false)
    private IctEncounter ictEncounter;

    @Column(name = "contact_code", length = 100)
    private String contactCode;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "surname", nullable = false)
    private String surname;

    @Column(name = "relationship_to_index", length = 100)
    private String relationshipToIndex;

    @Column(name = "sex", length = 20)
    private String sex;


    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

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

    @Column(name = "hiv_test_result", length = 200)
    private String hivTestResult;

    @Column(name = "age")
    private Integer age;

    @Column(name = "date_tested_hiv")
    private LocalDate dateTestedHiv;

    @Column(name = "hts_ict_encounter_uuid", length = 36)
    private String ictEncounterUuid;
    @Column(name = "date_enrolled_art")
    private LocalDate dateEnrolledArt;

    @Column(name = "art_clinic")
    private String artClinic;

    @Column(name = "on_art")
    private String onArt;

    @Column(name = "enrolled_in_ovc")
    private Boolean enrolledInOvc = false;

    @Column(name = "date_enrolled_ovc")
    private LocalDate dateEnrolledOvc;

    @Column(name = "ovc_id", length = 100)
    private String ovcId;


    @Column(nullable = false)
    private Boolean archived = false;
}

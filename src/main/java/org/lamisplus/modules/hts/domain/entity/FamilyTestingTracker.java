package org.lamisplus.modules.hts.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.array.StringArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeStringType;
import com.vladmihalcea.hibernate.type.json.JsonStringType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "hts_family_index_testing_tracker")
@Where(clause = "archived = 0")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class FamilyTestingTracker extends Audit implements Serializable {

    @Id
    @Column(name="id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic
    @Column(name = "uuid", updatable = false)
    private String uuid;

    @Basic
    @Column(name = "archived")
    private int archived=0;

    @Basic
    @Column(name = "position_of_child_enumerated")
    private int positionOfChildEnumerated;

    @Basic
    @Column(name = "tracker_sex")
    private String trackerSex;

    @Basic
    @Column(name = "tracker_age")
    private int trackerAge;

    @Basic
    @Column(name = "schedule_visit_date")
    private LocalDate scheduleVisitDate;

    @Basic
    @Column(name = "follow_up_appointment_location")
    private String followUpAppointmentLocation;

    @Basic
    @Column(name = "date_visit")
    private LocalDate dateVisit;

    @Basic
    @Column(name ="known_hiv_positive")
    private String knownHivPositive;

    @Basic
    @Column(name ="hiv_test_result")
    private String hiveTestResult ;

    @Basic
    @Column(name ="date_tested")
    private LocalDate dateTested ;


    @Basic
    @Column(name="date_enrolledonart")
    private LocalDate dateEnrolledOnArt;

    @Basic
    @Column(name="date_enrolled_in_ovc")
    private LocalDate dateEnrolledInOVC;

    @Basic
    @Column(name="ovc_id")
    private String ovcId;

    @Basic
    @Column(name = "facility_id", updatable = false)
    private Long facilityId;


    @Basic
    @Column(name = "family_index_uuid")
    private String familyIndexUuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_index_id")
    private FamilyIndex familyIndex;


    @Column(name = "attempt")
    private String  attempt;

    @Column(name = "family_index_testing_id")
    private Long familyIndexTestingId;
    @PrePersist
    public void setFields(){
        if(StringUtils.isEmpty(uuid)){
            uuid = UUID.randomUUID().toString();
        }
    }
}

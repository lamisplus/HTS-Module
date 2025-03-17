package org.lamisplus.modules.hts.domain.entity;

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
import org.lamisplus.modules.base.domain.entities.Audit;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "hts_pns_index_client_partner")
@Where(clause = "archived = 0")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class PersonalNotificationService extends Audit implements Serializable {

    @Id
    @Column(name="id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic
    @Column(name = "offered_pns")
    private String offeredPns;

    @Basic
    @Column(name = "accepted_pns")
    private String acceptedPns;

    @Basic
    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "index_client_id")
    private String indexClientId;

    @Basic
    @Column(name = "facility_id", updatable = false)
    private Long facilityId;

    @Basic
    @Column(name = "phone_number")
    private String phoneNumber;

    @Basic
    @Column(name = "alternate_phone_number")
    private String alternatePhoneNumber;

    @Basic
    @Column(name ="last_name")
    private String lastName;
    @Basic
    @Column(name ="first_name")
    private String firstName;
    @Basic
    @Column(name ="middle_name")
    private String middleName;

    @Basic
    @Column(name = "uuid", updatable = false)
    private String uuid;

    @Basic
    @Column(name = "hts_client_uuid")
    private String htsClientUuid;

    @Basic
    @Column(name = "notification_method")
    private String notificationMethod;

    @Basic
    @Column(name = "sex")
    private String sex;

    @Basic
    @Column(name = "address")
    private String address;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "contact_tracing", columnDefinition = "jsonb")
    private Object contactTracing;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "intermediate_partner_violence", columnDefinition = "jsonb")
    private Object intermediatePartnerViolence;

    @Basic
    @Column(name = "relationship_with_index_client")
    private String relationshipToIndexClient;

    @Basic
    @Column(name ="known_hiv_positive")
    private String knownHivPositive;

    @Basic
    @Column(name ="date_partner_tested")
    private LocalDate datePartnerTested;

    @Basic
    @Column(name= "hiv_test_result")
    private String hivTestResult;

    @Basic
    @Column(name = "archived")
    private int archived=0;

    @Basic
    @Column(name= "accepted_hts")
    private String acceptedHts;

    @Basic
    @Column(name ="date_enrollment_on_art")
    private LocalDate dateEnrollmentOnART;

    @ManyToOne
    @JoinColumn(name = "hts_client_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private HtsClient htsClient;

    @Basic
    @Column(name = "partner_id")
    private String partnerId;

    @Basic
    @Column(name ="reason_for_decline")
    private String reasonForDecline;

    @Basic
    @Column(name="other_reason_for_decline")
    private String otherReasonForDecline;
    // index client information

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "hts_client_information", columnDefinition = "jsonb")
    private Object htsClientInformation;

    @Basic
    @Column(name="is_htsclient")
    private String isHtsClient;

    @PrePersist
    public void setFields(){
        if(StringUtils.isEmpty(uuid)){
            uuid = UUID.randomUUID().toString();
        }
    }


}

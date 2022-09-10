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
import org.lamisplus.modules.base.domain.entities.Audit;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "hts_index_elicitation")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class IndexElicitation extends Audit implements Serializable {
    @Id
    @Column(name="id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic
    @Column(name = "dob")
    private LocalDate dob;

    @Basic
    @Column(name = "is_date_of_birth_estimated")
    private Long isDateOfBirthEstimated;

    @Basic
    @Column(name = "sex")
    private Long sex;

    @Basic
    @Column(name = "address")
    private String address;

    @Basic
    @Column(name = "last_name")
    private String lastName;

    @Basic
    @Column(name = "first_name")
    private String firstName;

    @Basic
    @Column(name = "middle_name")
    private String middleName;

    @Basic
    @Column(name = "phone_number")
    private String phoneNumber;

    @Basic
    @Column(name = "alt_phone_number")
    private String altPhoneNumber;

    @Basic
    @Column(name = "hang_out_spots")
    private Long hangOutSpots;

    @Basic
    @Column(name = "physical_hurt")
    private Boolean physicalHurt;

    @Basic
    @Column(name = "threaten_to_hurt")
    private Boolean threatenToHurt;

    @Basic
    @Column(name = "notification_method")
    private Long notificationMethod;

    @Basic
    @Column(name = "partner_tested_positive")
    private Boolean partnerTestedPositive;

    @Basic
    @Column(name = "relative_to_index_client")
    private Long relativeToIndexClient;

    @Basic
    @Column(name = "sexually_uncomfortable")
    private Boolean sexuallyUncomfortable;

    @Basic
    @Column(name = "currently_live_with_partner")
    private Boolean currentlyLiveWithPartner;

    @Basic
    @Column(name = "date_partner_came_for_testing")
    private LocalDate datePartnerCameForTesting;

    @Basic
    @Column(name = "hts_client_uuid", updatable = false)
    private LocalDate htsClientUuid;

    @Basic
    @Column(name = "archived")
    private int archived=0;

    @Basic
    @Column(name = "uuid", updatable = false)
    private String uuid;

    @Basic
    @Column(name = "facility_id", updatable = false)
    private Long facilityId;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "extra", columnDefinition = "jsonb")
    private Object extra;

    @ManyToOne
    @JoinColumn(name = "hts_client_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private HtsClient htsClient;

    @PrePersist
    public void setFields(){
        if(StringUtils.isEmpty(uuid)){
            uuid = UUID.randomUUID().toString();
        }
    }
}

package org.lamisplus.modules.hts.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.array.StringArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeStringType;
import com.vladmihalcea.hibernate.type.json.JsonStringType;
import liquibase.pro.packaged.C;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import org.hibernate.annotations.Where;
import org.lamisplus.modules.base.domain.entities.Audit;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "hts_family_index_testing")
@Where(clause = "archived = 0")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class FamilyIndexTesting extends Audit implements Serializable {

    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic
    @Column(name = "uuid", updatable = false)
    private String uuid;


    @Basic
    @Column(name = "hts_client_uuid")
    private String htsClientUuid;

    @Basic
    @Column(name = "hts_client_id")
    private Long htsClientId;

    @ManyToOne
    @JoinColumn(name = "hts_client_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private HtsClient htsClient;


    @ToString.Exclude
    @OneToMany(mappedBy = "familyIndexTesting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FamilyIndex> familyIndices = new ArrayList<>();

    @Basic
    @Column(name = "archived")
    private int archived = 0;


    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "extra", columnDefinition = "jsonb")
    private Object extra;

//    ######## start point ########

    @Basic
    @Column(name = "state")
    private String state;

    @Basic
    @Column(name = "lga")
    private String lga;

    @Basic
    @Column(name = "facility_name")
    private String facilityName;

    @Basic
    @Column(name = "visit_date")
    private LocalDate visitDate;

    @Basic
    @Column(name = "setting")
    private String setting;

    @Basic
    @Column(name = "family_index_client")
    private String familyIndexClient;

    @Basic
    private String sex;

    @Basic
    @Column(name = "index_client_id", unique = true, nullable = false, updatable = false)
    private String indexClientId; // HTS client code / Family index client unique ART number

    @Basic
    private String name;

    @Basic
    @Column(name ="date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "age")
    private String age;

    @Basic
    @Column(name="marital_status")
    private String maritalStatus;

    @Basic
    @Column(name="phone_number")
    private String phoneNumber;

    @Basic
    @Column(name = "alternate_phone_number")
    private String alternatePhoneNumber;

    @Basic
    @Column(name = "date_index_client_confirmed_hiv_positive_test_result")
    private LocalDate dateIndexClientConfirmedHivPositiveTestResult;

    @Basic
    @Column(name ="virally_unsurpressed")
    private String virallyUnSuppressed;

    @Basic
    @Column(name="is_client_curremtly_on_hiv_treatment")
    private String isClientCurrentlyOnHivTreatment;

    @Basic
    @Column(name="date_client_enrolled_on_treatment")
    private String dateClientEnrolledOnTreatment;

    @Basic
    @Column(name="recency_testing")
    private String recencyTesting;

    @Basic
    @Column(name = "contact_id")
    private String contactId;

    @Basic
    @Column(name="willing_to_have_children_tested_else_where")
    private String willingToHaveChildrenTestedElseWhere;

    @PrePersist
    public void setFields() {
        if (StringUtils.isEmpty(uuid)) {
            uuid = UUID.randomUUID().toString();
        }
    }

}

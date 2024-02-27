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
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "hts_risk_stratification")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class RiskStratification extends Audit implements Serializable {
    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic
    @Column(name = "age")
    private int age;

    @Basic
    @Column(name = "entry_point")
    private String entryPoint;


    @Basic
    @Column(name = "dob")
    private LocalDate dob;

    @Basic
    @Column(name = "testing_setting")
    private String testingSetting;

    @Basic
    @Column(name = "modality")
    private String modality;
    @Basic
    @Column(name = "code", updatable = false)
    private String code;

    @Basic
    @Column(name = "target_group")
    private String targetGroup;

    @Basic
    @Column(name = "visit_date")
    private LocalDate visitDate;

    @Basic
    @Column(name = "archived")
    private int archived=0;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "risk_assessment", columnDefinition = "jsonb")
    private  Object riskAssessment;

    @Basic
    @Column(name = "person_uuid")
    private String personUuid;

    @Basic
    @Column(name = "community_entry_point ")
    private String communityEntryPoint ;

    @Basic
    @Column(name = "facility_id ")
    private Long facilityId;

    @PrePersist
    public void setFields(){
        if(StringUtils.isEmpty(code)){
            code = UUID.randomUUID().toString();
        }
    }
}

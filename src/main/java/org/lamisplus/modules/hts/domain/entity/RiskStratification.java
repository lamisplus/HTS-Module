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
import org.lamisplus.modules.hts.domain.dto.RiskStratificationResponseDto;
import org.lamisplus.modules.hts.util.Constants;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "hts_risk_stratification")
@Where(clause = "archived = 0")
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
    private Integer age=0;

    @Basic
    @Column(name = "entry_point")
    private String entryPoint;


    @Basic
    @Column(name = "dob")
    private LocalDate dob;

    @Basic
    @Column(name = "testing_setting")
    private String testingSetting;

    @Column(name = "modality")
    private String modality;

    @Column(name = "spoke_facility")
    private String  spokeFacility;


    @Column(name = "health_facility")
    private String healthFacility;

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

    @Column(name = "source")
    private String source;

    @Basic
    @Column(name = "longitude")
    private String longitude;

    @Basic
    @Column(name = "latitude")
    private  String latitude;

    @PrePersist
    public void setFields(){
        if(StringUtils.isEmpty(code)){
            code = UUID.randomUUID().toString();
        }
    }

    public static RiskStratification toRiskStratification(RiskStratificationResponseDto riskStratificationDTO, String personUuid) {
        if ( riskStratificationDTO == null ) {
            return null;
        }

        RiskStratification riskStratification = new RiskStratification();

        riskStratification.setId(riskStratificationDTO.getId());
        riskStratification.setAge( riskStratificationDTO.getAge() );
        riskStratification.setPersonUuid(personUuid);
        riskStratification.setTestingSetting( riskStratificationDTO.getTestingSetting() );
        riskStratification.setModality( riskStratificationDTO.getModality() );
        riskStratification.setCode( riskStratificationDTO.getCode() );
        riskStratification.setTargetGroup( riskStratificationDTO.getTargetGroup() );
        riskStratification.setVisitDate( riskStratificationDTO.getVisitDate() );
        riskStratification.setDob(riskStratificationDTO.getDob());
        riskStratification.setRiskAssessment( riskStratificationDTO.getRiskAssessment() );
        riskStratification.setCommunityEntryPoint( riskStratificationDTO.getCommunityEntryPoint() );
        riskStratification.setLatitude(riskStratificationDTO.getLongitude());
        riskStratification.setLatitude(riskStratificationDTO.getLatitude());
        String sourceSupport = riskStratificationDTO.getSource() == null || riskStratificationDTO.getSource().isEmpty() ? Constants.WEB_SOURCE : Constants.MOBILE_SOURCE;
        riskStratificationDTO.setSource(sourceSupport);

        riskStratification.setEntryPoint( riskStratificationDTO.getEntryPoint());


        return riskStratification;
    }
}

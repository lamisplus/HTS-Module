package org.lamisplus.modules.hts.domain.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.array.StringArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeStringType;
import com.vladmihalcea.hibernate.type.json.JsonStringType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import org.lamisplus.modules.base.domain.entities.Audit;
import org.lamisplus.modules.patient.domain.entity.Person;
import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "hts_client")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class HtsClient extends Audit implements Serializable {
    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic
    @Column(name = "target_group")
    private String targetGroup;

    /*@ManyToOne
    @JoinColumn(name = "target_group", referencedColumnName = "id", insertable = false, updatable = false)
    private ApplicationCodeSet targetGroupCodeSet;*/

    @Basic
    @Column(name = "client_code")
    private String clientCode;

    @Basic
    @Column(name = "index_client_code")
    private String indexClientCode;

    @Basic
    @Column(name = "date_visit")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateVisit;

    @Basic
    @Column(name = "referred_from")
    private Long referredFrom;

    /*@ManyToOne
    @JoinColumn(name = "referred_from", referencedColumnName = "id", insertable = false, updatable = false)
    private ApplicationCodeSet referredFromCodeSet;*/

    private String capturedBy;

    @Basic
    @Column(name = "testing_setting")
    private String testingSetting;

    /*@ManyToOne
    @JoinColumn(name = "testing_setting", referencedColumnName = "id", insertable = false, updatable = false)
    private ApplicationCodeSet testingSettingCodeSet;*/

    @Basic
    @Column(name = "first_time_visit")
    private Boolean firstTimeVisit;
    @Basic
    @Column(name = "num_children")
    private Integer numChildren;
    @Basic
    @Column(name = "num_wives")
    private Integer numWives;
    @Basic
    @Column(name = "type_counseling")
    private Long typeCounseling;

    /*@ManyToOne
    @JoinColumn(name = "type_counseling", referencedColumnName = "id", insertable = false, updatable = false)
    private ApplicationCodeSet typeCounselingCodeSet;*/

    @Basic
    @Column(name = "index_client")
    private Boolean indexClient;

    @Basic
    @Column(name = "previously_tested")
    private Boolean previouslyTested; //within the last 3 months

    @Basic
    @Column(name = "facility_id")
    private Long facilityId;

    /*@ManyToOne
    @JoinColumn(name = "facility_id", referencedColumnName = "id", insertable = false, updatable = false)
    private OrganisationUnit facilityIdOrganisationUnit;*/

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "extra", columnDefinition = "jsonb")
    private Object extra;

    @Basic
    @Column(name = "person_uuid")
    private String personUuid;

    @Basic
    @Column(name = "uuid")
    private String uuid;

    @OneToOne
    @JoinColumn(name = "person_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private Person person;

    /*@ManyToOne
    @JoinColumn(name = "pregnant", referencedColumnName = "id", insertable = false, updatable = false)
    private ApplicationCodeSet pregnantCodeSet;*/

    @Basic
    @Column(name = "pregnant")
    private Long pregnant;

   /* @ManyToOne
    @JoinColumn(name = "breast_feeding", referencedColumnName = "id", insertable = false, updatable = false)
    private ApplicationCodeSet breastFeedingCodeSet;*/

    @Basic
    @Column(name = "breast_feeding")
    private Boolean breastFeeding;

    /*@ManyToOne
    @JoinColumn(name = "relation_with_index_client", referencedColumnName = "id", insertable = false, updatable = false)
    private ApplicationCodeSet relationWithIndexClientCodeSet;*/

    @Basic
    @Column(name = "relation_with_index_client")
    private Long relationWithIndexClient;

    //PRE TEST COUNSELING
    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "knowledge_assessment", columnDefinition = "jsonb")
    private  Object knowledgeAssessment;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "risk_assessment", columnDefinition = "jsonb")
    private  Object riskAssessment;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "tb_screening", columnDefinition = "jsonb")
    private  Object tbScreening;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "sti_screening", columnDefinition = "jsonb")
    private  Object stiScreening;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "sex_partner_risk_assessment", columnDefinition = "jsonb")
    private  Object sexPartnerRiskAssessment;

    //HIV Test Result 1
    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "test1", columnDefinition = "jsonb")
    private  Object test1;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "confirmatory_test", columnDefinition = "jsonb")
    private  Object confirmatoryTest;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "tie_breaker_test", columnDefinition = "jsonb")
    private  Object tieBreakerTest;

    @Basic
    @Column(name = "hiv_test_result")
    private String hivTestResult;

    //HIV Test result 2
    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "test2", columnDefinition = "jsonb")
    private  Object test2;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "confirmatory_test2", columnDefinition = "jsonb")
    private  Object confirmatoryTest2;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "tie_breaker_test2", columnDefinition = "jsonb")
    private  Object tieBreakerTest2;

    @Basic
    @Column(name = "hiv_test_result2")
    private String hivTestResult2;

    @Basic
    @Column(name = "archived")
    private int archived=0;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "syphilis_testing", columnDefinition = "jsonb")
    private Object syphilisTesting;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "hepatitis_testing", columnDefinition = "jsonb")
    private Object hepatitisTesting;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "others", columnDefinition = "jsonb")
    private Object others;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "cd4", columnDefinition = "jsonb")
    private Object cd4;

    //Recency Testing
    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "recency", columnDefinition = "jsonb")
    private Object recency;

    //Post test counseling
    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "post_test_counseling", columnDefinition = "jsonb")
    private Object postTestCounselingKnowledgeAssessment;

    //Index Notification Services - Elicitation
    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "index_notification_services_elicitation", columnDefinition = "jsonb")
    private Object indexNotificationServicesElicitation;

    @OneToMany(mappedBy = "htsClient")
    @ToString.Exclude
    @JsonIgnore
    public List<IndexElicitation> indexElicitation;

    @OneToOne
    @JoinColumn(name = "risk_stratification_code", referencedColumnName = "code", insertable = false, updatable = false)
    private RiskStratification riskStratification;

    @Basic
    @Column(name = "risk_stratification_code")
    private String riskStratificationCode;

    @PrePersist
    public void setFields(){
        if(StringUtils.isEmpty(uuid)){
            uuid = UUID.randomUUID().toString();
        }
    }

    @Column(name = "prep_offered")
    private Boolean prepOffered;

    @Column(name = "prep_accepted")
    private Boolean prepAccepted;

    @Column(name = "prep_given")
    private String prepGiven;

    @Column(name = "other_drugs")
    private String otherDrugs;
}

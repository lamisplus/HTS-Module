package org.lamisplus.modules.hts.domain.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.base.domain.entities.ApplicationCodeSet;
import org.lamisplus.modules.base.domain.entities.OrganisationUnit;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.patient.domain.entity.Person;
import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "hts_client")
public class HtsClient extends JsonBEntity implements Serializable {
    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic
    @Column(name = "target_group")
    private Long targetGroup;

    /*@ManyToOne
    @JoinColumn(name = "target_group", referencedColumnName = "id", insertable = false, updatable = false)
    private ApplicationCodeSet targetGroupCodeSet;*/

    @Basic
    @Column(name = "client_code")
    private String clientCode;
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
    private Long testingSetting;

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
    private Long breastFeeding;

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

    //HIV TEST RESULT
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

    //Recency Testing

}

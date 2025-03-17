package org.lamisplus.modules.hts.domain.entity;

import lombok.*;

import javax.persistence.*;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "hts_ml_feedback")
public class HtsFeedback {
    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Basic
    @Column(name = "facility_id")
    private Integer facilityId;
    @Basic
    @Column(name = "patient_id")
    private String patientId;
    @Basic
    @Column(name = "primary_basis_to_test")
    private String primaryBasisToTest;
    @Basic
    @Column(name = "client_tested_despite_low_risk_score")
    private String clientTestedDespiteLowRiskScore;
    @Basic
    @Column(name = "reason_for_testing_despite_low_risk_score")
    private String reasonForTestingDespiteLowRiskScore;
    @Basic
    @Column(name = "client_tested_despite_high_risk_score")
    private String clientTestedDespiteHighRiskScore;
    @Basic
    @Column(name = "main_reason_for_testing_this_client")
    private String mainReasonForTestingThisClient;
    @Basic
    @Column(name = "option_main_reason_for_testing_this_client")
    private String optionMainReasonForTestingThisClient;
    @Basic
    @Column(name = "main_reason_for_not_testing_this_client")
    private String mainReasonForNotTestingThisClient;
    @Basic
    @Column(name = "option_main_reason_for_not_testing_this_client")
    private String optionMainReasonForNotTestingThisClient;
    @Basic
    @Column(name = "risk_score_contribute_to_the_clinical_decision")
    private String riskScoreContributeToTheClinicalDecision;
}

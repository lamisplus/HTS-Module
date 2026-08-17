package org.lamisplus.modules.hts.domain.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.GenerationTime;
import org.lamisplus.modules.base.domain.entities.Audit;
import javax.persistence.*;

@Entity
@Table(name = "hivst_result")
@Data
@EqualsAndHashCode(callSuper = false)
public class HivstResult extends Audit<HivstResult> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Generated(GenerationTime.INSERT)
    @Column(columnDefinition = "varchar(50)", insertable = false, updatable = false, unique = true, nullable = false)
    private String uuid;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id", nullable = false, unique = true)
    private HivstEncounter encounter;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Column(name = "number_of_kits", nullable = false)
    private Integer numberOfKits;

    @Column(name = "reactive_gt_15", nullable = false)
    private Integer reactiveGt15 = 0;

    @Column(name = "reactive_le_15", nullable = false)
    private Integer reactiveLe15 = 0;

    @Column(nullable = false)
    private Boolean archived = false;
}
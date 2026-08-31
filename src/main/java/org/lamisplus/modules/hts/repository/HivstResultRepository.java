package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.HivstResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HivstResultRepository extends JpaRepository<HivstResult, Long> {

    Optional<HivstResult> findByIdAndArchived(Long id, Boolean archived);

    Optional<HivstResult> findByEncounter_IdAndArchived(Long encounterId, Boolean archived);

    @Query("SELECT r FROM HivstResult r WHERE r.encounter.person.id = :patientId AND r.archived = false")
    List<HivstResult> findByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT r FROM HivstResult r WHERE r.encounter.person.uuid = :patientUuid AND r.archived = false")
    List<HivstResult> findByPatientUuid(@Param("patientUuid") String patientUuid);
}
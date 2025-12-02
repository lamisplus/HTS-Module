package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.HtsClientReferral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HtsClientReferralRepository extends JpaRepository<HtsClientReferral, Long> {
    Optional<HtsClientReferral> findByHtsClientId(Long htsClientId);
    @Query("SELECT hcr FROM HtsClientReferral hcr " +
            "JOIN hcr.htsClient hc " +
            "WHERE hc.id = :id AND hcr.archived = :archived")
    List<HtsClientReferral> findHtsClientReferralByHtsClientId(@Param("id") Long id, @Param("archived") int archived);

    boolean existsByHtsClientAndNameOfPersonReferringClientAndNameOfContactPerson(String uuid, String nameOfPersonReferringClient, String NameOfContactPerson);

}

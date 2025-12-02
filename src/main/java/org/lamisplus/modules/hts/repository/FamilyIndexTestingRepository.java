package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.FamilyIndexTesting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FamilyIndexTestingRepository  extends JpaRepository<FamilyIndexTesting, Long> {

    Optional<FamilyIndexTesting> findByIdAndArchived(Long id, int archived);

    Optional<FamilyIndexTesting> findByHtsClientIdAndArchived(Long id, int unArchived);

    @Query(value = "SELECT * FROM hts_family_index_testing fit " +
            "JOIN hts_client c ON fit.hts_client_uuid = c.uuid " +
            "WHERE c.id = :id AND fit.archived = :archived", nativeQuery = true)
    FamilyIndexTesting findAllFamilyIndexTestingByHtsClientId(@Param("id") Long id, @Param("archived") int archived);

    boolean existsByContactId(String contactId);

}

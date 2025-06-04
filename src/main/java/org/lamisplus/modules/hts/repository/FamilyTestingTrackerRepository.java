package org.lamisplus.modules.hts.repository;

import io.vavr.collection.Traversable;
import org.lamisplus.modules.hts.domain.entity.FamilyTestingTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FamilyTestingTrackerRepository extends JpaRepository<FamilyTestingTracker, Long>{

    Optional<FamilyTestingTracker> findByIdAndArchived(Long id, int unArchived);


    @Query(value = "SELECT * FROM hts_family_index_testing_tracker fitt " +
            "JOIN hts_family_index c ON c.uuid = fitt.family_index_uuid " +
            "WHERE fitt.family_index_uuid = :uuid AND fitt.archived = :unArchived", nativeQuery = true)
    List<FamilyTestingTracker> findByFamilyIndexUuid(String uuid, int unArchived);

}

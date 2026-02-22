package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.HtsEncounter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface HtsEncounterRepository extends JpaRepository<HtsEncounter, Long> {

    Optional<HtsEncounter> findByIdAndArchived(Long id, int archived);

    @Query("SELECT e FROM HtsEncounter e " +
            "JOIN e.person p " +
            "WHERE e.archived = 0 AND e.facilityId = :facilityId " +
            "AND ( :search IS NULL OR :search = '*' OR " +
            "      e.clientCode LIKE %:search% OR " +
            "      p.surname LIKE %:search% OR p.firstName LIKE %:search% OR p.otherName LIKE %:search% )")
    Page<HtsEncounter> search(@Param("facilityId") Long facilityId,
                              @Param("search") String search,
                              Pageable pageable);
}
package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.IctEncounter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IctEncounterRepository extends JpaRepository<IctEncounter, Long> {

    Optional<IctEncounter> findByIdAndArchived(Long id, Boolean archived);

//    List<IctEncounter> findByPerson_IdAndArchivedOrderByDateOfServiceDesc(Long patientId, Boolean archived);

    List<IctEncounter> findByPerson_IdAndArchivedOrderByIdDesc(Long patientId, Boolean archived);


    Optional<IctEncounter> findByHtsEncounter_IdAndArchived(Long htsEncounterId, Boolean archived);

    @Query("SELECT e FROM IctEncounter e " +
            "JOIN e.person p " +
            "WHERE e.archived = false AND e.facilityId = :facilityId " +
            "AND ( :search IS NULL OR :search = '*' OR " +
            "      p.surname LIKE %:search% OR " +
            "      p.firstName LIKE %:search% OR " +
            "      p.otherName LIKE %:search% OR " +
            "      e.clientCategory LIKE %:search% )")
    Page<IctEncounter> search(@Param("facilityId") Long facilityId,
                              @Param("search") String search,
                              Pageable pageable);
}
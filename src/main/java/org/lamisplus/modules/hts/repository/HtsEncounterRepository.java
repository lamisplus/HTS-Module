package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.dto.PatientHtsSummaryProjection;
import org.lamisplus.modules.hts.domain.entity.HtsEncounter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
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

    List<HtsEncounter> findByPerson_IdAndArchivedOrderByDateOfVisitDesc(Long personId, int archived);

    @Query(value = "SELECT p.id AS personId, p.first_name AS firstName, p.surname AS surname, p.other_name AS otherName, p.hospital_number AS hospitalNumber, COUNT(e.id) AS encounterCount " +
            "FROM patient_person p INNER JOIN hts_encounter e ON p.id = e.person_id " +
            "WHERE p.archived = 0 AND e.archived = 0 AND e.facility_id = :facilityId " +
            "AND (:search IS NULL OR " +
            "      p.first_name ILIKE CAST(:search AS text) OR " +
            "      p.surname ILIKE CAST(:search AS text) OR " +
            "      p.other_name ILIKE CAST(:search AS text) OR " +
            "      e.client_code ILIKE CAST(:search AS text) OR " +
            "      EXISTS (SELECT 1 FROM jsonb_array_elements(p.contact_point->'contactPoint') AS cp " +
            "               WHERE cp->>'value' ILIKE CAST(:search AS text)) " +
            ") " +
            "GROUP BY p.id",
            countQuery = "SELECT COUNT(DISTINCT p.id) FROM patient_person p INNER JOIN hts_encounter e ON p.id = e.person_id " +
                    "WHERE p.archived = 0 AND e.archived = 0 AND e.facility_id = :facilityId " +
                    "AND (:search IS NULL OR " +
                    "      p.first_name ILIKE CAST(:search AS text) OR " +
                    "      p.surname ILIKE CAST(:search AS text) OR " +
                    "      p.other_name ILIKE CAST(:search AS text) OR " +
                    "      e.client_code ILIKE CAST(:search AS text) OR " +
                    "      EXISTS (SELECT 1 FROM jsonb_array_elements(p.contact_point->'contactPoint') AS cp " +
                    "               WHERE cp->>'value' ILIKE CAST(:search AS text)) " +
                    ")",
            nativeQuery = true)
    Page<PatientHtsSummaryProjection> findPatientSummaries(@Param("facilityId") Long facilityId,
                                                           @Param("search") String search,
                                                           Pageable pageable);
}
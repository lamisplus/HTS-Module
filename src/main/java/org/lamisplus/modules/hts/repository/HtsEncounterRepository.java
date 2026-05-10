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

    Optional<HtsEncounter> findByIdAndArchived(Long id, Boolean archived);

    List<HtsEncounter> findByPerson_IdAndArchivedOrderByDateOfVisitDesc(Long patientId, Boolean archived);

    @Query("SELECT e FROM HtsEncounter e " +
            "JOIN e.person p " +
            "WHERE e.archived = false " +
            "AND e.facilityId = :facilityId " +
            "AND (:search IS NULL OR :search = '*' OR " +
            "     e.clientCode LIKE %:search% OR " +
            "     p.surname    LIKE %:search% OR " +
            "     p.firstName  LIKE %:search% OR " +
            "     p.otherName  LIKE %:search%)")
    Page<HtsEncounter> search(
            @Param("facilityId") Long facilityId,
            @Param("search") String search,
            Pageable pageable);

    @Query(value =
            "SELECT p.id AS personId, p.first_name AS firstName, p.surname AS surname, " +
                    "       p.other_name AS otherName, p.hospital_number AS hospitalNumber, " +
                    "       COUNT(e.id) AS encounterCount " +
                    "FROM patient_person p " +
                    "INNER JOIN hts_encounter e ON p.id = e.patient_id " +
                    "WHERE p.archived = 0 AND e.archived = false " +
                    "  AND e.facility_id = :facilityId " +
                    "  AND (:search IS NULL OR " +
                    "       p.first_name     ILIKE CAST(:search AS text) OR " +
                    "       p.surname        ILIKE CAST(:search AS text) OR " +
                    "       p.other_name     ILIKE CAST(:search AS text) OR " +
                    "       e.client_code    ILIKE CAST(:search AS text) OR " +
                    "       EXISTS (SELECT 1 FROM jsonb_array_elements(p.contact_point->'contactPoint') AS cp " +
                    "               WHERE cp->>'value' ILIKE CAST(:search AS text))) " +
                    "GROUP BY p.id",
            countQuery =
                    "SELECT COUNT(DISTINCT p.id) " +
                            "FROM patient_person p " +
                            "INNER JOIN hts_encounter e ON p.id = e.patient_id " +
                            "WHERE p.archived = 0 AND e.archived = false " +
                            "  AND e.facility_id = :facilityId " +
                            "  AND (:search IS NULL OR " +
                            "       p.first_name     ILIKE CAST(:search AS text) OR " +
                            "       p.surname        ILIKE CAST(:search AS text) OR " +
                            "       p.other_name     ILIKE CAST(:search AS text) OR " +
                            "       e.client_code    ILIKE CAST(:search AS text) OR " +
                            "       EXISTS (SELECT 1 FROM jsonb_array_elements(p.contact_point->'contactPoint') AS cp " +
                            "               WHERE cp->>'value' ILIKE CAST(:search AS text)))",
            nativeQuery = true)
    Page<PatientHtsSummaryProjection> findPatientSummaries(
            @Param("facilityId") Long facilityId,
            @Param("search") String search,
            Pageable pageable);

    // ─── FIX: cast both UUID and JSONB columns to text ─────────────────────────
    @Query(value =
            "SELECT " +
                    "    e.id, " +
                    "    CAST(e.uuid AS text), " +                 // ✅ UUID → text
                    "    p.id                    AS person_id, " +
                    "    e.client_code, " +
                    "    e.date_of_visit, " +
                    "    e.setting, " +
                    "    CAST(e.observation AS text), " +         // ✅ JSONB → text
                    "    e.facility_id, " +
                    "    hts_agg.hts_count, " +
                    "    ict_agg.ict_count " +
                    "FROM patient_person p " +
                    "INNER JOIN (" +
                    "    SELECT patient_id, MAX(id) AS max_id " +
                    "    FROM hts_encounter " +
                    "    WHERE archived = false " +
                    "    GROUP BY patient_id" +
                    ") latest ON latest.patient_id = p.id " +
                    "INNER JOIN hts_encounter e ON e.id = latest.max_id " +
                    "INNER JOIN (" +
                    "    SELECT patient_id, COUNT(*) AS hts_count " +
                    "    FROM hts_encounter " +
                    "    WHERE archived = false " +
                    "    GROUP BY patient_id" +
                    ") hts_agg ON hts_agg.patient_id = p.id " +
                    "LEFT JOIN (" +
                    "    SELECT patient_id, COUNT(*) AS ict_count " +
                    "    FROM hts_ict_encounter " +
                    "    WHERE archived = false " +
                    "    GROUP BY patient_id" +
                    ") ict_agg ON ict_agg.patient_id = p.id " +
                    "WHERE p.archived = 0 " +
                    "  AND (:search IS NULL " +
                    "       OR p.first_name      ILIKE CAST(:search AS text) " +
                    "       OR p.surname         ILIKE CAST(:search AS text) " +
                    "       OR p.other_name      ILIKE CAST(:search AS text) " +
                    "       OR p.hospital_number ILIKE CAST(:search AS text) " +
                    "       OR EXISTS (" +
                    "           SELECT 1 " +
                    "           FROM jsonb_array_elements(p.contact_point->'contactPoint') cp " +
                    "           WHERE cp->>'value' ILIKE CAST(:search AS text)" +
                    "       )) " +
                    "ORDER BY e.id DESC",
            countQuery =
                    "SELECT COUNT(DISTINCT p.id) " +
                            "FROM patient_person p " +
                            "INNER JOIN hts_encounter e ON e.patient_id = p.id AND e.archived = false " +
                            "WHERE p.archived = 0 " +
                            "  AND (:search IS NULL " +
                            "       OR p.first_name      ILIKE CAST(:search AS text) " +
                            "       OR p.surname         ILIKE CAST(:search AS text) " +
                            "       OR p.other_name      ILIKE CAST(:search AS text) " +
                            "       OR p.hospital_number ILIKE CAST(:search AS text) " +
                            "       OR EXISTS (" +
                            "           SELECT 1 " +
                            "           FROM jsonb_array_elements(p.contact_point->'contactPoint') cp " +
                            "           WHERE cp->>'value' ILIKE CAST(:search AS text)" +
                            "       ))",
            nativeQuery = true)
    Page<Object[]> findHtsPatientSummaries(
            @Param("search") String search,
            Pageable pageable);
}
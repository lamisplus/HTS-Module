package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.dto.PatientHtsSummaryProjection;
import org.lamisplus.modules.hts.domain.entity.HtsEncounter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HtsEncounterRepository extends JpaRepository<HtsEncounter, Long> {

    Optional<HtsEncounter> findByIdAndArchived(Long id, Boolean archived);

    List<HtsEncounter> findByPerson_IdAndArchivedOrderByDateOfVisitDesc(Long patientId, Boolean archived);

    Optional<HtsEncounter> findFirstByPatientUuidAndDateOfVisitAndArchivedOrderByIdDesc(
            UUID patientUuid, LocalDate dateOfVisit, Boolean archived);

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

    @Query(value =
            "SELECT \n" +
                    "    e.id, \n" +
                    "    CAST(e.uuid AS text),                \n" +
                    "    p.id                    AS person_id, \n" +
                    "    e.client_code, \n" +
                    "    e.date_of_visit, \n" +
                    "    e.setting, \n" +
                    "    CAST(e.observation AS text),          \n" +
                    "    e.facility_id, \n" +
                    "    hts_agg.hts_count, \n" +
                    "    ict_agg.ict_count \n" +
                    "FROM patient_person p \n" +
                    "INNER JOIN (\n" +
                    "    SELECT patient_uuid, MAX(id) AS max_id \n" +
                    "    FROM hts_encounter \n" +
                    "    WHERE archived = false \n" +
                    "\tAND facility_id=:facilityId\n" +
                    "    GROUP BY patient_uuid\n" +
                    ") latest ON latest.patient_uuid = p.uuid \n" +
                    "INNER JOIN hts_encounter e ON e.id = latest.max_id \n" +
                    "INNER JOIN (\n" +
                    "    SELECT patient_uuid, COUNT(*) AS hts_count \n" +
                    "    FROM hts_encounter \n" +
                    "    WHERE archived = false \n" +
                    "\tAND facility_id=:facilityId\n" +
                    "    GROUP BY patient_uuid\n" +
                    ") hts_agg ON hts_agg.patient_uuid = p.uuid \n" +
                    "LEFT JOIN (\n" +
                    "    SELECT patient_uuid, COUNT(*) AS ict_count \n" +
                    "    FROM hts_ict_encounter \n" +
                    "    WHERE archived = false \n" +
                    "\tAND facility_id=:facilityId\n" +
                    "    GROUP BY patient_uuid\n" +
                    ") ict_agg ON ict_agg.patient_uuid = p.uuid \n" +
                    "WHERE p.archived = 0 \n" +
                    "\tAND p.facility_id=:facilityId\n" +
                    "    AND (:search IS NULL \n" +
                    "        OR p.first_name      ILIKE CAST(:search AS text) \n" +
                    "        OR p.surname         ILIKE CAST(:search AS text) \n" +
                    "        OR p.other_name      ILIKE CAST(:search AS text) \n" +
                    "        OR p.hospital_number ILIKE CAST(:search AS text) \n" +
                    "        OR e.client_code      ILIKE CAST(:search AS text) \n" +
                    "        OR EXISTS (\n" +
                    "            SELECT 1 \n" +
                    "            FROM jsonb_array_elements(p.contact_point->'contactPoint') cp \n" +
                    "            WHERE cp->>'value' ILIKE CAST(:search AS text)\n" +
                    "        )) \n" +
                    "ORDER BY e.id DESC",
            countQuery =
                    "SELECT COUNT(DISTINCT p.id) \n" +
                            "    FROM patient_person p \n" +
                            "    INNER JOIN hts_encounter e ON e.patient_uuid = p.uuid AND e.archived = false \n" +
                            "    WHERE p.archived = 0 \n" +
                            "    AND p.facility_id=:facilityId\n" +
                            "        AND (:search IS NULL \n" +
                            "            OR p.first_name      ILIKE CAST(:search AS text) \n" +
                            "            OR p.surname         ILIKE CAST(:search AS text) \n" +
                            "            OR p.other_name      ILIKE CAST(:search AS text) \n" +
                            "            OR p.hospital_number ILIKE CAST(:search AS text) \n" +
                            "            OR e.client_code      ILIKE CAST(:search AS text) \n" +
                            "            OR EXISTS (\n" +
                            "                SELECT 1 \n" +
                            "                FROM jsonb_array_elements(p.contact_point->'contactPoint') cp \n" +
                            "                WHERE cp->>'value' ILIKE CAST(:search AS text)\n" +
                            "            ))",
            nativeQuery = true)
    Page<Object[]> findHtsPatientSummaries(
            Long facilityId,
            @Param("search") String search,
            Pageable pageable);
}
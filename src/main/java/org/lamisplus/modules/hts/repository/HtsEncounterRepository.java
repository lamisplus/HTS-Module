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

public interface HtsEncounterRepository extends JpaRepository<HtsEncounter, Long> {

    Optional<HtsEncounter> findByIdAndArchived(Long id, Boolean archived);

    List<HtsEncounter> findByPerson_IdAndArchivedOrderByDateOfVisitDesc(Long patientId, Boolean archived);

    Optional<HtsEncounter> findFirstByPatientUuidAndDateOfVisitAndArchivedOrderByIdDesc(
            String patientUuid, LocalDate dateOfVisit, Boolean archived);

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

    String HTS_SUMMARY_CTES =
            "WITH hts_agg AS (\n" +
                    "    SELECT DISTINCT ON (e.patient_uuid)\n" +
                    "        e.id, e.uuid, e.patient_uuid, e.client_code, e.date_of_visit,\n" +
                    "        e.setting, e.observation, e.facility_id,\n" +
                    "        COUNT(*) OVER (PARTITION BY e.patient_uuid) AS hts_count\n" +
                    "    FROM hts_encounter e\n" +
                    "    WHERE e.archived = false\n" +
                    "      AND e.facility_id = :facilityId\n" +
                    "    ORDER BY e.patient_uuid, e.id DESC\n" +
                    "),\n" +
                    "ict_agg AS (\n" +
                    "    SELECT patient_uuid, COUNT(*) AS ict_count\n" +
                    "    FROM hts_ict_encounter\n" +
                    "    WHERE archived = false\n" +
                    "      AND facility_id = :facilityId\n" +
                    "    GROUP BY patient_uuid\n" +
                    ")\n";

    String HTS_SUMMARY_WHERE =
            "WHERE p.archived = 0\n" +
                    "  AND p.facility_id = :facilityId\n" +
                    "  AND (:search IS NULL\n" +
                    "      OR p.first_name      ILIKE CAST(:search AS text)\n" +
                    "      OR p.surname         ILIKE CAST(:search AS text)\n" +
                    "      OR p.other_name      ILIKE CAST(:search AS text)\n" +
                    "      OR p.hospital_number ILIKE CAST(:search AS text)\n" +
                    "      OR hts.client_code   ILIKE CAST(:search AS text)\n" +
                    "      OR EXISTS (\n" +
                    "          SELECT 1\n" +
                    "          FROM jsonb_array_elements(p.contact_point->'contactPoint') cp\n" +
                    "          WHERE cp->>'value' ILIKE CAST(:search AS text)\n" +
                    "      ))\n";

    @Query(value =
            HTS_SUMMARY_CTES +
                    "SELECT\n" +
                    "    hts.id,\n" +
                    "    CAST(hts.uuid AS text),\n" +
                    "    p.id                    AS person_id,\n" +
                    "    hts.client_code,\n" +
                    "    hts.date_of_visit,\n" +
                    "    hts.setting,\n" +
                    "    CAST(hts.observation AS text),\n" +
                    "    hts.facility_id,\n" +
                    "    hts.hts_count,\n" +
                    "    COALESCE(ict.ict_count, 0) AS ict_count\n" +
                    "FROM patient_person p\n" +
                    // patient_uuid is now varchar (legacy-tolerant); p.uuid / ict.patient_uuid
                    // are still native uuid columns, so cast explicitly on both sides.
                    "INNER JOIN hts_agg hts ON hts.patient_uuid = CAST(p.uuid AS text)\n" +
                    "LEFT JOIN ict_agg ict ON CAST(ict.patient_uuid AS text) = CAST(p.uuid AS text)\n" +
                    HTS_SUMMARY_WHERE +
                    "ORDER BY hts.id DESC",
            countQuery =

                    "SELECT COUNT(*)\n" +
                            "FROM patient_person p\n" +
                            "WHERE p.archived = 0\n" +
                            "  AND p.facility_id = :facilityId\n" +
                            "  AND EXISTS (\n" +
                            "      SELECT 1 FROM hts_encounter e\n" +
                            "      WHERE e.patient_uuid = CAST(p.uuid AS text)\n" +
                            "        AND e.archived = false\n" +
                            "        AND e.facility_id = :facilityId\n" +
                            "  )\n" +
                            "  AND (:search IS NULL\n" +
                            "      OR p.first_name      ILIKE CAST(:search AS text)\n" +
                            "      OR p.surname         ILIKE CAST(:search AS text)\n" +
                            "      OR p.other_name      ILIKE CAST(:search AS text)\n" +
                            "      OR p.hospital_number ILIKE CAST(:search AS text)\n" +
                            "      OR EXISTS (\n" +
                            "          SELECT 1 FROM hts_encounter e2\n" +
                            "          WHERE CAST(e2.patient_uuid AS text) = CAST(p.uuid AS text)\n" +
                            "            AND e2.archived = false\n" +
                            "            AND e2.facility_id = :facilityId\n" +
                            "            AND e2.client_code ILIKE CAST(:search AS text)\n" +
                            "      )\n" +
                            "      OR EXISTS (\n" +
                            "          SELECT 1\n" +
                            "          FROM jsonb_array_elements(p.contact_point->'contactPoint') cp\n" +
                            "          WHERE cp->>'value' ILIKE CAST(:search AS text)\n" +
                            "      ))",
            nativeQuery = true)
    Page<Object[]> findHtsPatientSummariesOptimized(
            @Param("facilityId") Long facilityId,
            @Param("search") String search,
            Pageable pageable);
}
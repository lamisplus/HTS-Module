package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.HivstEncounter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HivstEncounterRepository extends JpaRepository<HivstEncounter, Long> {

    Optional<HivstEncounter> findByIdAndArchived(Long id, Boolean archived);

    List<HivstEncounter> findByPerson_IdAndArchivedOrderByDateOfVisitDesc(Long patientId, Boolean archived);

    // Mirrors HtsEncounterRepository's findHtsPatientSummariesOptimized pattern:
    // one DISTINCT ON + COUNT(*) OVER (PARTITION BY ...) pass over hivst_encounter
    // for the latest encounter + total count, plus a small aggregate CTE for result
    // counts (like HTS's ict_agg).
    //
    // IMPORTANT: :facilityId / :search are each bound EXACTLY ONCE, in the top
    // "params" CTE below, then reused via CROSS JOIN params everywhere else in
    // the query. Native queries in this Hibernate/Spring Data JPA version have
    // proven unreliable with a named or positional parameter referenced many
    // times in one query (caused both a Postgres-side syntax error AND, with
    // positional params, an application startup failure) — binding once and
    // reusing the captured value via SQL avoids that whole class of bug.
    String HIVST_SUMMARY_CTES =
            "WITH params AS (\n" +
                    "    SELECT CAST(:facilityId AS bigint) AS facility_id,\n" +
                    "           CAST(:search AS text) AS search_term\n" +
                    "),\n" +
                    "hivst_agg AS (\n" +
                    "    SELECT DISTINCT ON (e.patient_uuid)\n" +
                    "        e.patient_uuid, e.client_code, e.date_of_visit,\n" +
                    "        COUNT(*) OVER (PARTITION BY e.patient_uuid) AS encounter_count\n" +
                    "    FROM hivst_encounter e\n" +
                    "    CROSS JOIN params\n" +
                    "    WHERE e.archived = false\n" +
                    "      AND e.facility_id = params.facility_id\n" +
                    "    ORDER BY e.patient_uuid, e.id DESC\n" +
                    "),\n" +
                    "hivst_res_agg AS (\n" +
                    "    SELECT e.patient_uuid, COUNT(*) AS result_count\n" +
                    "    FROM hivst_result r\n" +
                    "    JOIN hivst_encounter e ON r.encounter_id = e.id\n" +
                    "    CROSS JOIN params\n" +
                    "    WHERE r.archived = false\n" +
                    "      AND e.archived = false\n" +
                    "      AND e.facility_id = params.facility_id\n" +
                    "    GROUP BY e.patient_uuid\n" +
                    ")\n";

    String HIVST_SUMMARY_WHERE =
            "WHERE p.archived = 0\n" +
                    "  AND p.facility_id = params.facility_id\n" +
                    // Only patients with at least one non-archived HIVST encounter at this
                    // facility where kits were actually distributed (> 0) qualify for the list.
                    "  AND EXISTS (\n" +
                    "      SELECT 1 FROM hivst_encounter e3\n" +
                    "      WHERE e3.patient_uuid = CAST(p.uuid AS text)\n" +
                    "        AND e3.archived = false\n" +
                    "        AND e3.facility_id = params.facility_id\n" +
                    "        AND COALESCE(CAST(e3.observation->>'numberOfHivstKitDistributed' AS int), 0) > 0\n" +
                    "  )\n" +
                    "  AND (params.search_term IS NULL OR params.search_term = '*' OR\n" +
                    "       p.first_name ILIKE params.search_term OR\n" +
                    "       p.surname ILIKE params.search_term OR\n" +
                    "       p.other_name ILIKE params.search_term OR\n" +
                    "       p.hospital_number ILIKE params.search_term OR\n" +
                    "       hv.client_code ILIKE params.search_term OR\n" +
                    "       EXISTS (\n" +
                    "           SELECT 1 FROM jsonb_array_elements(p.contact_point->'contactPoint') cp\n" +
                    "           WHERE cp->>'value' ILIKE params.search_term\n" +
                    "       ))\n";

    @Query(value =
            HIVST_SUMMARY_CTES +
                    "SELECT\n" +
                    "    p.id AS patientId,\n" +
                    "    p.first_name AS firstName,\n" +
                    "    p.surname AS surname,\n" +
                    "    p.other_name AS otherName,\n" +
                    "    p.hospital_number AS hospitalNumber,\n" +
                    "    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth)) AS age,\n" +
                    "    p.sex AS sex,\n" +
                    "    (SELECT cp->>'value' FROM jsonb_array_elements(p.contact_point->'contactPoint') cp WHERE cp->>'type' = 'phone' LIMIT 1) AS phoneNumber,\n" +
                    "    hv.client_code AS latestClientCode,\n" +
                    "    COALESCE(hv.encounter_count, 0) AS encounterCount,\n" +
                    "    COALESCE(res.result_count, 0) AS resultCount\n" +
                    "FROM patient_person p\n" +
                    "CROSS JOIN params\n" +
                    "INNER JOIN hivst_agg hv ON hv.patient_uuid = CAST(p.uuid AS text)\n" +
                    "LEFT JOIN hivst_res_agg res ON res.patient_uuid = CAST(p.uuid AS text)\n" +
                    HIVST_SUMMARY_WHERE +
                    "ORDER BY hv.date_of_visit DESC",
            countQuery =
                    "WITH params AS (\n" +
                            "    SELECT CAST(:facilityId AS bigint) AS facility_id,\n" +
                            "           CAST(:search AS text) AS search_term\n" +
                            ")\n" +
                            "SELECT COUNT(*)\n" +
                            "FROM patient_person p\n" +
                            "CROSS JOIN params\n" +
                            "WHERE p.archived = 0\n" +
                            "  AND p.facility_id = params.facility_id\n" +
                            "  AND EXISTS (\n" +
                            "      SELECT 1 FROM hivst_encounter e\n" +
                            "      WHERE e.patient_uuid = CAST(p.uuid AS text)\n" +
                            "        AND e.archived = false\n" +
                            "        AND e.facility_id = params.facility_id\n" +
                            "        AND COALESCE(CAST(e.observation->>'numberOfHivstKitDistributed' AS int), 0) > 0\n" +
                            "  )\n" +
                            "  AND (params.search_term IS NULL OR params.search_term = '*' OR\n" +
                            "       p.first_name ILIKE params.search_term OR\n" +
                            "       p.surname ILIKE params.search_term OR\n" +
                            "       p.other_name ILIKE params.search_term OR\n" +
                            "       p.hospital_number ILIKE params.search_term OR\n" +
                            "       EXISTS (\n" +
                            "           SELECT 1 FROM jsonb_array_elements(p.contact_point->'contactPoint') cp\n" +
                            "           WHERE cp->>'value' ILIKE params.search_term\n" +
                            "       ) OR\n" +
                            "       EXISTS (\n" +
                            "           SELECT 1 FROM hivst_encounter e2\n" +
                            "           WHERE CAST(e2.patient_uuid AS text) = CAST(p.uuid AS text)\n" +
                            "             AND e2.archived = false\n" +
                            "             AND e2.facility_id = params.facility_id\n" +
                            "             AND e2.client_code ILIKE params.search_term\n" +
                            "       ))",
            nativeQuery = true)
    Page<Object[]> findHivstPatientSummaries(
            @Param("facilityId") Long facilityId,
            @Param("search") String search,
            Pageable pageable
    );
}
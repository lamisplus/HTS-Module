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

    @Query(value =
            "WITH latest_enc AS (\n" +
                    "    SELECT DISTINCT ON (patient_uuid) \n" +
                    "        patient_uuid, client_code, date_of_visit, observation\n" +
                    "    FROM hivst_encounter\n" +
                    "    WHERE archived = false AND facility_id = :facilityId\n" +
                    "    ORDER BY patient_uuid, date_of_visit DESC, id DESC\n" +
                    "),\n" +
                    "enc_counts AS (\n" +
                    "    SELECT patient_uuid, COUNT(*) AS encounter_count\n" +
                    "    FROM hivst_encounter\n" +
                    "    WHERE archived = false AND facility_id = :facilityId\n" +
                    "    GROUP BY patient_uuid\n" +
                    "),\n" +
                    "res_counts AS (\n" +
                    "    SELECT p_uuid, COUNT(*) AS result_count\n" +
                    "    FROM (\n" +
                    "        SELECT e.patient_uuid AS p_uuid\n" +
                    "        FROM hivst_result r\n" +
                    "        JOIN hivst_encounter e ON r.encounter_id = e.id\n" +
                    "        WHERE r.archived = false AND e.facility_id = :facilityId\n" +
                    "    ) res\n" +
                    "    GROUP BY p_uuid\n" +
                    ")\n" +
                    "SELECT \n" +
                    "    p.id AS patientId,\n" +
                    "    p.first_name AS firstName,\n" +
                    "    p.surname AS surname,\n" +
                    "    p.other_name AS otherName,\n" +
                    "    p.hospital_number AS hospitalNumber,\n" +
                    "    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth)) AS age,\n" +
                    "    p.sex AS sex,\n" +
                    "    (SELECT cp->>'value' FROM jsonb_array_elements(p.contact_point->'contactPoint') cp WHERE cp->>'type' = 'phone' LIMIT 1) AS phoneNumber,\n" +
                    "    le.client_code AS latestClientCode,\n" +
                    "    COALESCE(ec.encounter_count, 0) AS encounterCount,\n" +
                    "    COALESCE(rc.result_count, 0) AS resultCount\n" +
                    "FROM patient_person p\n" +
                    "INNER JOIN latest_enc le ON le.patient_uuid = CAST(p.uuid AS text)\n" +
                    "LEFT JOIN enc_counts ec ON ec.patient_uuid = CAST(p.uuid AS text)\n" +
                    "LEFT JOIN res_counts rc ON rc.p_uuid = CAST(p.uuid AS text)\n" +
                    "WHERE p.archived = 0\n" +
                    "  AND p.facility_id = :facilityId\n" +
                    "  AND (:search IS NULL OR :search = '*' OR\n" +
                    "       p.first_name ILIKE :search OR p.surname ILIKE :search OR p.other_name ILIKE :search OR\n" +
                    "       p.hospital_number ILIKE :search OR\n" +
                    "       EXISTS (SELECT 1 FROM jsonb_array_elements(p.contact_point->'contactPoint') cp WHERE cp->>'value' ILIKE :search) OR\n" +
                    "       le.client_code ILIKE :search)\n" +
                    "ORDER BY le.date_of_visit DESC, le.id DESC",
            countQuery =
                    "SELECT COUNT(DISTINCT p.id)\n" +
                            "FROM patient_person p\n" +
                            "INNER JOIN hivst_encounter e ON e.patient_uuid = CAST(p.uuid AS text)\n" +
                            "WHERE p.archived = 0 AND p.facility_id = :facilityId AND e.archived = false AND e.facility_id = :facilityId\n" +
                            "  AND (:search IS NULL OR :search = '*' OR\n" +
                            "       p.first_name ILIKE :search OR p.surname ILIKE :search OR p.other_name ILIKE :search OR\n" +
                            "       p.hospital_number ILIKE :search OR\n" +
                            "       EXISTS (SELECT 1 FROM jsonb_array_elements(p.contact_point->'contactPoint') cp WHERE cp->>'value' ILIKE :search) OR\n" +
                            "       e.client_code ILIKE :search)",
            nativeQuery = true)
    Page<Object[]> findHivstPatientSummaries(
            @Param("facilityId") Long facilityId,
            @Param("search") String search,
            Pageable pageable
    );
}
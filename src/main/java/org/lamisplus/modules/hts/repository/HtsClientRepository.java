package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.HtsPerson;
import org.lamisplus.modules.hts.domain.entity.HtsClient;
import org.lamisplus.modules.hts.domain.entity.HtsPersonPatientDuplicate;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface HtsClientRepository extends JpaRepository<HtsClient, Long> {
    List<HtsClient> findAllByPerson(Person person);
    List<HtsClient> findAllByPersonAndArchived(Person person, Integer archived);
    List<HtsClient> findAllByPersonOrderByIdDesc(Person person);
    Page<HtsClient> findAll(Pageable pageable);
    Optional<HtsClient> findByUuid(String uuid);
    @Query(value = "SELECT max(id) FROM hts_client", nativeQuery = true)
    Optional<Long> maxId();

    Optional<HtsClient> findByIdAndArchived(Long id, int archived);

    Optional<HtsClient> findByIdAndArchivedAndFacilityId(Long htsClientId, int archived, Long facilityId);

    @Query(value = "SELECT * FROM hts_client WHERE person_uuid=?1 AND " +
            "archived=?2 AND facility_id=?3 ORDER BY date_created DESC LIMIT 1", nativeQuery = true)
    Optional<HtsClient> findLatestHts(String personUuid, int archived, Long facilityId);

    Optional<HtsClient> findTopByPersonUuidAndArchivedAndFacilityId(String personUuid, Integer archived, Long facilityId);

    Optional<HtsClient> findFirstByRiskStratificationCode(String riskStratificationCode);


    @Query(value = "SELECT \n" +
            "    p.hospital_number AS hospitalNumber,\n" +
            "    p.id AS personId,\n" +
            "    p.uuid AS personUuid,\n" +
            "    p.first_name AS firstName,\n" +
            "    p.surname AS surname,\n" +
            "    p.other_name AS otherName,\n" +
            "    CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age,\n" +
            "    INITCAP(p.sex) AS gender\n" +
            "FROM patient_person p\n" +
            "WHERE p.archived = ?1\n" +
            "AND (\n" +
            "       p.first_name ILIKE ?3\n" +
            "    OR p.surname ILIKE ?3\n" +
            "    OR p.other_name ILIKE ?3\n" +
            "    OR p.hospital_number ILIKE ?3\n" +
            "    OR p.contact_point#>>'{contactPoint,0,value}' ILIKE ?3\n" +
            ")\n" +
            "AND NOT EXISTS (\n" +
            "    SELECT 1\n" +
            "    FROM hts_encounter hs\n" +
            "    WHERE hs.client_code = p.hospital_number\n" +
            "    AND hs.archived = false\n" +
            "    AND CAST(hs.patient_uuid AS TEXT) IS NOT NULL AND CAST(hs.patient_uuid AS TEXT) != ''\n" +
            "    AND hs.facility_id = ?2\n" +
            ")\n" +
            "AND NOT EXISTS (\n" +
            "    SELECT 1\n" +
            "    FROM hts_encounter htse\n" +
            "    WHERE CAST(htse.patient_uuid AS TEXT) = p.uuid\n" +
            "    AND htse.facility_id = ?2\n" +
            "    AND htse.archived = false\n" +
            ")\n" +
            "AND is_pmtct_infant(p.hospital_number) = FALSE\n" +
            "", nativeQuery = true)
    Page<HtsPerson> findAllPersonHtsBySearchParam(Integer archived, Long facilityId, String search, Pageable pageable);


    @Query(value = "SELECT DISTINCT hc.client_code AS clientCode, p.id as personId,p.uuid as personUuid, p.first_name as firstName, p.surname as surname, p.other_name as otherName,  \n" +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,  \n" +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth,mini.person_uuid,mini.hts_count htsCount \n" +
            "FROM patient_person p \n" +
            "INNER JOIN hts_client hc ON hc.person_uuid = p.uuid AND hc.archived = ?1 \n" +
            "INNER JOIN (SELECT person_uuid,MIN(date_created) first_hts_registration,COUNT(person_uuid) hts_count \n" +
            "FROM hts_client \n" +
            "WHERE person_uuid IS NOT NULL AND archived = ?1 AND facility_id=?2 " +
            "GROUP BY 1) mini \n" +
            "ON hc.person_uuid=mini.person_uuid AND hc.date_created=mini.first_hts_registration \n" +
            "where  p.first_name ILIKE ?3 OR p.surname ILIKE ?3 OR p.other_name ILIKE ?3 \n" +
            "OR p.hospital_number ILIKE ?3 OR hc.client_code ILIKE ?3 ", nativeQuery = true)
    Page<HtsPerson> findOnlyPersonHtsBySearchParam(Integer archived, Long facilityId, String search, Pageable pageable);


    @Query(value = "SELECT hc.client_code as clientCode, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName, " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age, " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, CAST (COUNT(hc.person_uuid) AS INTEGER) as htsCount " +
            "FROM patient_person p " +
            "LEFT JOIN hts_client hc ON hc.person_uuid = p.uuid AND hc.archived = ?1 " +
            "WHERE p.archived=?1 AND p.facility_id=?2 AND (p.first_name ILIKE ?3 " +
            "OR p.surname ILIKE ?3 OR p.other_name ILIKE ?3 " +
            "OR p.hospital_number ILIKE ?3 OR hc.client_code ILIKE ?3) " +
            "GROUP BY hc.client_code, p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth", nativeQuery = true)
    List<HtsPerson> findAllPersonHtsBySearchParam(Integer archived, Long facilityId, String search);



    @Query(value = "SELECT p.hospital_number AS hospitalNumber, p.uuid as personUuid, p.id AS personId,  p.first_name AS firstName, p.surname AS surname,  \n" +
            "   p.other_name AS otherName, CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age, INITCAP(p.sex) AS gender  \n" +
            "\tFROM patient_person p  \n" +
            "\tWHERE  p.archived = ?1 AND p.facility_id = ?2 \n" +
            "\t\t\t\tAND NOT EXISTS (\n" +
            "\t\t\t\t\tSELECT 1 \n" +
            "\t\t\t\t\tFROM hts_encounter hs\n" +
            "\t\t\t\t\tWHERE hs.client_code = p.hospital_number\n" +
            "\t\t\t\t\tAND hs.archived = false \n" +
            "\t\t\t\t\tAND CAST(hs.patient_uuid AS TEXT) is not null AND CAST(hs.patient_uuid AS TEXT) != ''\n" +
            "\t\t\t\t\tAND hs.facility_id = ?2 \n" +
            "\t\t\t\t)\n" +
            "             AND NOT EXISTS (\n" +
            "\t\t\t\t SELECT 1\n" +
            "\t\t\t\t FROM hts_encounter htse\n" +
            "\t\t\t\t WHERE CAST(htse.patient_uuid AS TEXT) = p.uuid\n" +
            "\t\t\t\t AND htse.facility_id = ?2\n" +
            "\t\t\t\t AND htse.archived = false\n" +
            "            )\n" +
            "             AND is_pmtct_infant(p.hospital_number) = FALSE\n" +
            "\t\t\tORDER BY p.created_date DESC" , nativeQuery = true)
    Page<HtsPerson> findAllPersonHts(Integer archived, Long facilityId, Pageable pageable);
    @Query(value = "SELECT DISTINCT  hc.id, hc.client_code AS clientCode, p.id as personId,p.uuid as personUuid, p.first_name as firstName, p.surname as surname, p.other_name as otherName,  \n" +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,  \n" +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth,mini.person_uuid,mini.hts_count htsCount\n" +
            "FROM patient_person p\n" +
            "INNER JOIN hts_client hc ON hc.person_uuid = p.uuid AND hc.archived = ?1 \n" +
            "INNER JOIN (SELECT person_uuid,MIN(date_created) first_hts_registration,COUNT(person_uuid) hts_count\n" +
            "FROM hts_client\n" +
            "WHERE person_uuid IS NOT NULL AND archived = ?1 AND facility_id=?2 \n" +
            "GROUP BY 1) mini\n" +
            "ON hc.person_uuid=mini.person_uuid AND hc.date_created=mini.first_hts_registration  ORDER BY hc.id DESC", nativeQuery = true)
    Page<HtsPerson> findOnlyPersonHts(Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "WITH hts_patients AS ( \n" +
            "    SELECT DISTINCT \n" +
            "        hc.id AS htsClientId, \n" +
            "        p.id AS personId, \n" +
            "        p.uuid AS personUuid, \n" +
            "        p.first_name AS firstName, \n" +
            "        p.surname AS surname, \n" +
            "        p.other_name AS otherName, \n" +
            "        p.hospital_number AS hospitalNumber, \n" +
            "        CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age, \n" +
            "        INITCAP(p.sex) AS gender, \n" +
            "        p.date_of_birth AS dateOfBirth, \n" +
            "        p.date_of_registration AS dateOfRegistration, \n" +
            "        p.last_modified_date AS dateModified, \n" +
            "        p.contact_point#>>'{contactPoint,0,value}' AS phoneNumber, \n" +
            "        hc.date_created AS htsRegistrationDate, \n" +
            "        CASE WHEN he.person_uuid IS NOT NULL THEN 'Yes' ELSE 'No' END AS inHivEnrollment, \n" +
            "        CASE WHEN hac.person_uuid IS NOT NULL THEN 'Yes' ELSE 'No' END AS hasArtCommencement \n" +
            "    FROM hts_client hc \n" +
            "    INNER JOIN patient_person p ON hc.person_uuid = p.uuid \n" +
            "    LEFT JOIN ( \n" +
            "        SELECT DISTINCT person_uuid \n" +
            "        FROM hiv_enrollment \n" +
            "        WHERE archived = ?1 AND facility_id = ?2 \n" +
            "    ) he ON he.person_uuid = p.uuid \n" +
            "    LEFT JOIN ( \n" +
            "        SELECT DISTINCT person_uuid \n" +
            "        FROM hiv_art_clinical \n" +
            "        WHERE is_commencement = true AND facility_id = ?2 \n" +
            "    ) hac ON hac.person_uuid = p.uuid \n" +
            "    WHERE hc.archived = ?1 \n" +
            "        AND hc.facility_id = ?2\n" +
            "\t\tAND (?3 IS NULL OR ?3 = '*' OR \n" +
            "        p.first_name ILIKE '%' || CAST(?3 AS TEXT) || '%' OR \n" +
            "        p.surname ILIKE '%' || CAST(?3 AS TEXT) || '%') \n" +
            "), \n" +
            "duplicate_groups AS ( \n" +
            "    SELECT \n" +
            "        TRIM(LOWER(firstName)) AS first_name_key, \n" +
            "        TRIM(LOWER(surname)) AS surname_key, \n" +
            "        dateOfBirth, \n" +
            "        COUNT(*) AS duplicateCount, \n" +
            "        COUNT(DISTINCT personUuid) AS uniquePersonUuids, \n" +
            "        STRING_AGG(CAST(htsClientId AS TEXT), ',' ORDER BY htsClientId) AS duplicateHtsIds,\n" +
            "        SUM(CASE WHEN inHivEnrollment = 'Yes' AND hasArtCommencement = 'Yes' THEN 1 ELSE 0 END) AS yesYesCount\n" +
            "    FROM hts_patients \n" +
            "    GROUP BY \n" +
            "        TRIM(LOWER(firstName)), \n" +
            "        TRIM(LOWER(surname)), \n" +
            "        dateOfBirth \n" +
            "    HAVING COUNT(*) > 1 \n" +
            "        AND SUM(CASE WHEN inHivEnrollment = 'Yes' AND hasArtCommencement = 'Yes' THEN 1 ELSE 0 END) > 0  \n" +
            "), \n" +
            "ranked_duplicates AS ( \n" +
            "    SELECT \n" +
            "        hp.*, \n" +
            "        dg.duplicateCount, \n" +
            "        dg.uniquePersonUuids, \n" +
            "        dg.duplicateHtsIds, \n" +
            "        ROW_NUMBER() OVER ( \n" +
            "            PARTITION BY \n" +
            "                TRIM(LOWER(hp.firstName)), \n" +
            "                TRIM(LOWER(hp.surname)), \n" +
            "                hp.dateOfBirth \n" +
            "            ORDER BY \n" +
            "                hp.hasArtCommencement DESC, \n" +
            "                hp.inHivEnrollment DESC, \n" +
            "                COALESCE(hp.dateModified, hp.dateOfRegistration, CAST('1900-01-01' AS DATE)) DESC, \n" +
            "                hp.htsRegistrationDate DESC NULLS LAST \n" +
            "        ) AS rn \n" +
            "    FROM hts_patients hp \n" +
            "    INNER JOIN duplicate_groups dg \n" +
            "        ON TRIM(LOWER(hp.firstName)) = dg.first_name_key \n" +
            "        AND TRIM(LOWER(hp.surname)) = dg.surname_key \n" +
            "        AND hp.dateOfBirth = dg.dateOfBirth \n" +
            ") \n" +
            "SELECT \n" +
            "    htsClientId, \n" +
            "    hospitalNumber, \n" +
            "    personUuid, \n" +
            "    personId, \n" +
            "    firstName, \n" +
            "    surname, \n" +
            "    otherName, \n" +
            "    dateOfBirth, \n" +
            "    dateOfRegistration, \n" +
            "    dateModified, \n" +
            "    age, \n" +
            "    gender, \n" +
            "    phoneNumber, \n" +
            "    htsRegistrationDate, \n" +
            "    inHivEnrollment, \n" +
            "    hasArtCommencement, \n" +
            "    duplicateCount, \n" +
            "    uniquePersonUuids, \n" +
            "    duplicateHtsIds, \n" +
            "    CASE WHEN rn = 1 THEN htsClientId ELSE NULL END AS suggestedMasterHtsId, \n" +
            "    CASE WHEN rn = 1 THEN personUuid ELSE NULL END AS suggestedMasterUuid, \n" +
            "    CASE WHEN rn = 1 THEN TRUE ELSE FALSE END AS isSuggestedMaster, \n" +
            "    CASE WHEN rn > 1 THEN TRUE ELSE FALSE END AS shouldArchive \n" +
            "FROM ranked_duplicates \n" +
            "ORDER BY duplicateCount DESC, uniquePersonUuids DESC, firstName, surname, rn",
            nativeQuery = true)
    List<HtsPersonPatientDuplicate> findOnlyPersonDuplicateHts(Integer archived, Long facilityId, String search);

    @Query(value = "SELECT p.uuid, p.hospital_number,p.id as personId, p.first_name as firstName,\n" +
            "            p.surname as surname, p.other_name as otherName,\n" +
            "            CAST (EXTRACT(YEAR from AGE(NOW(),  p.date_of_birth)) AS INTEGER) as age,INITCAP(p.sex) as gender\n" +
            "            FROM patient_person p\n" +
            "            WHERE p.archived=?1 AND p.facility_id=?2 \n" +

            "            AND NOT EXISTS (\n" +
            "            SELECT person_uuid \n" +
            "            FROM public.hts_client hs \n" +
            "            WHERE hs.person_uuid=p.uuid\n" +
            "            AND hs.archived=?1 AND hs.facility_id =?2 \n" +
            "            )\n", nativeQuery = true)
    List<HtsPerson> findAllPersonHts(Integer archived, Long facilityId);


    List<HtsClient> findAllByClientCode(String code);

    @Query(value = "SELECT uuid FROM hiv_enrollment where person_uuid=?1", nativeQuery = true)
    Optional<String> findInHivEnrollmentByUuid(String uuid);

    @Query(value = "SELECT first_name FROM patient_person where hospital_number=?1", nativeQuery = true)
    Optional<String> findInPatientByHospitalNumber(String hospitalNumber);

    boolean existsByRiskStratificationCode(String  riskStratificationCode);

    boolean existsByClientCode(String clientCode);

    @Query(value = "SELECT lmp FROM pmtct_anc WHERE person_uuid=?1", nativeQuery = true)
    Optional<String> getLmpDate(String personUuid);

    Optional<HtsClient> findByClientCodeAndRiskStratificationCode(String clientCode, String riskStratificationCode);

    Optional<HtsClient> findClientById(Long clientId);
}
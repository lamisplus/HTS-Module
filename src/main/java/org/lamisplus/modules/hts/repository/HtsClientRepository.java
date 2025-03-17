package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.HtsPerson;
import org.lamisplus.modules.hts.domain.entity.HtsClient;
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








    @Query(value =  "SELECT p.hospital_number AS hospitalNumber,  p.id AS personId, p.uuid as personUuid, p.first_name AS firstName, p.surname AS surname,  p.other_name AS otherName, CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age, INITCAP(p.sex) AS gender  " +
            "FROM patient_person p  " +
            "WHERE  p.archived =  ?1 \n" +
            "and ( p.first_name ILIKE ?3 \n" +
            "OR p.surname ILIKE ?3 OR p.other_name ILIKE ?3 \n" +
            "OR p.hospital_number ILIKE ?3 )\n" +
            "AND NOT EXISTS (\n" +
            "SELECT 1 \n" +
            "FROM hts_client hs\n" +
            "WHERE hs.client_code = p.hospital_number\n" +
            "AND hs.archived = ?1 \n" +
            "AND hs.person_uuid is not null AND hs.person_uuid != ''\n" +
            "AND hs.facility_id =  ?2 \n" +
            ")AND NOT EXISTS(\n" +
            "            SELECT 1\n" +
            "            FROM hts_client hs \n" +
            "            WHERE  hs.person_uuid = p.uuid \n" +
            "            AND hs.archived = ?1 \n" +
            "            AND hs.person_uuid is not null AND hs.person_uuid != '' \n" +
            "            AND hs.facility_id =  ?2 \n" +
            "            )\n", nativeQuery = true)

    Page<HtsPerson> findAllPersonHtsBySearchParam(Integer archived, Long facilityId, String search, Pageable pageable);

//

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



    @Query(value = "SELECT p.hospital_number AS hospitalNumber, p.uuid as personUuid, p.id AS personId,  p.first_name AS firstName, p.surname AS surname,  p.other_name AS otherName, CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age, INITCAP(p.sex) AS gender  " +
            "FROM patient_person p  " +
            "WHERE  p.archived =  ?1 \n" +
            "AND NOT EXISTS (\n" +
            "SELECT 1 \n" +
            "FROM hts_client hs\n" +
            "WHERE hs.client_code = p.hospital_number\n" +
            "AND hs.archived = ?1 \n" +
            "AND hs.person_uuid is not null AND hs.person_uuid != ''\n" +
            "AND hs.facility_id =  ?2 \n" +
            ")" +
            " AND NOT EXISTS( \n" +
            "            SELECT 1 \n" +
            "            FROM hts_client hs \n" +
            "            WHERE  hs.person_uuid = p.uuid \n" +
            "            AND hs.archived = ?1 \n" +
            "            AND hs.person_uuid is not null AND hs.person_uuid != ''\n" +
            "            AND hs.facility_id =  ?2  \n" +
            "            ) " , nativeQuery = true)

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
}
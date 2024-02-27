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
    List<HtsClient> findAllByPersonOrderByIdDesc(Person person);
    Page<HtsClient> findAll(Pageable pageable);
    Optional<HtsClient> findByUuid(String uuid);
    @Query(value = "SELECT max(id) FROM hts_client", nativeQuery = true)
    Optional<Long> maxId();

    Optional<HtsClient> findByIdAndArchived(Long id, int archived);

    Optional<HtsClient> findByIdAndArchivedAndFacilityId(Long htsClientId, int archived, Long facilityId);

    @Query(value = "SELECT * FROM hts_client WHERE person_uuid=?1 AND " +
            "archived=?2 AND facility_id=?3 ORDER BY date_visit DESC LIMIT 1", nativeQuery = true)
    Optional<HtsClient> findLatestHts(String personUuid, int archived, Long facilityId);

    Optional<HtsClient> findTopByPersonUuidAndArchivedAndFacilityId(String personUuid, Integer archived, Long facilityId);

    @Query(value = "SELECT hc.client_code as clientCode, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName, " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age, " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, CAST (COUNT(hc.person_uuid) AS INTEGER) as htsCount " +
            "FROM patient_person p " +
            "LEFT JOIN hts_client hc ON hc.person_uuid = p.uuid AND hc.archived = ?1 " +
            "WHERE p.archived=?1 AND p.facility_id=?2 AND (p.first_name ILIKE ?3 " +
            "OR p.surname ILIKE ?3 OR p.other_name ILIKE ?3 " +
            "OR p.hospital_number ILIKE ?3 OR hc.client_code ILIKE ?3) " +
            "GROUP BY hc.client_code, p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth", nativeQuery = true)
    Page<HtsPerson> findAllPersonHtsBySearchParam(Integer archived, Long facilityId, String search, Pageable pageable);


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


    @Query(value = "SELECT hc.client_code as clientCode, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName, " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age, " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, CAST (COUNT(hc.person_uuid) AS INTEGER) as htsCount FROM patient_person p " +
            "LEFT JOIN hts_client hc ON hc.person_uuid = p.uuid AND hc.archived = ?1 " +
            "WHERE p.archived=?1 AND p.facility_id=?2 " +
            "GROUP BY hc.client_code, p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth", nativeQuery = true)
    Page<HtsPerson> findAllPersonHts(Integer archived, Long facilityId, Pageable pageable);


    @Query(value = "SELECT p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName, " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age, " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, CAST (COUNT(hc.person_uuid) AS INTEGER) as htsCount FROM patient_person p " +
            "LEFT JOIN hts_client hc ON hc.person_uuid = p.uuid AND hc.archived = ?1 " +
            "WHERE p.archived=?1 AND p.facility_id=?2 " +
            "GROUP BY p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth", nativeQuery = true)
    List<HtsPerson> findAllPersonHts(Integer archived, Long facilityId);

    //<T> T findByLastName(String lastName, Class<T> type);

    List<HtsClient> findAllByClientCode(String code);

    @Query(value = "SELECT uuid FROM hiv_enrollment where person_uuid=?1", nativeQuery = true)
    Optional<String> findInHivEnrollmentByUuid(String uuid);

    @Query(value = "SELECT first_name FROM patient_person where hospital_number=?1", nativeQuery = true)
    Optional<String> findInPatientByHospitalNumber(String hospitalNumber);

    boolean existsByRiskStratificationCode(String  riskStratificationCode);
}
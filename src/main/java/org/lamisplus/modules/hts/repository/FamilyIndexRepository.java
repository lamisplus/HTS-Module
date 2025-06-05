package org.lamisplus.modules.hts.repository;

import io.vavr.collection.Traversable;
import org.lamisplus.modules.hts.domain.dto.UuidProjection;
import org.lamisplus.modules.hts.domain.entity.FamilyIndex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FamilyIndexRepository extends JpaRepository<FamilyIndex, Long> {
    Optional<FamilyIndex> findByIdAndArchived(Long id, int unArchived);
    Optional<FamilyIndex> findByUuidAndArchived(String uuid,int archived);

    @Query(value = "SELECT * FROM hts_family_index fi " +
            "JOIN hts_family_index_testing c ON c.uuid = fi.family_index_testing_uuid " +
            "WHERE fi.family_index_testing_uuid = :uuid AND fi.archived = :unArchived", nativeQuery = true)
    List<FamilyIndex> findByFamilyIndexTestingUuid(@Param("uuid") String uuid, @Param("unArchived") int unArchived);


    @Query(value = "SELECT visit_date FROM public.hiv_art_clinical where person_uuid = ?1 and  is_commencement = true and archived = 0", nativeQuery = true)
    String getCurrentHIVByPersonUuid (@Param("personUuid") String personUuid);

    @Query(value = "SELECT uuid AS uuid FROM hts_client WHERE person_uuid = ?1 AND archived = 0", nativeQuery = true)
    UuidProjection getHTSClientUUID(@Param("personUuid") String personUuid);

//    select result_reported from laboratory_result where patient_uuid ='58f1c17b-f79a-4866-a9e7-60c7959c312d' and date_result_reported is not null ORDER BY date_result_received DESC LIMIT 1
    @Query(value = "SELECT result_reported FROM public.laboratory_result where patient_uuid = ?1 and date_result_reported is not null ORDER BY date_result_received DESC LIMIT 1", nativeQuery = true)
    String getVirallySuppressedByPersonUuid (@Param("personUuid") String personUuid);

}

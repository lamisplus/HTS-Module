package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.HtsClient;
import org.lamisplus.modules.hts.domain.entity.IndexElicitation;
import org.lamisplus.modules.hts.domain.entity.PersonalNotificationService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PersonalNotificationServiceRepository extends JpaRepository<PersonalNotificationService, Long> {

    Optional<PersonalNotificationService> findByIdAndArchivedAndFacilityId(Long id, int archived, Long facilityId);
    Optional<PersonalNotificationService> findByUuidAndArchived(String Uuid, Integer archived);

    List<PersonalNotificationService> findAllByHtsClient(HtsClient htsClient);


    Optional<String> findLastPartnerIdByHtsClientId(@Param("htsClientId") Long htsClientId);
}

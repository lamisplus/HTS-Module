package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.HtsClient;
import org.lamisplus.modules.hts.domain.entity.IndexElicitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface IndexElicitationRepository extends JpaRepository<IndexElicitation, Long>, JpaSpecificationExecutor<IndexElicitation> {
    List<IndexElicitation> findAllByHtsClient(HtsClient htsClient);

    Optional<IndexElicitation> findByIdAndArchived(Long id, int archived);

    Optional<IndexElicitation> findByIdAndArchivedAndFacilityId(Long id, int archived, Long facilityId);
}
package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.dto.RiskStratificationResponseDto;
import org.lamisplus.modules.hts.domain.entity.RiskStratification;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RiskStratificationRepository extends PagingAndSortingRepository<RiskStratification, Long> {
    List<RiskStratification> findAllByPersonUuid(String uuid);

    Optional<RiskStratification> findByCode(String code);

    Optional<RiskStratification> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, int archived);

    Optional<RiskStratification> findByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, int archived);
}
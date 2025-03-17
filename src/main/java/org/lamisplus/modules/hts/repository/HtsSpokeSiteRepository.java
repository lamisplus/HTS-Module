package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.Hivst;
import org.lamisplus.modules.hts.domain.entity.HivstPerson;
import org.lamisplus.modules.hts.domain.entity.HtsSpokeSiteEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface HtsSpokeSiteRepository extends JpaRepository<HtsSpokeSiteEntity, Long> {



    @Query(value = "SELECT * FROM  hts_spoke_sites WHERE hub_site ILIKE  ?1 ", nativeQuery = true)
    List<HtsSpokeSiteEntity> getAllByHubSite(String hubSite);

}

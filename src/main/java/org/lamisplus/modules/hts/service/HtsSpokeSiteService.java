package org.lamisplus.modules.hts.service;


import org.lamisplus.modules.hts.domain.dto.HtsSpokeSiteDTO;
import org.lamisplus.modules.hts.domain.entity.HtsSpokeSiteEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface HtsSpokeSiteService {
   List<HtsSpokeSiteDTO> getSpokeSitesByHubSite(String hubSite);

    HtsSpokeSiteDTO convertSpokeEntityToDTO(HtsSpokeSiteEntity htsSpokeSiteEntity);
}

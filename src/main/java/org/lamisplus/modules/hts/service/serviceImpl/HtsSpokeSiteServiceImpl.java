package org.lamisplus.modules.hts.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.hts.domain.dto.HtsSpokeSiteDTO;
import org.lamisplus.modules.hts.domain.entity.HtsSpokeSiteEntity;
import org.lamisplus.modules.hts.repository.HtsSpokeSiteRepository;
import org.lamisplus.modules.hts.service.HtsSpokeSiteService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HtsSpokeSiteServiceImpl implements HtsSpokeSiteService {

    private final HtsSpokeSiteRepository htsSpokeSiteRepository;


    @Override
    public List<HtsSpokeSiteDTO> getSpokeSitesByHubSite(String hubSite) {
        List<HtsSpokeSiteDTO> spokeList = new ArrayList<>();
        hubSite= hubSite.replaceAll("\\s", "");
        String queryParam = hubSite+"%";
        System.out.println("queryParam" + queryParam);
        List<HtsSpokeSiteEntity>  optSpokeList = htsSpokeSiteRepository.getAllByHubSite(queryParam);
        System.out.println("optSpokeList " + optSpokeList);

        for (HtsSpokeSiteEntity htsSpokeSiteEntity : optSpokeList) {
            spokeList.add(this.convertSpokeEntityToDTO(htsSpokeSiteEntity));
        }
        return spokeList;
    }



    public HtsSpokeSiteDTO convertSpokeEntityToDTO(HtsSpokeSiteEntity htsSpokeSiteEntity) {
        HtsSpokeSiteDTO htsSpokeSiteDTO = new HtsSpokeSiteDTO();
        htsSpokeSiteDTO.setId(htsSpokeSiteEntity.getId());
        htsSpokeSiteDTO.setIm(htsSpokeSiteEntity.getIm());
        htsSpokeSiteDTO.setState(htsSpokeSiteEntity.getState());
        htsSpokeSiteDTO.setLga(htsSpokeSiteEntity.getLga());
        htsSpokeSiteDTO.setHubSite(htsSpokeSiteEntity.getHubSite());
        htsSpokeSiteDTO.setSpokeSite(htsSpokeSiteEntity.getSpokeSite());
        return htsSpokeSiteDTO;

    }
}



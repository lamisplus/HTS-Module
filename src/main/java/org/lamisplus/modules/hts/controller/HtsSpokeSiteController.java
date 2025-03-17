package org.lamisplus.modules.hts.controller;


import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.hts.domain.dto.HtsSpokeSiteDTO;
import org.lamisplus.modules.hts.service.HtsSpokeSiteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hts/spoke-site")
@RequiredArgsConstructor
public class HtsSpokeSiteController {

    private final HtsSpokeSiteService htsSpokeSiteService;

    @GetMapping
    public ResponseEntity<List<HtsSpokeSiteDTO>> getSpokeSiteByHubSite(@RequestParam("hubSite") String hubSite) {
       htsSpokeSiteService.getSpokeSitesByHubSite(hubSite);

        return new ResponseEntity<>(htsSpokeSiteService.getSpokeSitesByHubSite(hubSite), HttpStatus.OK);
    }

}

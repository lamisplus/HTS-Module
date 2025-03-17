package org.lamisplus.modules.hts.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;


@Data
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class HtsSpokeSiteDTO {
    private Long id;
    private String im;
    private String state;
    private String lga;
    private String hubSite;
    private String spokeSite;
}




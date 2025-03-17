package org.lamisplus.modules.hts.domain.entity;


import lombok.Data;

import javax.persistence.*;

@Entity
@Data
@Table(name = "hts_spoke_sites")
public class HtsSpokeSiteEntity {
    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "im")
    private String im;

    @Column(name = "state")
    private String state;

    @Column(name = "lga")
    private String lga;

    @Column(name = "hub_site")
    private String hubSite;

    @Column(name = "spoke_site")
    private String spokeSite;
}



package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.IctContact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IctContactRepository extends JpaRepository<IctContact, Long> {

    // archived is now Boolean
    List<IctContact> findByIctEncounter_IdAndArchivedOrderById(Long ictEncounterId, Boolean archived);
}
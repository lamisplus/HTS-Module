package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.IctContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IctContactRepository extends JpaRepository<IctContact, Long> {

    List<IctContact> findByIctEncounter_IdAndArchivedOrderById(Long ictEncounterId, int archived);

    /**
     * Hard-delete all contacts for an encounter before re-persisting on update.
     * We use a hard delete here because contacts are fully owned by the encounter
     * and re-created wholesale on every update — there is no separate contact lifecycle.
     */
    @Modifying
    @Query("DELETE FROM IctContact c WHERE c.ictEncounter.id = :encounterId")
    void deleteAllByIctEncounterId(@Param("encounterId") Long encounterId);
}

package org.lamisplus.modules.hts.repository;

import org.lamisplus.modules.hts.domain.entity.HtsFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HtsFeedbackRepository extends JpaRepository<HtsFeedback, Long> {
}

package org.lamisplus.modules.hts.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.hts.domain.dto.HtsFeedbackDto;
import org.lamisplus.modules.hts.domain.entity.HtsFeedback;
import org.lamisplus.modules.hts.repository.HtsFeedbackRepository;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class HtsFeedbackService {
    private final HtsFeedbackRepository htsFeedbackRepository;

    public String save(HtsFeedbackDto htsFeedbackDto) {

        HtsFeedback htsFeedback = mapToHtsFeedback(htsFeedbackDto);
        htsFeedbackRepository.save(htsFeedback);
        return "HTS ML Feedback saved successfully.";
    }

    public static HtsFeedbackDto mapToHtsFeedbackDto(HtsFeedback htsFeedback) {
        return new HtsFeedbackDto(
                htsFeedback.getId(),
                htsFeedback.getFacilityId(),
                htsFeedback.getPatientId(),
                htsFeedback.getPrimaryBasisToTest(),
                htsFeedback.getClientTestedDespiteLowRiskScore(),
                htsFeedback.getReasonForTestingDespiteLowRiskScore(),
                htsFeedback.getClientTestedDespiteHighRiskScore(),
                htsFeedback.getMainReasonForTestingThisClient(),
                htsFeedback.getOptionMainReasonForTestingThisClient(),
                htsFeedback.getMainReasonForNotTestingThisClient(),
                htsFeedback.getOptionMainReasonForNotTestingThisClient(),
                htsFeedback.getRiskScoreContributeToTheClinicalDecision()
        );
    }

    public static HtsFeedback mapToHtsFeedback(HtsFeedbackDto htsFeedbackDto) {
        return new HtsFeedback(
                htsFeedbackDto.getId(),
                htsFeedbackDto.getFacilityId(),
                htsFeedbackDto.getPatientId(),
                htsFeedbackDto.getPrimaryBasisToTest(),
                htsFeedbackDto.getClientTestedDespiteLowRiskScore(),
                htsFeedbackDto.getReasonForTestingDespiteLowRiskScore(),
                htsFeedbackDto.getClientTestedDespiteHighRiskScore(),
                htsFeedbackDto.getMainReasonForTestingThisClient(),
                htsFeedbackDto.getOptionMainReasonForTestingThisClient(),
                htsFeedbackDto.getMainReasonForNotTestingThisClient(),
                htsFeedbackDto.getOptionMainReasonForNotTestingThisClient(),
                htsFeedbackDto.getRiskScoreContributeToTheClinicalDecision()
        );
    }

}


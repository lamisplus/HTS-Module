package org.lamisplus.modules.hts.controller;

import lombok.AllArgsConstructor;
import org.lamisplus.modules.hts.domain.dto.HtsFeedbackDto;
import org.lamisplus.modules.hts.service.HtsFeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("api/v1/feedback")
public class HtsFeedbackController {
    private final HtsFeedbackService htsFeedbackService;
    @PostMapping
    public ResponseEntity<String> createMlFeedback(@RequestBody HtsFeedbackDto htsFeedbackDto){
        return new ResponseEntity<>(htsFeedbackService.save(htsFeedbackDto), HttpStatus.CREATED);
    }
}

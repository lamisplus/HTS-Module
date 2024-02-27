package org.lamisplus.modules.hts.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.hts.domain.dto.RiskStratificationDto;
import org.lamisplus.modules.hts.domain.dto.RiskStratificationResponseDto;
import org.lamisplus.modules.hts.domain.entity.RiskStratification;
import org.lamisplus.modules.hts.repository.RiskStratificationRepository;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class RiskStratificationService {
    private final RiskStratificationRepository stratificationRepository;
    private final PersonRepository personRepository;
    private final CurrentUserOrganizationService currentFacility;

    public RiskStratificationResponseDto save(RiskStratificationDto riskStratificationDTO) {
        String personUuid=null;
        if(riskStratificationDTO.getPersonId() != null){
            personUuid = getPerson(riskStratificationDTO.getPersonId()).getUuid();
        }
        RiskStratification riskStratification = toRiskStratification(riskStratificationDTO, personUuid);
        riskStratification.setFacilityId(currentFacility.getCurrentUserOrganization());
        return this.toRiskStratificationResponseDTO(stratificationRepository.save(riskStratification));
    }

    public RiskStratificationResponseDto getByCode(String code){
        RiskStratification riskStratification = stratificationRepository.findByCode(code).orElse(null);
        if(riskStratification != null){
            return this.toRiskStratificationResponseDTO(riskStratification);
        }
        return null;
    }
    public Person getPerson(Long personId) {
        return personRepository.findById (personId)
                .orElseThrow (() -> new EntityNotFoundException(Person.class, "id", String.valueOf (personId)));
    }
    public RiskStratificationDto update(Long id, RiskStratificationDto stratificationDto){
        RiskStratification stratification = stratificationRepository
                .findByIdAndFacilityIdAndArchived(id, currentFacility.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(()-> new EntityNotFoundException(RiskStratification.class, "id", String.valueOf(id)));
        stratificationDto.setId(id);
        stratification = toRiskStratification(stratificationDto, stratification.getPersonUuid());
        stratification.setFacilityId(currentFacility.getCurrentUserOrganization());
        return toRiskStratificationDTO(stratificationRepository.save(stratification));
    }

    private RiskStratificationDto toRiskStratificationDTO(RiskStratification riskStratification) {
        if ( riskStratification == null ) {
            return null;
        }

        RiskStratificationDto riskStratificationDto = new RiskStratificationDto();

        riskStratificationDto.setAge( riskStratification.getAge() );
        riskStratificationDto.setId(riskStratification.getId());
        riskStratificationDto.setEntryPoint( riskStratification.getEntryPoint() );

        riskStratificationDto.setTestingSetting( riskStratification.getTestingSetting() );
        riskStratificationDto.setModality( riskStratification.getModality() );
        riskStratificationDto.setTargetGroup( riskStratification.getTargetGroup() );
        riskStratificationDto.setVisitDate( riskStratification.getVisitDate() );
        riskStratificationDto.setDob(riskStratification.getDob());
        riskStratificationDto.setRiskAssessment( riskStratification.getRiskAssessment() );
        riskStratificationDto.setCommunityEntryPoint( riskStratification.getCommunityEntryPoint() );
        riskStratificationDto.setCode(riskStratification.getCode());
        /*riskStratificationDto.setPersonId(personRepository
                        .findByUuid(riskStratification.getPersonUuid())
                        .orElse(null).getId());*/

        return riskStratificationDto;
    }
    private RiskStratificationResponseDto toRiskStratificationResponseDTO(RiskStratification riskStratification) {
        if ( riskStratification == null ) {
            return null;
        }

        RiskStratificationResponseDto responseDto = new RiskStratificationResponseDto();
        responseDto.setId(riskStratification.getId());
        responseDto.setEntryPoint( riskStratification.getEntryPoint());
        responseDto.setAge( riskStratification.getAge() );
        responseDto.setTestingSetting( riskStratification.getTestingSetting() );
        responseDto.setModality( riskStratification.getModality() );
        responseDto.setCode( riskStratification.getCode() );
        responseDto.setTargetGroup( riskStratification.getTargetGroup() );
        responseDto.setDob( riskStratification.getDob() );
        responseDto.setVisitDate( riskStratification.getVisitDate() );
        responseDto.setRiskAssessment( riskStratification.getRiskAssessment() );
        responseDto.setCommunityEntryPoint( riskStratification.getCommunityEntryPoint() );

        return responseDto;
    }
    private RiskStratification toRiskStratification(RiskStratificationDto riskStratificationDTO, String personUuid) {
        if ( riskStratificationDTO == null ) {
            return null;
        }

        RiskStratification riskStratification = new RiskStratification();

        riskStratification.setId(riskStratificationDTO.getId());
        riskStratification.setAge( riskStratificationDTO.getAge() );
        riskStratification.setPersonUuid(personUuid);
        riskStratification.setTestingSetting( riskStratificationDTO.getTestingSetting() );
        riskStratification.setModality( riskStratificationDTO.getModality() );
        riskStratification.setCode( riskStratificationDTO.getCode() );
        riskStratification.setTargetGroup( riskStratificationDTO.getTargetGroup() );
        riskStratification.setVisitDate( riskStratificationDTO.getVisitDate() );
        riskStratification.setDob(riskStratificationDTO.getDob());
        riskStratification.setRiskAssessment( riskStratificationDTO.getRiskAssessment() );
        riskStratification.setCommunityEntryPoint( riskStratificationDTO.getCommunityEntryPoint() );

        riskStratification.setEntryPoint( riskStratificationDTO.getEntryPoint());


        return riskStratification;
    }

    public void deleteById(Long id) {
        stratificationRepository.deleteById(id);
    }

    public Page<RiskStratification> findAll(Pageable pageable) {
        Page<RiskStratification> entityPage = stratificationRepository.findAll(pageable);
        List<RiskStratification> entities = entityPage.getContent();
        return new PageImpl<>(entities, pageable, entityPage.getTotalElements());
    }

    public List<RiskStratificationResponseDto> getAllByPersonId(Long personId) {
        Person person = personRepository.findById (personId).orElse(null);
        if(person == null){
            return new ArrayList<>();
        }
        return stratificationRepository.findAllByPersonUuid(person.getUuid())
                .stream()
                .map(riskStratification -> toRiskStratificationResponseDTO(riskStratification))
                .collect(Collectors.toList());
    }

    public RiskStratificationResponseDto getStratificationByPersonId(Long personId) {
        RiskStratification stratification = stratificationRepository
                .findByPersonUuidAndFacilityIdAndArchived(getPerson(personId).getUuid(), currentFacility.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(()-> new EntityNotFoundException(RiskStratification.class, "personId", String.valueOf(personId)));

        return toRiskStratificationResponseDTO(stratification);
    }
}
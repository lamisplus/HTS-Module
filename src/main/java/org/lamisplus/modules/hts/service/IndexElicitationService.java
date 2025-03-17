package org.lamisplus.modules.hts.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.hts.domain.dto.IndexElicitationDto;
import org.lamisplus.modules.hts.domain.dto.IndexElicitationResponseDto;
import org.lamisplus.modules.hts.domain.entity.HtsClient;
import org.lamisplus.modules.hts.domain.entity.IndexElicitation;
import org.lamisplus.modules.hts.domain.enums.Source;
import org.lamisplus.modules.hts.repository.HtsClientRepository;
import org.lamisplus.modules.hts.repository.IndexElicitationRepository;
import org.lamisplus.modules.hts.util.Constants;
import org.lamisplus.modules.patient.service.PersonService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class IndexElicitationService {
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final IndexElicitationRepository indexElicitationRepository;
    private final HtsClientRepository htsClientRepository;
    private final PersonService personService;



    public List<IndexElicitationResponseDto> getAllByHtsClientId(Long htsClientId){
        HtsClient htsClient = htsClientRepository
                .findByIdAndArchivedAndFacilityId(htsClientId, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(()-> new EntityNotFoundException(HtsClient.class, "htsClientId", "" + htsClientId));

        return this.convertToIndexElicitationResponseDtos(indexElicitationRepository
                .findAllByHtsClient(htsClient));
    }

    public IndexElicitationResponseDto save(IndexElicitationDto indexElicitationDto){

        if(indexElicitationDto.getSource().equalsIgnoreCase(Source.Mobile.toString())) {
            Optional<IndexElicitation> indexElicitationExists = indexElicitationRepository.findByUuid(indexElicitationDto.getUuid());
            if (indexElicitationExists.isPresent()) {
                LOG.info("Index Elicitation with ID {} has already been synced", indexElicitationDto.getUuid());
                return convertToIndexElicitationResponseDto(indexElicitationExists.get().getHtsClient(), indexElicitationExists.get());
            }
        }

        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        HtsClient htsClient = htsClientRepository.findByIdAndArchivedAndFacilityId(indexElicitationDto.getHtsClientId(), UN_ARCHIVED, facilityId)
                .orElseThrow(()-> new EntityNotFoundException(HtsClient.class, "htsClientId", "" + indexElicitationDto.getHtsClientId()));

        HashMap<String, String> ins = new HashMap<>();
        ins.put("AcceptedIns", indexElicitationDto.getAcceptedIns());
        ins.put("OfferedIns", indexElicitationDto.getOfferedIns());

        htsClient.setIndexNotificationServicesElicitation(ins);
        htsClientRepository.save(htsClient);
        IndexElicitation indexElicitation = this.convertToIndexElicitation(indexElicitationDto);
        indexElicitation.setFacilityId(facilityId);
        indexElicitation.setHtsClientUuid(htsClient.getUuid());
        indexElicitation = indexElicitationRepository.save(indexElicitation);


        return this.convertToIndexElicitationResponseDto(htsClient, indexElicitation);
    }

    public IndexElicitationResponseDto getIndexElicitationById(Long id) {
        return this.convertToIndexElicitationResponseDto(null, this.getById(id));
    }

    public IndexElicitationResponseDto update(Long id, IndexElicitationResponseDto indexElicitationResponseDto) {
        IndexElicitation indexElicitation = this.getById(id);
        if(indexElicitationResponseDto.getId().equals(indexElicitation.getId())) {
            throw new IllegalTypeException(IndexElicitation.class, "id", "does not match");
        }
        indexElicitation = this.convertToIndexElicitation(indexElicitationResponseDto, indexElicitation.getHtsClient());
        return this.convertToIndexElicitationResponseDto(null, indexElicitationRepository.save(indexElicitation));
    }

    public void delete(Long id) {
        IndexElicitation indexElicitation = this.getById(id);
        indexElicitation.setArchived(ARCHIVED);
        indexElicitationRepository.save(indexElicitation);
    }

    private List<IndexElicitationResponseDto> convertToIndexElicitationResponseDtos(List<IndexElicitation> indexElicitation) {
        if ( indexElicitation == null ) {
            return null;
        }

        List<IndexElicitationResponseDto> list = new ArrayList<>(indexElicitation.size());
        for ( IndexElicitation indexElicitation1 : indexElicitation) {
            if(indexElicitation1.getHtsClient() == null) throw new EntityNotFoundException(HtsClient.class, "HtsClient", "cannot be null");
            list.add( convertToIndexElicitationResponseDto(null, indexElicitation1) );
        }
        return list;
    }

    private IndexElicitation convertToIndexElicitation(IndexElicitationDto indexElicitationDto) {
        if ( indexElicitationDto == null ) {
            return null;
        }

        IndexElicitation indexElicitation = new IndexElicitation();

        try {
            indexElicitation.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
            indexElicitation.setDob(indexElicitationDto.getDob());
            indexElicitation.setIsDateOfBirthEstimated(indexElicitationDto.getIsDateOfBirthEstimated());
            indexElicitation.setSex(indexElicitationDto.getSex());
            indexElicitation.setAddress(indexElicitationDto.getAddress());
            indexElicitation.setLastName(indexElicitationDto.getLastName());
            indexElicitation.setFirstName(indexElicitationDto.getFirstName());
            indexElicitation.setMiddleName(indexElicitationDto.getMiddleName());
            indexElicitation.setPhoneNumber(indexElicitationDto.getPhoneNumber());
            indexElicitation.setAltPhoneNumber(indexElicitationDto.getAltPhoneNumber());
            indexElicitation.setHangOutSpots(indexElicitationDto.getHangOutSpots());
            indexElicitation.setPhysicalHurt(indexElicitationDto.getPhysicalHurt());
            indexElicitation.setThreatenToHurt(indexElicitationDto.getThreatenToHurt());
            indexElicitation.setNotificationMethod(indexElicitationDto.getNotificationMethod());
            indexElicitation.setPartnerTestedPositive(indexElicitationDto.getPartnerTestedPositive());
            indexElicitation.setRelationshipToIndexClient(indexElicitationDto.getRelationshipToIndexClient());
            indexElicitation.setSexuallyUncomfortable(indexElicitationDto.getSexuallyUncomfortable());
            indexElicitation.setCurrentlyLiveWithPartner(indexElicitationDto.getCurrentlyLiveWithPartner());
            indexElicitation.setDatePartnerCameForTesting(indexElicitationDto.getDatePartnerCameForTesting());
            indexElicitation.setLatitude(indexElicitationDto.getLatitude());
            indexElicitation.setLongitude(indexElicitationDto.getLongitude());
            String sourceSupport = indexElicitationDto.getSource() == null || indexElicitationDto.getSource().isEmpty() ? Constants.WEB_SOURCE : Constants.MOBILE_SOURCE;
            indexElicitation.setSource(sourceSupport);

            indexElicitation.setOfferedIns(indexElicitationDto.getOfferedIns());
            indexElicitation.setAcceptedIns(indexElicitationDto.getAcceptedIns());
        }catch(Exception e){
            e.printStackTrace();
        }

        return indexElicitation;
    }

    private IndexElicitation convertToIndexElicitation(IndexElicitationResponseDto indexElicitationResponseDto, HtsClient htsClient) {
        if ( indexElicitationResponseDto == null ) {
            return null;
        }

        IndexElicitation indexElicitation = new IndexElicitation();

        indexElicitation.setHtsClient(htsClient);
        indexElicitation.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        indexElicitation.setId(indexElicitation.getId());
        indexElicitation.setDob( indexElicitationResponseDto.getDob() );
        indexElicitation.setIsDateOfBirthEstimated( indexElicitationResponseDto.getIsDateOfBirthEstimated() );
        indexElicitation.setSex( indexElicitationResponseDto.getSex() );
        indexElicitation.setAddress( indexElicitationResponseDto.getAddress() );
        indexElicitation.setLastName( indexElicitationResponseDto.getLastName() );
        indexElicitation.setFirstName( indexElicitationResponseDto.getFirstName() );
        indexElicitation.setMiddleName( indexElicitationResponseDto.getMiddleName() );
        indexElicitation.setPhoneNumber( indexElicitationResponseDto.getPhoneNumber() );
        indexElicitation.setAltPhoneNumber( indexElicitationResponseDto.getAltPhoneNumber() );
        indexElicitation.setHangOutSpots( indexElicitationResponseDto.getHangOutSpots() );
        indexElicitation.setPhysicalHurt( indexElicitationResponseDto.getPhysicalHurt() );
        indexElicitation.setThreatenToHurt( indexElicitationResponseDto.getThreatenToHurt() );
        indexElicitation.setNotificationMethod( indexElicitationResponseDto.getNotificationMethod() );
        indexElicitation.setPartnerTestedPositive( indexElicitationResponseDto.getPartnerTestedPositive() );
        indexElicitation.setRelationshipToIndexClient( indexElicitationResponseDto.getRelationshipToIndexClient() );
        indexElicitation.setSexuallyUncomfortable( indexElicitationResponseDto.getSexuallyUncomfortable() );
        indexElicitation.setCurrentlyLiveWithPartner( indexElicitationResponseDto.getCurrentlyLiveWithPartner() );
        indexElicitation.setDatePartnerCameForTesting( indexElicitationResponseDto.getDatePartnerCameForTesting() );

        indexElicitation.setOfferedIns(indexElicitationResponseDto.getOfferedIns() );
        indexElicitation.setAcceptedIns( indexElicitationResponseDto.getAcceptedIns() );

        return indexElicitation;
    }

    private IndexElicitationResponseDto convertToIndexElicitationResponseDto(HtsClient client, IndexElicitation indexElicitation) {
        if ( indexElicitation == null ) {
            return null;
        }

        IndexElicitationResponseDto indexElicitationResponseDto = new IndexElicitationResponseDto();
        HtsClient htsClient = indexElicitation.getHtsClient();
        if(client != null){
            indexElicitationResponseDto.setHtsClientId(client.getId());
            indexElicitationResponseDto.setPersonResponseDto(personService.getDtoFromPerson(client.getPerson()));

        }
        indexElicitationResponseDto.setId(indexElicitation.getId());
        indexElicitationResponseDto.setDob( indexElicitation.getDob() );
        indexElicitationResponseDto.setIsDateOfBirthEstimated( indexElicitation.getIsDateOfBirthEstimated() );
        indexElicitationResponseDto.setSex( indexElicitation.getSex() );
        indexElicitationResponseDto.setAddress( indexElicitation.getAddress() );
        indexElicitationResponseDto.setLastName( indexElicitation.getLastName() );
        indexElicitationResponseDto.setFirstName( indexElicitation.getFirstName() );
        indexElicitationResponseDto.setMiddleName( indexElicitation.getMiddleName() );
        indexElicitationResponseDto.setPhoneNumber( indexElicitation.getPhoneNumber() );
        indexElicitationResponseDto.setAltPhoneNumber( indexElicitation.getAltPhoneNumber() );
        indexElicitationResponseDto.setHangOutSpots( indexElicitation.getHangOutSpots() );
        indexElicitationResponseDto.setPhysicalHurt( indexElicitation.getPhysicalHurt() );
        indexElicitationResponseDto.setThreatenToHurt( indexElicitation.getThreatenToHurt() );
        indexElicitationResponseDto.setNotificationMethod( indexElicitation.getNotificationMethod() );
        indexElicitationResponseDto.setPartnerTestedPositive( indexElicitation.getPartnerTestedPositive() );
        indexElicitationResponseDto.setRelationshipToIndexClient( indexElicitation.getRelationshipToIndexClient() );
        indexElicitationResponseDto.setSexuallyUncomfortable( indexElicitation.getSexuallyUncomfortable() );
        indexElicitationResponseDto.setCurrentlyLiveWithPartner( indexElicitation.getCurrentlyLiveWithPartner() );
        indexElicitationResponseDto.setDatePartnerCameForTesting( indexElicitation.getDatePartnerCameForTesting() );
        indexElicitationResponseDto.setLatitude(indexElicitation.getLatitude());
        indexElicitationResponseDto.setLongitude(indexElicitation.getLongitude());

        indexElicitationResponseDto.setOfferedIns(indexElicitation.getOfferedIns() );
        indexElicitationResponseDto.setAcceptedIns( indexElicitation.getAcceptedIns() );

        return indexElicitationResponseDto;
    }

    private IndexElicitation getById(Long id){
        return indexElicitationRepository
                .findByIdAndArchivedAndFacilityId(id, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(()-> new EntityNotFoundException(IndexElicitation.class, "id", ""+id));
    }

}

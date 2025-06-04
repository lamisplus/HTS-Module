package org.lamisplus.modules.hts.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.hts.domain.dto.HtsClientReferralRequestDTO;
import org.lamisplus.modules.hts.domain.dto.HtsClientReferralDTO;
import org.lamisplus.modules.hts.domain.dto.ReceivingOrganizationDTO;
import org.lamisplus.modules.hts.domain.entity.HtsClient;
import org.lamisplus.modules.hts.domain.entity.HtsClientReferral;
import org.lamisplus.modules.hts.repository.HtsClientReferralRepository;
import org.lamisplus.modules.hts.repository.HtsClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@RequiredArgsConstructor
public class ClientReferralService {

    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final HtsClientReferralRepository htsClientReferralRepository;
    private final HtsClientRepository htsClientRepository;
    private final  String clientID = "htsClientId"; 

    @Transactional
    public HtsClientReferralDTO registerClientReferralForm(@NonNull HtsClientReferralRequestDTO requestDTO) {
        if (requestDTO.getHtsClientId() == null) {
            throw new IllegalArgumentException("Client id cannot be null");
        }
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        HtsClient htsClient = htsClientRepository
                .findByIdAndArchivedAndFacilityId(requestDTO.getHtsClientId(), UN_ARCHIVED, facilityId)
                .orElseThrow(() -> new EntityNotFoundException(HtsClient.class, clientID, "" + requestDTO.getHtsClientId()));
        // create a new referral for the client
        HtsClientReferral htsClientReferral = convertToHtsClientReferral(requestDTO, htsClient);
        HtsClientReferral savedReferral = htsClientReferralRepository.save(htsClientReferral);
        return convertToHtsClientReferralToDTO(savedReferral);
    }

    private HtsClientReferralDTO convertToHtsClientReferralToDTO(HtsClientReferral htsClientReferral) {
        HtsClientReferralDTO responseDTO = HtsClientReferralDTO.builder()
                .id(htsClientReferral.getId())
                .dateVisit(htsClientReferral.getDateVisit())
                .uuid(htsClientReferral.getUuid())
                .htsClientId(htsClientReferral.getHtsClientId())
                .htsClientUuid(htsClientReferral.getHtsClient().getUuid())
                .referredFromFacility(htsClientReferral.getReferredFromFacility())
                .nameOfPersonReferringClient(htsClientReferral.getNameOfPersonReferringClient())
                .nameOfReferringFacility(htsClientReferral.getNameOfReferringFacility())
                .addressOfReferringFacility(htsClientReferral.getAddressOfReferringFacility())
                .phoneNoOfReferringFacility(htsClientReferral.getPhoneNoOfReferringFacility())
                .referredTo(htsClientReferral.getReferredTo())
                .nameOfContactPerson(htsClientReferral.getNameOfContactPerson())
                .nameOfReceivingFacility(htsClientReferral.getNameOfReceivingFacility())
                .addressOfReceivingFacility(htsClientReferral.getAddressOfReceivingFacility())
                .phoneNoOfReceivingFacility(htsClientReferral.getPhoneNoOfReceivingFacility())
                .serviceNeeded(htsClientReferral.getServiceNeeded())
                .comments(htsClientReferral.getComments())
                .receivingOrganization(htsClientReferral.getReceivingOrganization())
                .receivingFacilityStateName(htsClientReferral.getReceivingFacilityStateName())
                .receivingFacilityLgaName(htsClientReferral.getReceivingFacilityLgaName())
                .build();

        return responseDTO;
    }

    private HtsClientReferral convertToHtsClientReferral(HtsClientReferralRequestDTO requestDTO, HtsClient htsClient) {
        HtsClientReferral htsClientReferral = new HtsClientReferral();
        htsClientReferral.setDateVisit(requestDTO.getDateVisit());
        htsClientReferral.setHtsClientUuid(htsClient.getUuid());
        htsClientReferral.setReferredFromFacility(requestDTO.getReferredFromFacility());
        htsClientReferral.setNameOfPersonReferringClient(requestDTO.getNameOfPersonReferringClient());
        htsClientReferral.setNameOfReferringFacility(requestDTO.getNameOfReferringFacility());
        htsClientReferral.setAddressOfReferringFacility(requestDTO.getAddressOfReferringFacility());
        htsClientReferral.setPhoneNoOfReferringFacility(requestDTO.getPhoneNoOfReferringFacility());
        htsClientReferral.setReferredTo(requestDTO.getReferredTo());
        htsClientReferral.setNameOfContactPerson(requestDTO.getNameOfContactPerson());
        htsClientReferral.setNameOfReceivingFacility(requestDTO.getNameOfReceivingFacility());
        htsClientReferral.setAddressOfReceivingFacility(requestDTO.getAddressOfReceivingFacility());
        htsClientReferral.setPhoneNoOfReceivingFacility(requestDTO.getPhoneNoOfReceivingFacility());
        htsClientReferral.setServiceNeeded(requestDTO.getServiceNeeded());
        htsClientReferral.setComments(requestDTO.getComments());
        htsClientReferral.setHtsClientId(requestDTO.getHtsClientId());
        htsClientReferral.setReceivingFacilityStateName(requestDTO.getReceivingFacilityStateName());
        htsClientReferral.setReceivingFacilityLgaName(requestDTO.getReceivingFacilityLgaName());
        htsClientReferral.setHtsClient(htsClient);
        return htsClientReferral;
    }

    public HtsClientReferralDTO updateClientReferralWithServiceOrganizationProvider(Long referralId, ReceivingOrganizationDTO receivingOrganizationDTO) {
        // get htsClientReferral using id
        HtsClientReferral existingHtsClientReferral = htsClientReferralRepository.findById(referralId).orElseThrow(() ->
                new EntityNotFoundException(HtsClientReferral.class, clientID, "" + referralId));
        System.out.println("Existing htsClientReferral: " + existingHtsClientReferral);
        if (existingHtsClientReferral.getId().equals(receivingOrganizationDTO.getHtsClientReferralId())) {
            existingHtsClientReferral.setReceivingOrganization(receivingOrganizationDTO.getReceivingOrganizationDTO());
            htsClientReferralRepository.save(existingHtsClientReferral);
        } else {
            throw new IllegalArgumentException("Mix matched id");
        }
        return convertToHtsClientReferralToDTO(existingHtsClientReferral);
    }

    public HtsClientReferral findHtsClientReferralById(Long referralId) {
        return htsClientReferralRepository.findById(referralId).orElseThrow(() ->
                new EntityNotFoundException(HtsClientReferral.class, clientID, "" + referralId));
    }
    public HtsClientReferralDTO getHtsClientReferralById(Long referralId) {
        HtsClientReferral existingHtsClientReferral = htsClientReferralRepository.findById(referralId).orElseThrow(() ->
                new EntityNotFoundException(HtsClientReferral.class, clientID, "" + referralId));
        return convertToHtsClientReferralToDTO(existingHtsClientReferral);
    }

    public String deleteHtsClientReferral(Long referralId) {
        HtsClientReferral existingHtsClientReferral = findHtsClientReferralById(referralId);
        existingHtsClientReferral.setArchived(1);
        htsClientReferralRepository.save(existingHtsClientReferral);
        return "HtsClientReferral with the id " + referralId  + " deleted successfully";
    }

    public HtsClientReferralDTO updateHtsClientReferral(Long referralId, HtsClientReferralRequestDTO requestDTO) {
        HtsClientReferral existingHtsClientReferral = findHtsClientReferralById(referralId);
        HtsClient htsClient = htsClientRepository.findById(requestDTO.getHtsClientId()).orElseThrow(() ->
                new EntityNotFoundException(HtsClient.class, clientID, "" + requestDTO.getHtsClientId()));
         // check if existing htsClientReferral htsClientId matches the requestDTO htsClientId
        if (!existingHtsClientReferral.getHtsClientId().equals(requestDTO.getHtsClientId())) {
             throw new IllegalArgumentException("Existing htsClientReferral htsClientId: " +
                    existingHtsClientReferral.getHtsClient().getId() +
                    " does not match the requestDTO htsClientId: " +
                    htsClient.getId());
        }
        existingHtsClientReferral.setDateVisit(requestDTO.getDateVisit());
        existingHtsClientReferral.setReferredFromFacility(requestDTO.getReferredFromFacility());
        existingHtsClientReferral.setNameOfPersonReferringClient(requestDTO.getNameOfPersonReferringClient());
        existingHtsClientReferral.setNameOfReferringFacility(requestDTO.getNameOfReferringFacility());
        existingHtsClientReferral.setAddressOfReferringFacility(requestDTO.getAddressOfReferringFacility());
        existingHtsClientReferral.setPhoneNoOfReferringFacility(requestDTO.getPhoneNoOfReferringFacility());
        existingHtsClientReferral.setReferredTo(requestDTO.getReferredTo());
        existingHtsClientReferral.setNameOfContactPerson(requestDTO.getNameOfContactPerson());
        existingHtsClientReferral.setNameOfReceivingFacility(requestDTO.getNameOfReceivingFacility());
        existingHtsClientReferral.setAddressOfReceivingFacility(requestDTO.getAddressOfReceivingFacility());
        existingHtsClientReferral.setPhoneNoOfReceivingFacility(requestDTO.getPhoneNoOfReceivingFacility());
        existingHtsClientReferral.setServiceNeeded(requestDTO.getServiceNeeded());
        existingHtsClientReferral.setComments(requestDTO.getComments());
        existingHtsClientReferral.setReceivingFacilityStateName(requestDTO.getReceivingFacilityStateName());
        existingHtsClientReferral.setReceivingFacilityLgaName(requestDTO.getReceivingFacilityLgaName());
        existingHtsClientReferral.setHtsClient(htsClient);
        htsClientReferralRepository.save(existingHtsClientReferral);
        return convertToHtsClientReferralToDTO(existingHtsClientReferral);
    }




    public List<HtsClientReferralDTO> getAllHtsClientReferral(Long htsClientId) {
        HtsClient htsClient = htsClientRepository.findById(htsClientId).orElseThrow(() ->
                new EntityNotFoundException(HtsClient.class, clientID, "" + htsClientId));
        List<HtsClientReferral> htsClientReferrals = htsClientReferralRepository.findHtsClientReferralByHtsClientId(htsClientId, UN_ARCHIVED);
        if(htsClientReferrals == null || htsClientReferrals.isEmpty()){
            return Collections.emptyList();
        }
        return htsClientReferrals.stream().map(this::convertToHtsClientReferralToDTO).collect(Collectors.toList());
    }



}
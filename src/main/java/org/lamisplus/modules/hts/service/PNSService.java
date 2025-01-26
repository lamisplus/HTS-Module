package org.lamisplus.modules.hts.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.hts.domain.dto.PersonalNotificationServiceRequestDTO;
import org.lamisplus.modules.hts.domain.dto.PersonalNotificationServiceResponseDTO;
import org.lamisplus.modules.hts.domain.entity.FamilyIndex;
import org.lamisplus.modules.hts.domain.entity.HtsClient;
import org.lamisplus.modules.hts.domain.entity.PersonalNotificationService;
import org.lamisplus.modules.hts.repository.HtsClientRepository;
import org.lamisplus.modules.hts.repository.PersonalNotificationServiceRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PNSService {

    private final HtsClientRepository htsClientRepository;
    private final PersonalNotificationServiceRepository personalNotificationServiceRepository;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final PersonService personService;
    private final  String clientID = "htsClientId"; 
    public PersonalNotificationServiceResponseDTO save(PersonalNotificationServiceRequestDTO req) {
        if(req == null) {
            throw new IllegalArgumentException("PersonalNotification request cannot be null");
        }
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        HtsClient htsClient = htsClientRepository
                .findByIdAndArchivedAndFacilityId(req.getHtsClientId(), UN_ARCHIVED, facilityId)
                .orElseThrow(() -> new EntityNotFoundException(HtsClient.class, clientID, "" + req.getHtsClientId()));
        htsClient.setOfferedPns(req.getOfferedPns());
        htsClient.setAcceptedPns(req.getAcceptedPns());
        htsClientRepository.save(htsClient);
        PersonalNotificationService res = this.convertPnsRequestToEntity(req);
        // generate new partner id by concatenating the hts client id and the serial number of the pns
        res.setHtsClientUuid(htsClient.getUuid());
        res.setFacilityId(facilityId);
        PersonalNotificationService personalNotificationService = personalNotificationServiceRepository.save(res);
        return convertPnsToResponseDto(htsClient, personalNotificationService);
    }


    public String generatePartnerId(Long htsClientId, String clientCode) {
//        get hts client get the client code and the hts client id check if theri are correct
        if (htsClientId == null || clientCode == null || clientCode.isEmpty()) {
            throw new IllegalArgumentException("Invalid HTS client ID or client code");
        }

        HtsClient htsClient = htsClientRepository
                .findByIdAndArchivedAndFacilityId(htsClientId, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(() -> new EntityNotFoundException(HtsClient.class, clientID, "" + htsClientId));
        // Check if the retrieved HTS client matches the provided ID and client code
        if (!htsClient.getId().equals(htsClientId) || !htsClient.getClientCode().equals(clientCode)) {
            throw new IllegalArgumentException("HTS client ID or client code does not match the provided values");
        }
        // Get the list of PNS for the HTS client
        List<PersonalNotificationServiceResponseDTO> pnsList = getAllPnsIndexClientByHtsClient(htsClientId);
        // If the list is empty, the partner ID should be the first for the HTS client
        if (pnsList.isEmpty()) {
            return clientCode + "/001";
        } else {
            // Get the last partner ID from the list
            String lastPartnerId = pnsList.get(pnsList.size() - 1).getPartnerId();
                // Extract the serial number from the last partner ID and increment it
                int serialNumber = Integer.parseInt(lastPartnerId.substring(lastPartnerId.lastIndexOf("/") + 1)) + 1;
                // Create a new partner ID for the new PNS partner
                return clientCode + "/" + String.format("%03d", serialNumber);
        }
    }


    public PersonalNotificationServiceResponseDTO update(Long id, PersonalNotificationServiceResponseDTO res) {
        PersonalNotificationService personalNotificationService = getPnsById(id);
        if(!personalNotificationService.getId().equals(res.getId())){
            throw new IllegalArgumentException("PersonalNotificationService id does not match");
        }
       PersonalNotificationService pns = this.convertPnsResponseDtoToEntity(res, personalNotificationService.getHtsClient());
       return convertPnsToResponseDto(null, personalNotificationServiceRepository.save(pns));
    }

    public String deletePnsIndexClientPartnerById(Long id) {
        PersonalNotificationService personalNotificationService = getPnsById(id);
        personalNotificationService.setArchived(1);
        personalNotificationServiceRepository.save(personalNotificationService);
        return "Personal Notification Service deleted successfully";
    }

    public List<PersonalNotificationServiceResponseDTO> getAllPnsIndexClientByHtsClient(Long htsClientId) {
        HtsClient htsClient = htsClientRepository.findById(htsClientId).orElseThrow(() -> new EntityNotFoundException(HtsClient.class, clientID, "" + htsClientId));
        List<PersonalNotificationService> indesClientList = personalNotificationServiceRepository.findAllByHtsClient(htsClient);
        if(indesClientList.isEmpty()) {
               return new ArrayList<>();
        }
        return convertPnsEntityListToResponseDtoList(indesClientList);
    }

    private PersonalNotificationServiceResponseDTO convertPnsToResponseDto(HtsClient client, PersonalNotificationService pns) {
        if (pns == null) {
            return null;
        }
        PersonalNotificationServiceResponseDTO pnsDTO = new PersonalNotificationServiceResponseDTO();
        HtsClient htsClient = pns.getHtsClient();
        if (client != null) {
            pnsDTO.setHtsClientId(client.getId());
            pnsDTO.setPersonResponseDto(personService.getDtoFromPerson(client.getPerson()));
        }
        pnsDTO.setIndexClientId(pns.getIndexClientId());
        pnsDTO.setId(pns.getId());
        pnsDTO.setDob(pns.getDob());
        pnsDTO.setUuid(pns.getUuid());
        pnsDTO.setHtsClientUuid(pns.getHtsClientUuid());
        pnsDTO.setAddress(pns.getAddress());
        pnsDTO.setPhoneNumber(pns.getPhoneNumber());
        pnsDTO.setAlternatePhoneNumber(pns.getAlternatePhoneNumber());
        pnsDTO.setFacilityId(pns.getFacilityId());
        pnsDTO.setAcceptedHts(pns.getAcceptedHts());
        pnsDTO.setFirstName(pns.getFirstName());
        pnsDTO.setLastName(pns.getLastName());
        pnsDTO.setMiddleName(pns.getMiddleName());
        pnsDTO.setPhoneNumber(pns.getPhoneNumber());
        pnsDTO.setDatePartnerTested(pns.getDatePartnerTested());
        pnsDTO.setDateEnrollmentOnART(pns.getDateEnrollmentOnART());
        pnsDTO.setKnownHivPositive(pns.getKnownHivPositive());
        pnsDTO.setSex(pns.getSex());
        pnsDTO.setRelationshipToIndexClient(pns.getRelationshipToIndexClient());
        pnsDTO.setHivTestResult(pns.getHivTestResult());
        pnsDTO.setContactTracing(pns.getContactTracing());
        pnsDTO.setNotificationMethod(pns.getNotificationMethod());
        pnsDTO.setIntermediatePartnerViolence(pns.getIntermediatePartnerViolence());
        pnsDTO.setOfferedPns(pns.getOfferedPns());
        pnsDTO.setAcceptedPns(pns.getAcceptedPns());
        pnsDTO.setHtsClientInformation(pns.getHtsClientInformation());
        pnsDTO.setPartnerId(pns.getPartnerId());
        pnsDTO.setReasonForDecline(pns.getReasonForDecline());
        pnsDTO.setOtherReasonForDecline(pns.getOtherReasonForDecline());
        pnsDTO.setIsHtsClient(pns.getIsHtsClient());
        return pnsDTO;
    }

    private PersonalNotificationService convertPnsRequestToEntity(PersonalNotificationServiceRequestDTO req) {
        PersonalNotificationService pns = new PersonalNotificationService();
        pns.setIndexClientId(req.getIndexClientId());
        pns.setAddress(req.getAddress());
        pns.setAcceptedHts(req.getAcceptedHts());
        pns.setFirstName(req.getFirstName());
        pns.setLastName(req.getLastName());
        pns.setMiddleName(req.getMiddleName());
        pns.setPhoneNumber(req.getPhoneNumber());
        pns.setAlternatePhoneNumber(req.getAlternatePhoneNumber());
        pns.setDatePartnerTested(req.getDatePartnerTested());
        pns.setDateEnrollmentOnART(req.getDateEnrollmentOnART());
        pns.setKnownHivPositive(req.getKnownHivPositive());
        pns.setDob(req.getDob());
        pns.setSex(req.getSex());
        pns.setNotificationMethod(req.getNotificationMethod());
        pns.setRelationshipToIndexClient(req.getRelationshipToIndexClient());
        pns.setHivTestResult(req.getHivTestResult());
        pns.setContactTracing(req.getContactTracing());
        pns.setOfferedPns(req.getOfferedPns());
        pns.setAcceptedPns(req.getAcceptedPns());
        pns.setIntermediatePartnerViolence(req.getIntermediatePartnerViolence());
        pns.setHtsClientInformation(req.getHtsClientInformation());
        pns.setPartnerId(req.getPartnerId());
        pns.setReasonForDecline(req.getReasonForDecline());
        pns.setIsHtsClient("No");
        pns.setOtherReasonForDecline(req.getOtherReasonForDecline());

        return pns;
    }

    private PersonalNotificationService convertPnsResponseDtoToEntity(PersonalNotificationServiceResponseDTO res, HtsClient client) {
        if(res == null) {
            return null;
        }
        PersonalNotificationService pns = new PersonalNotificationService();
        pns.setHtsClient(client);
        pns.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        pns.setId(res.getId());
        pns.setUuid(res.getUuid());
        pns.setIndexClientId(res.getIndexClientId());
        pns.setHtsClientUuid(res.getHtsClientUuid());
        pns.setAddress(res.getAddress());
        pns.setAcceptedHts(res.getAcceptedHts());
        pns.setFirstName(res.getFirstName());
        pns.setLastName(res.getLastName());
        pns.setMiddleName(res.getMiddleName());
        pns.setPhoneNumber(res.getPhoneNumber());
        pns.setAlternatePhoneNumber(res.getAlternatePhoneNumber());
        pns.setDatePartnerTested(res.getDatePartnerTested());
        pns.setDateEnrollmentOnART(res.getDateEnrollmentOnART());
        pns.setKnownHivPositive(res.getKnownHivPositive());
        pns.setDob(res.getDob());
        pns.setSex(res.getSex());
        pns.setNotificationMethod(res.getNotificationMethod());
        pns.setRelationshipToIndexClient(res.getRelationshipToIndexClient());
        pns.setHivTestResult(res.getHivTestResult());
        pns.setContactTracing(res.getContactTracing());
        pns.setOfferedPns(res.getOfferedPns());
        pns.setAcceptedPns(res.getAcceptedPns());
        pns.setIntermediatePartnerViolence(res.getIntermediatePartnerViolence());
        pns.setHtsClientInformation(res.getHtsClientInformation());
        pns.setPartnerId(res.getPartnerId());
        pns.setReasonForDecline(res.getReasonForDecline());
        pns.setOtherReasonForDecline(res.getOtherReasonForDecline());

        return pns;
    }
    private List<PersonalNotificationServiceResponseDTO>  convertPnsEntityListToResponseDtoList(List<PersonalNotificationService> pnsList) {
        if(pnsList.isEmpty()) {
            return new ArrayList<>();
        }
        return pnsList.stream().map(pns -> convertPnsToResponseDto(pns.getHtsClient(), pns)).collect(Collectors.toList());
    }

    public PersonalNotificationService getPnsById(Long id) {
        return personalNotificationServiceRepository
                .findByIdAndArchivedAndFacilityId(id, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(()-> new EntityNotFoundException(PersonalNotificationService.class, "id", ""+id));
    }

    public PersonalNotificationServiceResponseDTO getPnsIndexClientPartnerById(Long id) {
        return convertPnsToResponseDto(null, getPnsById(id));
    }


    public void updateIndexClientStatus(String uuid) {
        System.out.println("inside updateIndexClientStatus");

        System.out.println("uuid " + uuid);

        if (!uuid.isEmpty()) {
            Optional<PersonalNotificationService> pns = personalNotificationServiceRepository.findByUuidAndArchived(uuid, 0);
            System.out.println(pns);
            if (pns.isPresent()) {
                PersonalNotificationService existingPns = pns.get();
                existingPns.setIsHtsClient("Yes");
                personalNotificationServiceRepository.save(existingPns);
            }
        }
    }
}

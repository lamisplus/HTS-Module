package org.lamisplus.modules.hts.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.hts.domain.dto.*;
import org.lamisplus.modules.hts.domain.entity.FamilyIndex;
import org.lamisplus.modules.hts.domain.entity.FamilyIndexTesting;
import org.lamisplus.modules.hts.domain.entity.FamilyTestingTracker;
import org.lamisplus.modules.hts.domain.entity.HtsClient;
import org.lamisplus.modules.hts.repository.FamilyIndexRepository;
import org.lamisplus.modules.hts.repository.FamilyIndexTestingRepository;
import org.lamisplus.modules.hts.repository.FamilyTestingTrackerRepository;
import org.lamisplus.modules.hts.repository.HtsClientRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@RequiredArgsConstructor
@Slf4j
@Service
public class FamilyIndexTestingService {

    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final HtsClientRepository htsClientRepository;
    private final FamilyIndexTestingRepository familyIndexTestingRepository;
    private final FamilyIndexRepository familyIndexRepository;
    private final FamilyTestingTrackerRepository familyTestingTrackerRepository;
    private final  String successMessage = " deleted successfully"; 

    private HtsClient getHtsClient(Long htsClientId, String htsClientUuid) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        HtsClient htsClient = htsClientRepository
                .findByIdAndArchivedAndFacilityId(htsClientId, UN_ARCHIVED, facilityId)
                .orElseThrow(() -> new EntityNotFoundException(HtsClient.class, "htsClientId", "" + htsClientId));

        if (!htsClient.getUuid().equals(htsClientUuid)) {
            throw new IllegalArgumentException("The provided htsClientUuid does not match the uuid of the retrieved htsClient");
        }
        return htsClient;
    }

    @Transactional
    public FamilyIndexTestingResponseDTO save(FamilyIndexTestingRequestDTO requestDTO) {
        if (requestDTO == null) {
            throw new IllegalArgumentException("FamilyIndexTesting Request cannot be null");
        }
        HtsClient htsClient = getHtsClient(requestDTO.getHtsClientId(), requestDTO.getHtsClientUuid());
        Optional<FamilyIndexTesting> found = familyIndexTestingRepository.findByHtsClientIdAndArchived(
                requestDTO.getHtsClientId(), UN_ARCHIVED
        );
        FamilyIndexTesting familyIndexTesting;
        if (found.isPresent()) {
            familyIndexTesting = updateExistinFamilyIndexTesting(found.get(), requestDTO);
        } else {
            familyIndexTesting = convertFamilyIndexTestingRequestDTOToEntity(requestDTO, htsClient);
            familyIndexTesting = familyIndexTestingRepository.save(familyIndexTesting);
        }

        // Handle FamilyIndex and FamilyTestingTrackers
        if (requestDTO.getFamilyIndexRequestDto() != null) {
            FamilyIndex familyIndex = addFamilyIndex(requestDTO.getFamilyIndexRequestDto(), familyIndexTesting);
            if (familyIndex != null && requestDTO.getFamilyIndexRequestDto().getFamilyTestingTrackerRequestDTOs() != null) {
                handleFamilyTestingTrackers(requestDTO.getFamilyIndexRequestDto().getFamilyTestingTrackerRequestDTOs(), familyIndex);
            }
        }
        Hibernate.initialize(familyIndexTesting.getFamilyIndices());
        familyIndexTesting.getFamilyIndices().forEach(fi ->
                Hibernate.initialize(fi.getFamilyTestingTrackers())
        );
        return convertFamilyIndexTestingToResponseDTO2(familyIndexTesting);
    }

    private void handleFamilyTestingTrackers(List<FamilyTestingTrackerRequestDTO> trackerDtos, FamilyIndex familyIndex) {
        for (FamilyTestingTrackerRequestDTO trackerDto : trackerDtos) {
            addFamilyIndexTracker(trackerDto, familyIndex);
        }
    }


    private FamilyIndexTesting updateExistinFamilyIndexTesting(FamilyIndexTesting familyIndexTesting, FamilyIndexTestingRequestDTO requestDTO) {
        familyIndexTesting.setExtra(requestDTO.getExtra());
        familyIndexTesting.setState(requestDTO.getState());
        familyIndexTesting.setLga(requestDTO.getLga());
        familyIndexTesting.setFacilityName(requestDTO.getFacilityName());
        familyIndexTesting.setVisitDate(requestDTO.getVisitDate());
        familyIndexTesting.setSetting(requestDTO.getSetting());
        familyIndexTesting.setFamilyIndexClient(requestDTO.getFamilyIndexClient());
        familyIndexTesting.setSex(requestDTO.getSex());
        familyIndexTesting.setIndexClientId(requestDTO.getIndexClientId());
        familyIndexTesting.setName(requestDTO.getName());
        familyIndexTesting.setContactId(requestDTO.getContactId());
        familyIndexTesting.setDateOfBirth(requestDTO.getDateOfBirth());
        familyIndexTesting.setAge(requestDTO.getAge());
        familyIndexTesting.setMaritalStatus(requestDTO.getMaritalStatus());
        familyIndexTesting.setPhoneNumber(requestDTO.getPhoneNumber());
        familyIndexTesting.setAlternatePhoneNumber(requestDTO.getAlternatePhoneNumber());
        familyIndexTesting.setDateIndexClientConfirmedHivPositiveTestResult(requestDTO.getDateIndexClientConfirmedHivPositiveTestResult());
        familyIndexTesting.setVirallyUnSuppressed(requestDTO.getVirallyUnSuppressed());
        familyIndexTesting.setIsClientCurrentlyOnHivTreatment(requestDTO.getIsClientCurrentlyOnHivTreatment());
        familyIndexTesting.setDateClientEnrolledOnTreatment(requestDTO.getDateClientEnrolledOnTreatment());
        familyIndexTesting.setRecencyTesting(requestDTO.getRecencyTesting());
        familyIndexTesting.setWillingToHaveChildrenTestedElseWhere(requestDTO.getWillingToHaveChildrenTestedElseWhere());

       return familyIndexTestingRepository.save(familyIndexTesting);
    }


    public FamilyIndexTestingResponseDTO getFamilyIndexTestingById(Long id) {
        FamilyIndexTesting familyIndexTesting = familyIndexTestingRepository.findByIdAndArchived(id, UN_ARCHIVED)
                .orElse(null);
        return familyIndexTesting != null ? convertFamilyIndexTestingToResponseDTO(familyIndexTesting) : null;
    }


    public String generateContactId(Long htsClientId, String clientCode) {
        if (htsClientId == null || clientCode == null || clientCode.isEmpty()) {
            throw new IllegalArgumentException("Invalid HTS client ID or client code");
        }

        HtsClient htsClient = htsClientRepository
                .findByIdAndArchivedAndFacilityId(htsClientId, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(() -> new EntityNotFoundException(HtsClient.class, clientCode, "" + htsClientId));

        // Check if the retrieved HTS client matches the provided ID and client code
        if (!htsClient.getId().equals(htsClientId) || !htsClient.getClientCode().equals(clientCode)) {
            throw new IllegalArgumentException("HTS client ID or client code does not match the provided values");
        }
        List<FamilyIndexTestingResponseDTO> familyIndexList = getFamilyIndexTestingListByHtsClient(htsClientId);
        if (familyIndexList.isEmpty()) {
            return clientCode + "/FMI/001";
        } else {
            // Get the last partner ID from the list
            String lastContactId = familyIndexList.get(familyIndexList.size() - 1).getContactId();

            // If lastContactId is null or empty, return the first contact ID
            if (lastContactId == null || lastContactId.isEmpty()) {
                return clientCode + "/FMI/001";
            }

            // Extract the serial number from the last partner ID and increment it
            int serialNumber = Integer.parseInt(lastContactId.substring(lastContactId.lastIndexOf("/") + 1)) + 1;
            // Create a new partner ID for the new PNS partner
            return clientCode + "/FMI/" + String.format("%03d", serialNumber);
        }
    }

    public List<FamilyIndexTestingResponseDTO> getFamilyIndexTestingListByHtsClient(Long id) {
        List<FamilyIndexTestingResponseDTO> result = new ArrayList<>();

        Optional<FamilyIndexTesting> familyIndexTestingOptional = familyIndexTestingRepository.findByHtsClientIdAndArchived(id, UN_ARCHIVED);

        if (familyIndexTestingOptional.isPresent()) {
            result.add(convertFamilyIndexTestingToResponseDTO(familyIndexTestingOptional.get()));
        }

        return result;
    }

    public FamilyIndexTestingResponseDTO getFamilyIndexTestingByHtsClient(Long id) {
        Optional<FamilyIndexTesting> familyIndexTestingList = familyIndexTestingRepository.findByHtsClientIdAndArchived(id, UN_ARCHIVED);
        if(!familyIndexTestingList.isPresent()) {
            return null;
        }
        return convertFamilyIndexTestingToResponseDTO(familyIndexTestingList.get());
    }

    private FamilyIndexTestingResponseDTO convertFamilyIndexTestingToResponseDTO2(FamilyIndexTesting familyIndexTesting) {
        if (familyIndexTesting == null) {
            throw new IllegalArgumentException("FamilyIndexTesting entity cannot be null");
        }
        // Convert FamilyIndexTesting to DTO
        FamilyIndexTestingResponseDTO responseDTO = new FamilyIndexTestingResponseDTO();
        BeanUtils.copyProperties(familyIndexTesting, responseDTO);
        responseDTO.setId(familyIndexTesting.getId());
        responseDTO.setUuid(familyIndexTesting.getUuid());
        responseDTO.setHtsClientId(familyIndexTesting.getHtsClient().getId());

        // Convert FamilyIndex list
        List<FamilyIndexResponseDTO> familyIndexResponseDTOList = new ArrayList<>();
        if (familyIndexTesting.getFamilyIndices() != null && !familyIndexTesting.getFamilyIndices().isEmpty()) {
            for (FamilyIndex familyIndex : familyIndexTesting.getFamilyIndices()) {
                FamilyIndexResponseDTO familyIndexResponseDTO = convertFamilyIndexToResponseDTO(familyIndex);
                familyIndexResponseDTO.setFamilyIndexTestingUuid(familyIndexTesting.getUuid());
                // Convert trackers
                List<FamilyTestingTrackerResponseDTO> trackerDTOs = convertFamilyTestingTrackersToResponseDTO(
                        familyIndex.getFamilyTestingTrackers(), familyIndex
                );
                familyIndexResponseDTO.setFamilyTestingTrackerResponseDTO(trackerDTOs);

                familyIndexResponseDTOList.add(familyIndexResponseDTO);
            }
        }
        responseDTO.setFamilyIndexList(familyIndexResponseDTOList);
        return responseDTO;
    }

    // Helper method to convert FamilyIndex to DTO
    private FamilyIndexResponseDTO convertFamilyIndexToResponseDTO(FamilyIndex familyIndex) {
        FamilyIndexResponseDTO responseDTO = new FamilyIndexResponseDTO();
        BeanUtils.copyProperties(familyIndex, responseDTO);
        return responseDTO;
    }

    // Helper method to convert FamilyTestingTracker list to DTO list
    private List<FamilyTestingTrackerResponseDTO> convertFamilyTestingTrackersToResponseDTO(
            List<FamilyTestingTracker> trackers, FamilyIndex familyIndex) {
        List<FamilyTestingTrackerResponseDTO> trackerDTOs = new ArrayList<>();
        if (trackers != null && !trackers.isEmpty()) {
            for (FamilyTestingTracker tracker : trackers) {
                FamilyTestingTrackerResponseDTO trackerDTO = new FamilyTestingTrackerResponseDTO();
                BeanUtils.copyProperties(tracker, trackerDTO);
                trackerDTO.setFamilyIndexUuid(familyIndex.getUuid());
                trackerDTO.setFamilyIndex(familyIndex.getId());
                trackerDTOs.add(trackerDTO);
            }
        }
        return trackerDTOs;
    }

    private void updateFamilyIndex(FamilyIndex familyIndex, FamilyIndexResponseDTO familyIndexResponseDTO) {
        BeanUtils.copyProperties(familyIndexResponseDTO, familyIndex);
    }

    private void updateFamilyTestingTracker(FamilyTestingTracker tracker, FamilyTestingTrackerResponseDTO trackerResponseDTO) {
        BeanUtils.copyProperties(trackerResponseDTO, tracker);
    }

    private FamilyIndexTestingResponseDTO convertFamilyIndexTestingToResponseDTO(FamilyIndexTesting familyIndexTesting) {
        FamilyIndexTestingResponseDTO responseDTO = new FamilyIndexTestingResponseDTO();
        responseDTO.setId(familyIndexTesting.getId());
        responseDTO.setUuid(familyIndexTesting.getUuid());
        responseDTO.setHtsClientId(familyIndexTesting.getHtsClient().getId());
        BeanUtils.copyProperties(familyIndexTesting, responseDTO);

        List<FamilyIndexResponseDTO> familyIndexResponseDTOList = new ArrayList<>();
        if (familyIndexTesting.getFamilyIndices() != null || !familyIndexTesting.getFamilyIndices().isEmpty()) {
            for (FamilyIndex familyIndex : familyIndexTesting.getFamilyIndices()) {
                FamilyIndexResponseDTO newFam = getFamilyIndexResponseDTO(familyIndexTesting, familyIndex);
                familyIndexResponseDTOList.add(newFam);
            }
            responseDTO.setFamilyIndexList(familyIndexResponseDTOList);
        }
        return responseDTO;
    }

    @NotNull
    private static FamilyIndexResponseDTO getFamilyIndexResponseDTO(FamilyIndexTesting familyIndexTesting, FamilyIndex familyIndex) {
        FamilyIndexResponseDTO newFam = new FamilyIndexResponseDTO();;
        BeanUtils.copyProperties(familyIndex, newFam);
        newFam.setFamilyIndexTestingUuid(familyIndexTesting.getUuid());

        // get the list of family testing trackers for the family index
        List<FamilyTestingTrackerResponseDTO> familyTestingTrackerResponseDTOList = new ArrayList<>();
        if (familyIndex.getFamilyTestingTrackers() != null && !familyIndex.getFamilyTestingTrackers().isEmpty()) {
            for (FamilyTestingTracker familyTestingTracker : familyIndex.getFamilyTestingTrackers()) {
                FamilyTestingTrackerResponseDTO familyTestingTrackerResponseDTO = new FamilyTestingTrackerResponseDTO();
                BeanUtils.copyProperties(familyTestingTracker, familyTestingTrackerResponseDTO);
                familyTestingTrackerResponseDTO.setFamilyIndexUuid(familyIndex.getUuid());
                familyTestingTrackerResponseDTOList.add(familyTestingTrackerResponseDTO);
            }
        }
        newFam.setFamilyTestingTrackerResponseDTO(familyTestingTrackerResponseDTOList);
        return newFam;
    }

    private FamilyIndexTesting convertFamilyIndexTestingRequestDTOToEntity(FamilyIndexTestingRequestDTO requestDTO, HtsClient htsClient) {
        FamilyIndexTesting familyIndexTesting = new FamilyIndexTesting();
        BeanUtils.copyProperties(requestDTO, familyIndexTesting);
        familyIndexTesting.setHtsClient(htsClient);
        familyIndexTesting.setHtsClientId(htsClient.getId());
        familyIndexTesting.setHtsClientUuid(htsClient.getUuid());

        return familyIndexTesting;
    }

    public FamilyIndex addFamilyIndex(FamilyIndexRequestDto familyIndexRequestDto, FamilyIndexTesting familyIndexTesting) {
        if (familyIndexRequestDto == null || familyIndexTesting == null) {
            throw new IllegalArgumentException("FamilyIndex Request or FamilyIndexTesting cannot be null");
        }

        FamilyIndex familyIndex = new FamilyIndex();
        BeanUtils.copyProperties(familyIndexRequestDto, familyIndex);
        familyIndex.setFamilyIndexTesting(familyIndexTesting);
        familyIndex.setFamilyIndexTestingUuid(familyIndexTesting.getUuid());
        familyIndex.setIsDateOfBirthEstimated(familyIndexRequestDto.getIsDateOfBirthEstimated());
        familyIndex.setIsHtsClient("No");

        // Add to parent's collection BEFORE saving
        familyIndexTesting.getFamilyIndices().add(familyIndex);

        // Save the FamilyIndex (cascade will propagate to parent)
        familyIndex = familyIndexRepository.save(familyIndex);

        return familyIndex;
    }


        public void addFamilyIndexTracker(FamilyTestingTrackerRequestDTO req, FamilyIndex familyIndex) {
            if (req == null || familyIndex == null) {
                throw new IllegalArgumentException("Family Testing Tracker Request or Family Index cannot be null");
            }
            FamilyTestingTracker familyTestingTracker = new FamilyTestingTracker();
            BeanUtils.copyProperties(req, familyTestingTracker);
            familyTestingTracker.setFamilyIndex(familyIndex);
            familyTestingTracker.setFamilyIndexTestingId(familyIndex.getFamilyIndexTesting().getId());
            familyTestingTracker.setFamilyIndexUuid(familyIndex.getUuid());

            familyTestingTrackerRepository.save(familyTestingTracker);
        }


    public String deleteFamilyIndexTestingById(Long id) {
        FamilyIndexTesting familyIndexTesting = familyIndexTestingRepository.findByIdAndArchived(id, UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(FamilyIndexTesting.class, "id", id + ""));
        familyIndexTesting.setArchived(1);
        familyIndexTestingRepository.save(familyIndexTesting);
        return "Family Index Testing with the id " + id + successMessage;
    }

    public FamilyIndex findFamilyIndexById(Long id) {
        return familyIndexRepository.findByIdAndArchived(id, UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(FamilyIndex.class, "id", id.toString()));
    }


    public FamilyIndexResponseDTO getFamilyIndexById(Long id) {
        FamilyIndex familyIndex = findFamilyIndexById(id);
        // use the family index to get the family testing tracker associated with it and include in the response
        FamilyIndexResponseDTO familyIndexResponseDTO = convertFamilyIndexToResponseDTO(familyIndex);
        if(familyIndex != null){
            List<FamilyTestingTracker> familyTestingTrackers = familyTestingTrackerRepository.findByFamilyIndexUuid(familyIndex.getUuid(), UN_ARCHIVED);
            List<FamilyTestingTrackerResponseDTO> familyTestingTrackerResponseDTOList = new ArrayList<>();
            if (familyTestingTrackers != null && !familyTestingTrackers.isEmpty()) {
                for (FamilyTestingTracker familyTestingTracker : familyTestingTrackers) {
                    FamilyTestingTrackerResponseDTO familyTestingTrackerResponseDTO = new FamilyTestingTrackerResponseDTO();
                    BeanUtils.copyProperties(familyTestingTracker, familyTestingTrackerResponseDTO);
                    familyTestingTrackerResponseDTO.setFamilyIndexUuid(familyIndex.getUuid());
                    familyTestingTrackerResponseDTO.setFamilyIndex(familyIndex.getId());
                    familyTestingTrackerResponseDTOList.add(familyTestingTrackerResponseDTO);
                }
                familyIndexResponseDTO.setFamilyTestingTrackerResponseDTO(familyTestingTrackerResponseDTOList);
            }
        }
        return familyIndexResponseDTO;
    }

    public List<FamilyIndexResponseDTO> getFamilyIndexByFamilyIndexTestingUuid(String uuid) {
        List<FamilyIndex> existingFamilyIndexList = familyIndexRepository.findByFamilyIndexTestingUuid(uuid, UN_ARCHIVED);
        if (existingFamilyIndexList.isEmpty()) {
            return new ArrayList<>();
        }
        List<FamilyIndexResponseDTO> familyIndexResponseDTOList = new ArrayList<>();
        for (FamilyIndex familyIndex : existingFamilyIndexList) {
            familyIndexResponseDTOList.add(convertFamilyIndexToResponseDTO(familyIndex));
        }
        return familyIndexResponseDTOList;
    }

    public String deleteFamilyIndex(Long id) {
        FamilyIndex familyIndex = findFamilyIndexById(id);
        familyIndex.setArchived(1);
        familyIndexRepository.save(familyIndex);
        return "Family Index with the id " + id + successMessage;
    }

    public FamilyTestingTracker findFamilyTrackerById(Long id) {
        return familyTestingTrackerRepository.findByIdAndArchived(id, UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(FamilyTestingTracker.class, "id", id.toString()));

    }

    public FamilyTestingTrackerResponseDTO getFamilyTestingTrackerById(Long id) {
        FamilyTestingTracker familyTestingTracker = findFamilyTrackerById(id);
        return convertFamilyTestingTrackerToResponseDTO(familyTestingTracker);
    }

    public FamilyTestingTrackerResponseDTO updateFamilyTracker(Long id, FamilyTestingTrackerResponseDTO familyTestingTrackerRequestDTO) {
        FamilyTestingTracker familyTestingTracker = findFamilyTrackerById(id);
        // if provided id does not match the id of the family testing tracker in the database, throw an exception
        if (!familyTestingTrackerRequestDTO.getId().equals(id) && familyTestingTracker == null ) {
            throw new IllegalArgumentException("The provided id does not match the id of the family testing tracker");
        }
        BeanUtils.copyProperties(familyTestingTrackerRequestDTO, familyTestingTracker);
        familyTestingTracker.setFamilyIndexUuid(familyTestingTracker.getFamilyIndex().getUuid());
        familyTestingTracker.setFamilyIndex(familyTestingTracker.getFamilyIndex());
        familyTestingTracker.setFamilyIndexTestingId(familyTestingTracker.getFamilyIndexTestingId());
        familyTestingTrackerRepository.save(familyTestingTracker);
        return convertFamilyTestingTrackerToResponseDTO(familyTestingTracker);
    }

    public String deleteFamilyTracker(Long id) {
        FamilyTestingTracker familyTestingTracker = findFamilyTrackerById(id);
        familyTestingTracker.setArchived(1);
        familyTestingTrackerRepository.save(familyTestingTracker);
        return "Family Testing Tracker with the id " + id + successMessage;
    }


    public List<FamilyTestingTrackerResponseDTO> getFamilyTestingTrackerByFamilyIndexUuid(String uuid) {
        List<FamilyTestingTracker> familyTestingTrackerList = familyTestingTrackerRepository.findByFamilyIndexUuid(uuid, UN_ARCHIVED);
        if (familyTestingTrackerList.isEmpty()) {
            return new ArrayList<>();
        }
        List<FamilyTestingTrackerResponseDTO> familyTestingTrackerResponseDTOList = new ArrayList<>();
        for (FamilyTestingTracker familyTestingTracker : familyTestingTrackerList) {
            familyTestingTrackerResponseDTOList.add(convertFamilyTestingTrackerToResponseDTO(familyTestingTracker));
        }
        return familyTestingTrackerResponseDTOList;
    }

    private FamilyTestingTrackerResponseDTO convertFamilyTestingTrackerToResponseDTO(FamilyTestingTracker familyTestingTracker) {
        FamilyTestingTrackerResponseDTO familyTestingTrackerResponseDTO = new FamilyTestingTrackerResponseDTO();
        BeanUtils.copyProperties(familyTestingTracker, familyTestingTrackerResponseDTO);
        familyTestingTrackerResponseDTO.setFamilyIndex(familyTestingTracker.getFamilyIndex().getId());
        familyTestingTrackerResponseDTO.setId(familyTestingTracker.getId());
        return familyTestingTrackerResponseDTO;
    }


    @Transactional
    public FamilyIndexResponseDTO updateFamilyIndex(Long familyIndexId, FamilyIndexResponseDTO reqDTO) {
        FamilyIndex existingFamilyIndex = familyIndexRepository.findById(familyIndexId)
                .orElseThrow(() -> new EntityNotFoundException(FamilyIndex.class, "id", familyIndexId + ""));
        // get trackers that is associate with the family index and update them
        List<FamilyTestingTracker> trackers = familyTestingTrackerRepository.findByFamilyIndexUuid(existingFamilyIndex.getUuid(), UN_ARCHIVED);
        Map<Long, FamilyTestingTracker> trackerMap = trackers.stream()
                .collect(Collectors.toMap(FamilyTestingTracker::getId, Function.identity()));

        for (FamilyTestingTrackerResponseDTO trackerResponseDTO : reqDTO.getFamilyTestingTrackerResponseDTO()) {
            FamilyTestingTracker tracker = trackerMap.get(trackerResponseDTO.getId());
            if (tracker != null) {
                // Update existing tracker
                updateFamilyTestingTracker(tracker, trackerResponseDTO);
            } else {
                // Create new tracker
                tracker = new FamilyTestingTracker();
                BeanUtils.copyProperties(trackerResponseDTO, tracker);
                tracker.setFamilyIndex(existingFamilyIndex);
                existingFamilyIndex.getFamilyTestingTrackers().add(tracker);
            }
            familyTestingTrackerRepository.save(tracker);
        }

        updateFamilyIndex(existingFamilyIndex, reqDTO);
        familyIndexRepository.save(existingFamilyIndex);
        return convertFamilyIndexToResponseDTO(existingFamilyIndex);
    }

    public FamilyTestingTrackerResponseDTO addFamilyTracker(FamilyTestingTrackerRequestDTO familyTestingTracker){
        FamilyIndex existingFamilyIndex = familyIndexRepository.findById(familyTestingTracker.getFamilyIndexId())
                .orElseThrow(() -> new EntityNotFoundException(FamilyIndex.class, "id", familyTestingTracker.getFamilyIndexId() + ""));
        FamilyTestingTracker tracker = new FamilyTestingTracker();
        BeanUtils.copyProperties(familyTestingTracker, tracker);
        tracker.setFamilyIndex(existingFamilyIndex);
        tracker.setFamilyIndexUuid(existingFamilyIndex.getUuid());
        familyTestingTrackerRepository.save(tracker);

        return convertFamilyTestingTrackerToResponseDTO(tracker);
    }

    public FamilyIndexResponseDTO updateSingleFamilyIndex(Long id, FamilyIndexResponseDTO req){
        FamilyIndex existingFamilyIndex = familyIndexRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(FamilyIndex.class, "id", id + ""));
        if (!req.getId().equals(id) && existingFamilyIndex == null ) {
            throw new IllegalArgumentException("The provided id does not match any saved family index");
        }
        BeanUtils.copyProperties(req, existingFamilyIndex);
        existingFamilyIndex.setId(existingFamilyIndex.getId());
        existingFamilyIndex.setUuid(existingFamilyIndex.getUuid());
        existingFamilyIndex.setFamilyIndexTestingUuid(existingFamilyIndex.getFamilyIndexTestingUuid());
        familyIndexRepository.save(existingFamilyIndex);

        return convertFamilyIndexToResponseDTO(existingFamilyIndex);
    }

    @Transactional
    public String updateFamilyIndexTestingAndIndex(Long id, FamilyIndexTestingResponseDTO req) {
        Optional<FamilyIndexTesting> found = familyIndexTestingRepository.findByIdAndArchived(id, UN_ARCHIVED);
        if(!found.isPresent()){
            throw new EntityNotFoundException(HtsClient.class, "htsClientId", "" + id);
        }
        if(!found.get().getId().equals(req.getId())){
            throw new IllegalArgumentException("The provided id does not match any saved family index testing");
        }

        FamilyIndexTesting familyIndexTesting = found.get();
        familyIndexTesting.setUuid(req.getUuid());
        familyIndexTesting.setHtsClientUuid(req.getHtsClientUuid());
        familyIndexTesting.setHtsClientId(req.getHtsClientId());
        familyIndexTesting.setExtra(req.getExtra());
        familyIndexTesting.setState(req.getState());
        familyIndexTesting.setLga(req.getLga());
        familyIndexTesting.setFacilityName(req.getFacilityName());
        familyIndexTesting.setContactId(req.getContactId());
        familyIndexTesting.setVisitDate(req.getVisitDate());
        familyIndexTesting.setSetting(req.getSetting());
        familyIndexTesting.setFamilyIndexClient(req.getFamilyIndexClient());
        familyIndexTesting.setSex(req.getSex());
        familyIndexTesting.setIndexClientId(req.getIndexClientId());
        familyIndexTesting.setName(req.getName());
        familyIndexTesting.setDateOfBirth(req.getDateOfBirth());
        familyIndexTesting.setAge(req.getAge());
        familyIndexTesting.setMaritalStatus(req.getMaritalStatus());
        familyIndexTesting.setPhoneNumber(req.getPhoneNumber());
        familyIndexTesting.setAlternatePhoneNumber(req.getAlternatePhoneNumber());
        familyIndexTesting.setDateIndexClientConfirmedHivPositiveTestResult(req.getDateIndexClientConfirmedHivPositiveTestResult());
        familyIndexTesting.setVirallyUnSuppressed(req.getVirallyUnSuppressed());
        familyIndexTesting.setDateClientEnrolledOnTreatment(req.getDateClientEnrolledOnTreatment());
        familyIndexTesting.setRecencyTesting(req.getRecencyTesting());
        familyIndexTesting.setWillingToHaveChildrenTestedElseWhere(req.getWillingToHaveChildrenTestedElseWhere());

        // Update familyIndexList
        if (req.getFamilyIndexList() != null && !req.getFamilyIndexList().isEmpty()) {
            req.getFamilyIndexList().forEach(familyIndex -> {
                FamilyIndex existingFamilyIndex = familyIndexTesting.getFamilyIndices().stream()
                        .filter(fi -> fi.getId().equals(familyIndex.getId()))
                        .findFirst()
                        .orElseGet(() -> new FamilyIndex());
                existingFamilyIndex.setId(familyIndex.getId());
                existingFamilyIndex.setUuid(familyIndex.getUuid());
                existingFamilyIndex.setFamilyRelationship(familyIndex.getFamilyRelationship());
                existingFamilyIndex.setStatusOfContact(familyIndex.getStatusOfContact());
                existingFamilyIndex.setChildNumber(familyIndex.getChildNumber());
                existingFamilyIndex.setContactId(familyIndex.getContactId());
                existingFamilyIndex.setOtherChildNumber(familyIndex.getOtherChildNumber());
                existingFamilyIndex.setMotherDead(familyIndex.getMotherDead());
                existingFamilyIndex.setUAN(familyIndex.getUAN());
                existingFamilyIndex.setYearMotherDead(familyIndex.getYearMotherDead());
                existingFamilyIndex.setFamilyIndexTestingUuid(familyIndex.getFamilyIndexTestingUuid());
                existingFamilyIndex.setDateOfHts(familyIndex.getDateOfHts());
                existingFamilyIndex.setDateOfBirth(familyIndex.getDateOfBirth());
                existingFamilyIndex.setAge(familyIndex.getAge());
                existingFamilyIndex.setFirstName(familyIndex.getFirstName());
                existingFamilyIndex.setLastName(familyIndex.getLastName());
                existingFamilyIndex.setMiddleName(familyIndex.getMiddleName());
                existingFamilyIndex.setChildDead(familyIndex.getChildDead());
                existingFamilyIndex.setYearChildDead(familyIndex.getYearChildDead());
                existingFamilyIndex.setLiveWithParent(familyIndex.getLiveWithParent());
                existingFamilyIndex.setIsDateOfBirthEstimated(familyIndex.getIsDateOfBirthEstimated());
                familyIndexRepository.save(existingFamilyIndex);
            });
        }
        familyIndexTestingRepository.save(familyIndexTesting);
        return "Family Index Testing updated successfully";
    }

    public void updateIndexClientStatus(String uuid) {
        if (!uuid.isEmpty()) {
            Optional<FamilyIndex> existingFamilyIndex = familyIndexRepository.findByUuidAndArchived(uuid, 0);
            if (existingFamilyIndex.isPresent()) {
                FamilyIndex familyIndex = existingFamilyIndex.get();
                familyIndex.setIsHtsClient("Yes");
                familyIndexRepository.save(familyIndex);
            }
        }
    }

    public String getCurrentTreatmentAndDate(String personUuid) {
        String Result = familyIndexRepository.getCurrentHIVByPersonUuid(personUuid);
        if(Result != null) {
            return Result;
        }else{

            return"";
        }

    }

    public UuidProjection getHTSClientUUID(String personUuid) {
        return familyIndexRepository.getHTSClientUUID(personUuid);
    }


    public String getVirallySuppressedByPersonUuid(String personUuid) {
        String Result =   familyIndexRepository.getVirallySuppressedByPersonUuid(personUuid);
        if(Result != null) {
            return Result;
        }else{

            return"";
        }

    }
}

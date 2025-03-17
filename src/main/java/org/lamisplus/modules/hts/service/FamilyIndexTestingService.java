package org.lamisplus.modules.hts.service;


import io.micrometer.core.instrument.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.http.ResponseEntity;
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
        FamilyIndexTesting familyIndexTesting;
        if (requestDTO == null) {
            throw new IllegalArgumentException("FamilyIndexTesting Request cannot be null");
        }
        HtsClient htsClient = this.getHtsClient(requestDTO.getHtsClientId(), requestDTO.getHtsClientUuid());
        // check if htsClient already exist
        Optional<FamilyIndexTesting> found = familyIndexTestingRepository.findByHtsClientIdAndArchived(requestDTO.getHtsClientId(), UN_ARCHIVED);

        boolean hasFamilyIndexRequestDto = requestDTO.getFamilyIndexRequestDto() != null;
        if (found.isPresent()) {
            familyIndexTesting = found.get();
            //update the existing record with the new information provided for the familyIndexTesting
            familyIndexTesting = this.updateExistinFamilyIndexTesting(familyIndexTesting, requestDTO);
            //then update the existing record with new family index and family testing tracker if any
            if (hasFamilyIndexRequestDto) {
                FamilyIndex familyIndex =  addFamilyIndex(requestDTO.getFamilyIndexRequestDto(), familyIndexTesting);
                if(familyIndex != null && requestDTO.getFamilyIndexRequestDto().getFamilyTestingTrackerRequestDTO() != null)  {
                    addFamilyIndexTracker(requestDTO.getFamilyIndexRequestDto().getFamilyTestingTrackerRequestDTO(), familyIndex);
                }
            }
        }else {
            // create a new record
            familyIndexTesting = convertFamilyIndexTestingRequestDTOToEntity(requestDTO, htsClient);
            familyIndexTesting = familyIndexTestingRepository.save(familyIndexTesting);
            // add family index
            if (hasFamilyIndexRequestDto) {
                FamilyIndex familyIndex =  addFamilyIndex(requestDTO.getFamilyIndexRequestDto(), familyIndexTesting);
                if(familyIndex != null && requestDTO.getFamilyIndexRequestDto().getFamilyTestingTrackerRequestDTO() != null)  {
                    addFamilyIndexTracker(requestDTO.getFamilyIndexRequestDto().getFamilyTestingTrackerRequestDTO(), familyIndex);
                }
            }
        }
        return convertFamilyIndexTestingToResponseDTO2(familyIndexTesting);
    }

    private FamilyIndexTesting updateExistinFamilyIndexTesting(FamilyIndexTesting familyIndexTesting, FamilyIndexTestingRequestDTO requestDTO) {
        // Update the fields in familyIndexTesting with the values from requestDTO
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

    public FamilyIndexTestingResponseDTO getFamilyIndexTestingByHtsClient(Long id) {
        Optional<FamilyIndexTesting> familyIndexTestingList = familyIndexTestingRepository.findByHtsClientIdAndArchived(id, UN_ARCHIVED);
        if(!familyIndexTestingList.isPresent()) {
            return null;
        }
        return convertFamilyIndexTestingToResponseDTO(familyIndexTestingList.get());
    }

    private FamilyIndexTestingResponseDTO convertFamilyIndexTestingToResponseDTO2(FamilyIndexTesting familyIndexTesting) {
        FamilyIndexTestingResponseDTO responseDTO = new FamilyIndexTestingResponseDTO();
        BeanUtils.copyProperties(familyIndexTesting, responseDTO);
        responseDTO.setId(familyIndexTesting.getId());
        responseDTO.setUuid(familyIndexTesting.getUuid());
        responseDTO.setHtsClientId(familyIndexTesting.getHtsClient().getId());


        List<FamilyIndexResponseDTO> familyIndexResponseDTOList = new ArrayList<>();
        if (familyIndexTesting.getFamilyIndices() != null && !familyIndexTesting.getFamilyIndices().isEmpty()) {
            for (FamilyIndex familyIndex : familyIndexTesting.getFamilyIndices()) {
                FamilyIndexResponseDTO newFam = new FamilyIndexResponseDTO();
                BeanUtils.copyProperties(familyIndex, newFam);
                newFam.setFamilyIndexTestingUuid(familyIndexTesting.getUuid());
                familyIndexResponseDTOList.add(newFam);
                // get the list of family testing trackers associated with the family index and include in response
                List<FamilyTestingTrackerResponseDTO> familyTestingTrackerResponseDTOList = new ArrayList<>();
                if (familyIndex.getFamilyTestingTrackers() != null && !familyIndex.getFamilyTestingTrackers().isEmpty()) {
                    for (FamilyTestingTracker familyTestingTracker : familyIndex.getFamilyTestingTrackers()) {
                        FamilyTestingTrackerResponseDTO familyTestingTrackerResponseDTO = new FamilyTestingTrackerResponseDTO();
                        BeanUtils.copyProperties(familyTestingTracker, familyTestingTrackerResponseDTO);
                        familyTestingTrackerResponseDTO.setFamilyIndexUuid(familyIndex.getUuid());
                        familyTestingTrackerResponseDTO.setFamilyIndex(familyIndex.getId());
                        familyTestingTrackerResponseDTO.setFamilyIndex(familyIndex.getId());
                        familyTestingTrackerResponseDTOList.add(familyTestingTrackerResponseDTO);

                    }
                    newFam.setFamilyTestingTrackerResponseDTO(familyTestingTrackerResponseDTOList);
                }
            }
            responseDTO.setFamilyIndexList(familyIndexResponseDTOList);
        }

        return responseDTO;
    }


    private void updateFamilyIndex(FamilyIndex familyIndex, FamilyIndexResponseDTO familyIndexResponseDTO) {
        BeanUtils.copyProperties(familyIndexResponseDTO, familyIndex);
    }

    private void addFamilyIndex(FamilyIndexResponseDTO familyIndexResponseDTO, FamilyIndexTesting existingFamilyIndexTesting) {
        // Create a new family index entity and save it
        FamilyIndex familyIndex = new FamilyIndex();
        BeanUtils.copyProperties(familyIndexResponseDTO, familyIndex);
        familyIndex.setFamilyIndexTesting(existingFamilyIndexTesting);
        familyIndex.setFamilyIndexTestingUuid(existingFamilyIndexTesting.getUuid());
        familyIndex.setIsDateOfBirthEstimated(familyIndexResponseDTO.getIsDateOfBirthEstimated());
        familyIndexRepository.save(familyIndex);
    }

    private void updateFamilyTestingTrackers(List<FamilyTestingTrackerResponseDTO> familyTestingTrackerResponseDTOList, FamilyIndex existingFamilyIndex) {
        if (familyTestingTrackerResponseDTOList != null && !familyTestingTrackerResponseDTOList.isEmpty()) {
            List<FamilyTestingTracker> existingTrackers = familyTestingTrackerRepository.findByFamilyIndexUuid(existingFamilyIndex.getUuid(), UN_ARCHIVED);
            Map<Long, FamilyTestingTrackerResponseDTO> trackerMap = familyTestingTrackerResponseDTOList.stream().collect(Collectors.toMap(FamilyTestingTrackerResponseDTO::getId, Function.identity()));

            // Iterate over existing family testing trackers and update or delete them
            for (FamilyTestingTracker tracker : existingTrackers) {
                FamilyTestingTrackerResponseDTO trackerResponseDTO = trackerMap.get(tracker.getId());
                if (trackerResponseDTO == null) {
                    // Delete tracker from the database if not found in the request
                    tracker.setArchived(1);
                    familyTestingTrackerRepository.save(tracker);
                } else {
                    // Update tracker if found in the request
                    updateFamilyTestingTracker(tracker, trackerResponseDTO);
                    familyTestingTrackerRepository.save(tracker);
                }
            }
            // Add new family testing trackers
            for (FamilyTestingTrackerResponseDTO trackerResponseDTO : familyTestingTrackerResponseDTOList) {
                if(StringUtils.isEmpty(trackerResponseDTO.getFamilyIndexUuid())) {
                    addFamilyTestingTracker(trackerResponseDTO, existingFamilyIndex);
                }
            }
        }
    }

    private void updateFamilyTestingTracker(FamilyTestingTracker tracker, FamilyTestingTrackerResponseDTO trackerResponseDTO) {
        BeanUtils.copyProperties(trackerResponseDTO, tracker);
    }

    private void addFamilyTestingTracker(FamilyTestingTrackerResponseDTO trackerResponseDTO, FamilyIndex existingFamilyIndex) {
        FamilyTestingTracker tracker = new FamilyTestingTracker();
        BeanUtils.copyProperties(trackerResponseDTO, tracker);
        tracker.setFacilityId(trackerResponseDTO.getFacilityId());
        tracker.setFamilyIndex(existingFamilyIndex);
        tracker.setFamilyIndexUuid(existingFamilyIndex.getUuid());
        familyTestingTrackerRepository.save(tracker);
    }

    private void updateEntityFields(FamilyIndexTestingResponseDTO reqDTO, FamilyIndexTesting entity) {
        BeanUtils.copyProperties(reqDTO, entity);

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


    private void addFamilyIndices(List<FamilyIndexRequestDto> familyIndexRequestDtoList, FamilyIndexTesting familyIndexTesting) {
        for (FamilyIndexRequestDto familyIndexRequestDto : familyIndexRequestDtoList) {
            addFamilyIndex(familyIndexRequestDto, familyIndexTesting);
        }
    }

    public FamilyIndex addFamilyIndex(FamilyIndexRequestDto familyIndexRequestDto, FamilyIndexTesting familyIndexTesting) {
        if (familyIndexRequestDto == null) {
            throw new IllegalArgumentException("FamilyIndex Request cannot be null");
        }
        if (familyIndexTesting == null) {
            throw new IllegalArgumentException("FamilyIndexTesting is required to create family index");
        }
        FamilyIndex familyIndex = new FamilyIndex();
        BeanUtils.copyProperties(familyIndexRequestDto, familyIndex);
        familyIndex.setFamilyIndexTesting(familyIndexTesting);
        familyIndex.setFamilyIndexTestingUuid(familyIndexTesting.getUuid());
        familyIndex.setIsDateOfBirthEstimated(familyIndexRequestDto.getIsDateOfBirthEstimated());
        familyIndex.setIsHtsClient("No");
        familyIndex = familyIndexRepository.save(familyIndex);

        return familyIndex;
    }


    public void addFamilyTestingTrackers(List<FamilyTestingTrackerRequestDTO> req, Long familyIndexId) {
        FamilyIndex familyIndex = familyIndexRepository.findById(familyIndexId)
                .orElseThrow(() -> new IllegalArgumentException("FamilyIndex with id " + familyIndexId + " does not exist"));
        for (FamilyTestingTrackerRequestDTO familyTestingTrackerRequestDTO : req) {
            addFamilyIndexTracker(familyTestingTrackerRequestDTO, familyIndex);
        }
    }


    public void addFamilyIndexTracker(FamilyTestingTrackerRequestDTO req, FamilyIndex familyIndex) {
        if (req != null && familyIndex != null) {
            FamilyTestingTracker familyTestingTracker = new FamilyTestingTracker();
            BeanUtils.copyProperties(req, familyTestingTracker);
            familyTestingTracker.setFamilyIndex(familyIndex);
            familyTestingTracker.setFamilyIndexTestingId(familyIndex.getFamilyIndexTesting().getId());
            familyTestingTracker.setFamilyIndexUuid(familyIndex.getUuid());
            familyTestingTrackerRepository.save(familyTestingTracker);
        } else {
            throw new IllegalArgumentException("Family Testing Tracker Request cannot be null");
        }
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

    private FamilyIndexResponseDTO convertFamilyIndexToResponseDTO(FamilyIndex familyIndex) {
        if (familyIndex == null) {
            throw new IllegalArgumentException("Family Index cannot be null");
        }
        FamilyIndexResponseDTO familyIndexResponseDTO = new FamilyIndexResponseDTO();
        BeanUtils.copyProperties(familyIndex, familyIndexResponseDTO);
        return familyIndexResponseDTO;
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
        System.out.println(Result);
        if(Result != null) {
            return Result;
        }else{

            return"";
        }



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

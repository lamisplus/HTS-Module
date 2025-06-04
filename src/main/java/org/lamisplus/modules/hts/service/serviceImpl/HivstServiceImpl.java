package org.lamisplus.modules.hts.service.serviceImpl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.hts.domain.dto.HivstBasicUserInfoDto;
import org.lamisplus.modules.hts.domain.dto.HivstDto;
import org.lamisplus.modules.hts.domain.dto.HivstTestKitUserInfoDto;
import org.lamisplus.modules.hts.domain.entity.Hivst;
import org.lamisplus.modules.hts.domain.entity.HivstPerson;
import org.lamisplus.modules.hts.domain.entity.HtsPerson;
import org.lamisplus.modules.hts.exceptions.HivstProcessingException;
import org.lamisplus.modules.hts.repository.HivstRepository;
import org.lamisplus.modules.hts.service.CurrentUserOrganizationService;
import org.lamisplus.modules.hts.service.HivstService;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.service.PersonService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@RequiredArgsConstructor
@Slf4j
public class HivstServiceImpl implements HivstService {
    private final HivstRepository hivstRepository;
    private final PersonService personService;
    private final ObjectMapper objectMapper;
    private final CurrentUserOrganizationService currentUserOrganizationService;

    private final String MYSELF = "myself";
    private final int UN_ARCHIVED = 0;

    @Override
    public List<HivstDto> saveHivst(HivstDto hivstDto) {
        LOG.info("Validating HivstDto: {}", hivstDto.toString());
        validateHasPatient(hivstDto);
        validateTestKitUserCategories(hivstDto.getTestKitUserDetails(), hivstDto.getTestKitUsers());

        LOG.info("Processing HivstDto");
        List<Hivst> processedHivstList = new ArrayList<>();
        if (hivstDto.getTestKitUserDetails().isEmpty()) {
            // create a raw HIVST
            Hivst hivst = Hivst.fromDto(hivstDto);
            hivst.setPatientId(getOrCreatePatientId(hivstDto));
            processedHivstList.add(hivst);
        } else {
            // process the hivst for primary and secondary patients
            processedHivstList.addAll(processHivstForPrimaryAndSecondaryPatients(hivstDto));
        }

        LOG.info("Saving Hivst");
        List<Hivst> savedHivst = hivstRepository.saveAll(processedHivstList);

        return savedHivst.stream().map(each -> {
            try {
                return HivstDto.fromEntity(each);
            } catch (JsonProcessingException e) {
                throw new HivstProcessingException("Error on save of record",e);
            }
        }).collect(Collectors.toList());
    }


    private List<Hivst> processHivstForPrimaryAndSecondaryPatients(HivstDto hivstDto) {
        Hivst myselfHivst = null;
        List<HivstTestKitUserInfoDto> updatedUserInfo = new ArrayList<>();
        List<Hivst> hivstList = new ArrayList<>();
        List<HivstTestKitUserInfoDto> listOfUserInfo = hivstDto.getTestKitUserDetails();
        for (HivstTestKitUserInfoDto userInfo : listOfUserInfo) {
            if (userInfo.getBasicUserInfo().getUserCategory().equalsIgnoreCase(MYSELF)) {
                Hivst hivst = Hivst.fromDto(hivstDto);
                hivst.setPatientId(getOrCreatePatientId(hivstDto));
                hivst.setPostTestAssessment(objectMapper.valueToTree(userInfo.getPostTestAssessment()));
                hivst.setReferralInformation(objectMapper.valueToTree(userInfo.getPostTestAssessment().getReferralInformation()));

                updatedUserInfo.add(userInfo);
                myselfHivst = hivst;
            } else {
                PersonDto personDto = HivstBasicUserInfoDto.toPersonDto(userInfo.getBasicUserInfo());
                PersonResponseDto personResponseDto = personService.createPerson(personDto);
                Hivst hivst = Hivst.fromHivstTestKitUserInfoDtoAndHivstDto(userInfo, hivstDto);
                Long createdPatientId = personResponseDto.getId();
                hivst.setPatientId(createdPatientId);
                userInfo.getBasicUserInfo().setPatientId(createdPatientId);
                updatedUserInfo.add(userInfo);
                hivstList.add(hivst);
            }


        }

        if (myselfHivst != null){
            myselfHivst.setTestKitUserDetails(objectMapper.valueToTree(updatedUserInfo));
            hivstList.add(myselfHivst);
        }

        return hivstList;
    }




    private void createPatientAndHivst(HivstDto hivstDto, List<HivstTestKitUserInfoDto> updatedUserInfo, List<Hivst> hivstList, HivstTestKitUserInfoDto userInfo) {
        PersonDto personDto = HivstBasicUserInfoDto.toPersonDto(userInfo.getBasicUserInfo());
        PersonResponseDto personResponseDto = personService.createPerson(personDto);
        Hivst hivst = Hivst.fromHivstTestKitUserInfoDtoAndHivstDto(userInfo, hivstDto);
        hivst.setPatientId(personResponseDto.getId());
        hivstList.add(hivst);
        Long createdPatientId = personResponseDto.getId();
        userInfo.getBasicUserInfo().setPatientId(createdPatientId);
        updatedUserInfo.add(userInfo);
    }

    @Override
    public List<HivstDto> updateHivst(HivstDto hivstDto, Long id) {
        LOG.info("Finding Hivst by id: {}", id);
        Hivst hivst = hivstRepository.findByIdAndArchived(hivstDto.getId(), UN_ARCHIVED).orElseThrow(() -> new EntityNotFoundException(Hivst.class, "id", hivstDto.getId().toString()));
        LOG.info("Found. Updating Hivst...");

        Hivst hivstUpdate = Hivst.fromDto(hivstDto);
        List<Hivst> toBeUpdated = editHivstForPrimaryAndSecondaryPatients(hivstDto);


        List<Hivst> savedHivst = hivstRepository.saveAll(toBeUpdated);

        return savedHivst.stream().map(each -> {
            try {
                return HivstDto.fromEntity(each);
            } catch (JsonProcessingException e) {
                throw new HivstProcessingException("Error, could not update the record", e);
            }
        }).collect(Collectors.toList());
    }

    @Override
    public String deleteHivst(Long id) {
        LOG.info("Deleting Hivst by id: {}" , id);
        Hivst hivst = hivstRepository.findByIdAndArchived(id, UN_ARCHIVED).orElse(null);
        if (hivst != null) {
            hivst.setArchived(1);
            hivstRepository.save(hivst);
            return "Hivst deleted successfully";
        } else {
            throw new EntityNotFoundException( Hivst.class, "id", id.toString());
        }
    }

    @Override
    public HivstDto getHivstById(Long id) {
        Hivst hivst = hivstRepository.findByIdAndArchived(id, UN_ARCHIVED).orElseThrow(() -> new EntityNotFoundException(Hivst.class, "id", id.toString()));
        try {
            return HivstDto.fromEntity(hivst);
        } catch (JsonProcessingException e) {
            throw new HivstProcessingException("Error, could not get the record", e);
        }
    }

    @Override
    public List<HivstDto> getAllHivstByPatientId(Long patientId) {
        List<Hivst> listOfHivst = hivstRepository.findAllByPatientIdAndArchived(patientId, UN_ARCHIVED);
            return listOfHivst.stream().map(hivst -> {
                try {
                    return HivstDto.fromEntity(hivst);
                } catch (JsonProcessingException e) {
                    throw new HivstProcessingException("Error on fetching data", e);
                }
            }).collect(Collectors.toList());
    }

    @Override
    public Page<HivstPerson> getAllHivstPerson(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        if(!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")){
            searchValue = searchValue.replaceAll("\\s", "");
            String queryParam = "%"+searchValue+"%";
            return hivstRepository
                    .findAllPersonHivstBySearchParam(UN_ARCHIVED, facilityId, queryParam, pageable);
        }
        return hivstRepository
                .findAllPersonHivst(UN_ARCHIVED, facilityId, pageable);
    }


    private Long getOrCreatePatientId(HivstDto hivstDto) {
        if (hivstDto.getPatientId() != null){
            return hivstDto.getPatientId();
        } else {
            PersonDto personDto = hivstDto.getPersonObject();
            PersonResponseDto personResponseDto = personService.createPerson(personDto);
            return personResponseDto.getId();
        }
    }

    private void validateHasPatient(HivstDto hivstDto){
        if (hivstDto.getPatientId() == null && hivstDto.getPersonObject() == null){
            throw new IllegalTypeException(HivstDto.class, "HIVST ", "does not contain a patient object.");
        }
    }

    private void validateTestKitUserCategories(List<HivstTestKitUserInfoDto> userInfoDtoList, List<String> testKitUsers){
        int countMyself = 0;
        for (int i = 0; i < userInfoDtoList.size(); i++) {
            HivstTestKitUserInfoDto userInfo = userInfoDtoList.get(i);
            if(!testKitUsers.contains(userInfo.getBasicUserInfo().getUserCategory())){
                throw new IllegalTypeException(HivstDto.class, "HIVST ", "selected test kit user categories unaccounted for.");
            }
        }


    }


    private void validateTestKitsAccountedFor(int numberInUserInfo, int numberOfHivstKitsReceived){
        if (numberInUserInfo > numberOfHivstKitsReceived){
            throw new IllegalTypeException(HivstDto.class, "numberOfHivstKitsReceived: ", "" + numberOfHivstKitsReceived + ".", " Number of test kits unaccounted for." );
        }
    }
//    ****


    private List<Hivst> editHivstForPrimaryAndSecondaryPatients(HivstDto hivstDto) {
            List<Hivst> hivstList = new ArrayList<>();
            List<HivstTestKitUserInfoDto> updatedUserInfo = new ArrayList<>();

            Hivst myselfHivst = processMyselfHivst(hivstDto, updatedUserInfo);

            List<HivstTestKitUserInfoDto> listOfUserInfo = hivstDto.getTestKitUserDetails();
        for (HivstTestKitUserInfoDto userInfo : listOfUserInfo) {
            if (!isMyself(userInfo)) {
                processOtherUsersHivst(hivstDto, userInfo, updatedUserInfo, hivstList);
            }
        }

        if (myselfHivst != null) {
            myselfHivst.setTestKitUserDetails(objectMapper.valueToTree(updatedUserInfo));
            hivstList.add(myselfHivst);
        }

        return hivstList;
    }

    private Hivst processMyselfHivst(HivstDto hivstDto, List<HivstTestKitUserInfoDto> updatedUserInfo) {
        Optional<Hivst> myHivst = hivstRepository.findOneByPatientIdAndDateOfVisit(hivstDto.getPatientId(), hivstDto.getDateOfVisit());
        if (myHivst.isPresent()) {
            return updateExistingMyselfHivst(myHivst.get(), hivstDto, updatedUserInfo);
        } else {
            return createNewMyselfHivst(hivstDto, updatedUserInfo);
        }
    }

    private Hivst updateExistingMyselfHivst(Hivst existingHivst, HivstDto hivstDto, List<HivstTestKitUserInfoDto> updatedUserInfo) {
        Hivst hivst = Hivst.fromDto(hivstDto);
        hivst.setId(existingHivst.getId());
        hivst.setPostTestAssessment(objectMapper.valueToTree(updatedUserInfo.get(0).getPostTestAssessment()));
        hivst.setReferralInformation(objectMapper.valueToTree(updatedUserInfo.get(0).getPostTestAssessment().getReferralInformation()));
        updatedUserInfo.add(updatedUserInfo.get(0));
        return hivst;
    }

    private Hivst createNewMyselfHivst(HivstDto hivstDto, List<HivstTestKitUserInfoDto> updatedUserInfo) {
        Hivst hivst = Hivst.fromDto(hivstDto);
        hivst.setPatientId(getOrCreatePatientId(hivstDto));
        hivst.setPostTestAssessment(objectMapper.valueToTree(updatedUserInfo.get(0).getPostTestAssessment()));
        hivst.setReferralInformation(objectMapper.valueToTree(updatedUserInfo.get(0).getPostTestAssessment().getReferralInformation()));
        updatedUserInfo.add(updatedUserInfo.get(0));
        return hivst;
    }

    private void processOtherUsersHivst(HivstDto hivstDto, HivstTestKitUserInfoDto userInfo, List<HivstTestKitUserInfoDto> updatedUserInfo, List<Hivst> hivstList) {
        if (userInfo.getBasicUserInfo().getPatientId() != null) {
            Optional<Hivst> thisHivst = hivstRepository.findOneByPatientIdAndDateOfVisit(hivstDto.getPatientId(), hivstDto.getDateOfVisit());
            if (thisHivst.isPresent()) {
                Hivst foundHivst = thisHivst.get();
                Hivst hivst = Hivst.fromHivstTestKitUserInfoDtoAndHivstDto(userInfo, hivstDto);
                hivst.setId(foundHivst.getId());
                hivstList.add(hivst);
            } else {
                createPatientAndHivst(hivstDto, updatedUserInfo, hivstList, userInfo);
            }
        } else {
            createPatientAndHivst(hivstDto, updatedUserInfo, hivstList, userInfo);
        }
    }

    private boolean isMyself(HivstTestKitUserInfoDto userInfo) {
        return userInfo.getBasicUserInfo().getUserCategory().equalsIgnoreCase(MYSELF);
    }

}

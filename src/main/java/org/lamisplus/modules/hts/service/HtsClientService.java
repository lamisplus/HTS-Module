package org.lamisplus.modules.hts.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.base.module.ModuleService;
import org.lamisplus.modules.base.util.PaginationUtil;
import org.lamisplus.modules.hts.domain.dto.*;
import org.lamisplus.modules.hts.domain.entity.HtsClient;
import org.lamisplus.modules.hts.domain.entity.IndexElicitation;
import org.lamisplus.modules.hts.domain.entity.RiskStratification;
import org.lamisplus.modules.hts.repository.HtsClientRepository;
import org.lamisplus.modules.hts.repository.IndexElicitationRepository;
import org.lamisplus.modules.hts.util.RandomCodeGenerator;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class HtsClientService {
    private final HtsClientRepository htsClientRepository;
    private final PersonRepository personRepository;
    private final PersonService personService;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final IndexElicitationRepository indexElicitationRepository;
    private final RiskStratificationService riskStratificationService;
    private final ModuleService moduleService;
    public HtsClientDto save(HtsClientRequestDto htsClientRequestDto){
        if(htsClientRequestDto.getRiskStratificationCode() != null){
            if(!htsClientRepository.existsByRiskStratificationCode(htsClientRequestDto.getRiskStratificationCode())){
                throw new IllegalTypeException(HtsClientRequestDto.class, "RiskStratificationCode is ", "already exist for an hts client");
            }
        }
        HtsClient htsClient;
        PersonResponseDto personResponseDto;
        Person person;
        //when it is a new person
        if(htsClientRequestDto.getPersonId() == null){
            if(htsClientRequestDto.getPersonDto() == null) throw new EntityNotFoundException(PersonDto.class, "PersonDTO is ", " empty");
            personResponseDto = personService.createPerson(htsClientRequestDto.getPersonDto());
            person = personRepository.findById(personResponseDto.getId()).get();
            String personUuid = person.getUuid();
            htsClient = this.htsClientRequestDtoToHtsClient(htsClientRequestDto, personUuid);
        } else {
            //already existing person
            person = this.getPerson(htsClientRequestDto.getPersonId());
            htsClient = this.htsClientRequestDtoToHtsClient(htsClientRequestDto, person.getUuid());
        }
        htsClient.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        htsClient = htsClientRepository.save(htsClient);
        htsClient.setPerson(person);
        //LOG.info("Person is - {}", htsClient.getPerson());
        return this.htsClientToHtsClientDto(htsClient);
    }

    public HtsClientDtos getHtsClientById(Long id){
        List<HtsClient> htsClients = new ArrayList<>();
        htsClients.add(this.getById(id));
        return htsClientToHtsClientDtos(null, htsClients);
        /*if(moduleService.exist("HIVModule")){
            if(htsClientRepository.findInHivEnrollmentByUuid(htsClientDtos.per)isPositive=true;
        }*/
    }

    public HtsClientDtos getHtsClientByPersonId(Long personId){
        Person person = personRepository.findById(personId).orElse(new Person());

        return this.htsClientToHtsClientDtos(person, htsClientRepository.findAllByPerson(person));
    }

    public HtsClientDtos getHtsClientByPersonId(Person person){
        return this.htsClientToHtsClientDtos(person, htsClientRepository.findAllByPerson(person));
    }

    private HtsClient getById(Long id){
        return htsClientRepository
                .findByIdAndArchivedAndFacilityId(id, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(()-> new EntityNotFoundException(HtsClient.class, "id", ""+id));
    }

    public HtsClientDto updatePreTestCounseling(Long id, HtsPreTestCounselingDto htsPreTestCounselingDto){
        HtsClient htsClient = this.getById(id);
        if(!this.getPersonId(htsClient).equals(htsPreTestCounselingDto.getPersonId())) throw new IllegalTypeException(Person.class, "Person", "id not match");
        htsClient.setKnowledgeAssessment(htsPreTestCounselingDto.getKnowledgeAssessment());
        htsClient.setRiskAssessment(htsPreTestCounselingDto.getRiskAssessment());
        htsClient.setTbScreening(htsPreTestCounselingDto.getTbScreening());
        htsClient.setStiScreening(htsPreTestCounselingDto.getStiScreening());
        htsClient.setSexPartnerRiskAssessment(htsPreTestCounselingDto.getSexPartnerRiskAssessment());
        HtsClientDto htsClientDto = new HtsClientDto();
        htsClient = htsClientRepository.save(htsClient);
        BeanUtils.copyProperties(htsClient, htsClientDto);
        htsClientDto.setPersonResponseDto(personService.getDtoFromPerson(htsClient.getPerson()));
        if(htsClient.getRiskStratificationCode() != null) {
            RiskStratificationResponseDto riskStratificationResponseDto
                    = riskStratificationService.getByCode(htsClient.getRiskStratificationCode());
            htsClientDto.setRiskStratificationResponseDto(riskStratificationResponseDto);
        }
        return htsClientDto;

    }

    public HtsClientDto updateRequestResult(Long id, HtsRequestResultDto htsRequestResultDto){
        HtsClient htsClient = this.getById(id);
        if(!this.getPersonId(htsClient).equals( htsRequestResultDto.getPersonId())) {
            throw new IllegalTypeException(Person.class, "Person", "id does not match with supplied personId");
        }

        htsClient = this.htsRequestResultDtoToHtsClient(htsClient, htsRequestResultDto);
        HtsClientDto htsClientDto = new HtsClientDto();
        BeanUtils.copyProperties(htsClientRepository.save(htsClient), htsClientDto);
        htsClientDto.setPersonResponseDto(personService.getDtoFromPerson(htsClient.getPerson()));
        if(htsClient.getRiskStratificationCode() != null) {
            RiskStratificationResponseDto riskStratificationResponseDto
                    = riskStratificationService.getByCode(htsClient.getRiskStratificationCode());
            htsClientDto.setRiskStratificationResponseDto(riskStratificationResponseDto);
        }
        return htsClientDto;
    }

    private HtsClientDto setRiskStratificationCode(HtsClient htsClient, HtsClientDto htsClientDto){
        if(htsClient.getRiskStratificationCode() != null) {
            RiskStratificationResponseDto riskStratificationResponseDto
                    = riskStratificationService.getByCode(htsClient.getRiskStratificationCode());
            htsClientDto.setRiskStratificationResponseDto(riskStratificationResponseDto);
        }
        return htsClientDto;
    }

    public HtsClientDto updateRecency(Long id, HtsRecencyDto htsRecencyDto){
        HtsClient htsClient = this.getById(id);
        if(!this.getPersonId(htsClient).equals(htsRecencyDto.getPersonId())) {
            throw new IllegalTypeException(Person.class, "Person", "id does not match with supplied personId");
        }
        htsClient.setRecency(htsRecencyDto.getRecency());

        HtsClientDto htsClientDto = new HtsClientDto();
        BeanUtils.copyProperties(htsClientRepository.save(htsClient), htsClientDto);
        htsClientDto.setPersonResponseDto(personService.getDtoFromPerson(htsClient.getPerson()));
        if(htsClient.getRiskStratificationCode() != null) {
            RiskStratificationResponseDto riskStratificationResponseDto
                    = riskStratificationService.getByCode(htsClient.getRiskStratificationCode());
            htsClientDto.setRiskStratificationResponseDto(riskStratificationResponseDto);
        }
        return htsClientDto;
    }

    private Long getPersonId(HtsClient htsClient){
        return htsClient.getPerson().getId();
    }

    public HtsClient htsRequestResultDtoToHtsClient(HtsClient updatableHtsClient, HtsRequestResultDto htsRequestResultDto){
        updatableHtsClient.setTest1(htsRequestResultDto.getTest1());
        updatableHtsClient.setConfirmatoryTest(htsRequestResultDto.getConfirmatoryTest());
        updatableHtsClient.setTieBreakerTest(htsRequestResultDto.getTieBreakerTest());
        updatableHtsClient.setHivTestResult(htsRequestResultDto.getHivTestResult());

        updatableHtsClient.setTest2(htsRequestResultDto.getTest2());
        updatableHtsClient.setConfirmatoryTest2(htsRequestResultDto.getConfirmatoryTest2());
        updatableHtsClient.setTieBreakerTest2(htsRequestResultDto.getTieBreakerTest2());
        updatableHtsClient.setHivTestResult2(htsRequestResultDto.getHivTestResult2());

        updatableHtsClient.setSyphilisTesting(htsRequestResultDto.getSyphilisTesting());
        updatableHtsClient.setHepatitisTesting(htsRequestResultDto.getHepatitisTesting());
        updatableHtsClient.setOthers(htsRequestResultDto.getOthers());
        updatableHtsClient.setCd4(htsRequestResultDto.getCd4());


        return updatableHtsClient;
    }

    public HtsClient htsClientRequestDtoToHtsClient(HtsClientRequestDto htsClientRequestDto, @NotNull String personUuid) {
        if ( htsClientRequestDto == null ) {
            return null;
        }
        HtsClient htsClient = new HtsClient();
        htsClient.setTargetGroup( htsClientRequestDto.getTargetGroup() );
        htsClient.setClientCode( htsClientRequestDto.getClientCode() );
        htsClient.setDateVisit( htsClientRequestDto.getDateVisit() );
        htsClient.setReferredFrom( htsClientRequestDto.getReferredFrom() );
        htsClient.setTestingSetting( htsClientRequestDto.getTestingSetting() );
        htsClient.setFirstTimeVisit( htsClientRequestDto.getFirstTimeVisit() );
        htsClient.setNumChildren( htsClientRequestDto.getNumChildren() );
        htsClient.setNumWives( htsClientRequestDto.getNumWives() );
        htsClient.setTypeCounseling( htsClientRequestDto.getTypeCounseling() );
        htsClient.setIndexClient( htsClientRequestDto.getIndexClient() );
        htsClient.setPreviouslyTested( htsClientRequestDto.getPreviouslyTested() );
        htsClient.setExtra( htsClientRequestDto.getExtra() );
        htsClient.setPersonUuid( personUuid);
        htsClient.setPregnant(htsClientRequestDto.getPregnant());
        htsClient.setBreastFeeding(htsClientRequestDto.getBreastFeeding());
        htsClient.setRiskStratificationCode(htsClientRequestDto.getRiskStratificationCode());
        htsClient.setRelationWithIndexClient(htsClientRequestDto.getRelationWithIndexClient());

        return htsClient;
    }

    public Person getPerson(Long personId) {
        return personRepository.findById (personId)
                .orElseThrow (() -> new EntityNotFoundException (Person.class, "id", String.valueOf (personId)));
    }

    private HtsClient htsClientRequestDtoToHtsClient(HtsClientRequestDto htsClientRequestDto) {
        if ( htsClientRequestDto == null ) {
            return null;
        }

        HtsClient htsClient = new HtsClient();

        htsClient.setTargetGroup( htsClientRequestDto.getTargetGroup() );
        htsClient.setClientCode( htsClientRequestDto.getClientCode() );
        htsClient.setDateVisit( htsClientRequestDto.getDateVisit() );
        htsClient.setReferredFrom( htsClientRequestDto.getReferredFrom() );
        htsClient.setTestingSetting( htsClientRequestDto.getTestingSetting() );
        htsClient.setFirstTimeVisit( htsClientRequestDto.getFirstTimeVisit() );
        htsClient.setNumChildren( htsClientRequestDto.getNumChildren() );
        htsClient.setNumWives( htsClientRequestDto.getNumWives() );
        htsClient.setTypeCounseling( htsClientRequestDto.getTypeCounseling() );
        htsClient.setIndexClient( htsClientRequestDto.getIndexClient() );
        htsClient.setRiskStratificationCode( htsClientRequestDto.getRiskStratificationCode() );
        htsClient.setPreviouslyTested( htsClientRequestDto.getPreviouslyTested() );
        htsClient.setExtra( htsClientRequestDto.getExtra() );
        htsClient.setPregnant( htsClientRequestDto.getPregnant() );
        htsClient.setBreastFeeding( htsClientRequestDto.getBreastFeeding() );
        htsClient.setRelationWithIndexClient( htsClientRequestDto.getRelationWithIndexClient() );

        return htsClient;
    }

    public HtsClientDtos getAllHtsClientDtos(Page<HtsClient> page, List<HtsClient> clients){
        if(page != null && !page.isEmpty()){
            return htsClientToHtsClientDtos(null, page.stream().collect(Collectors.toList()));
        } else if(clients != null && !clients.isEmpty()){
            return htsClientToHtsClientDtos(null, clients);
        }
        return null;
    }


    public PageDTO getAllHtsClientDTOSByPerson(Page<Person> page){

        List<HtsClientDtos> htsClientDtosList =  page.stream()
                .map(person -> getHtsClientByPersonId(person))
                //.filter(htsClientDtos ->htsClientDtos.getClientCode() != null)
                .collect(Collectors.toList());
        return PaginationUtil.generatePagination(page, htsClientDtosList);
    }


    private HtsClientDtos htsClientToHtsClientDtos(Person person, List<HtsClient> clients){
        final Long[] pId = {null};
        final String[] clientCode = {null};
        final String[] personUuid = {null};
        final PersonResponseDto[] personResponseDto = {new PersonResponseDto()};
        boolean isPositive = false;

        if(person!= null && person.getUuid() != null){
            pId[0] =person.getId();
            personResponseDto[0] = personService.getDtoFromPerson(person);
            personUuid[0]  = person.getUuid();
        }

        HtsClientDtos htsClientDtos = new HtsClientDtos();
        List<HtsClientDto> htsClientDtoList = new ArrayList<>();
        htsClientDtoList =  clients
                .stream()
                .map(htsClient1 -> {
                    if(pId[0] == null) {
                        Person person1 = htsClient1.getPerson();
                        pId[0] = person.getId();
                        personResponseDto[0] = personService.getDtoFromPerson(person1);
                        personUuid[0]  = person.getUuid();
                    }
                    if(clientCode[0] == null){clientCode[0] = htsClient1.getClientCode();}
                    return this.htsClientToHtsClientDto(htsClient1);})
                .collect(Collectors.toList());
        htsClientDtos.setHtsCount(htsClientDtoList.size());
        htsClientDtos.setHtsClientDtoList(htsClientDtoList);
        htsClientDtos.setPersonId(pId[0]);
        htsClientDtos.setClientCode(clientCode[0]);
        htsClientDtos.setPersonResponseDto(personResponseDto[0]);
        htsClientDtos.setHivPositive(isPositive);
        return htsClientDtos;
    }

    private HtsClientDto htsClientToHtsClientDto(HtsClient htsClient) {
        if ( htsClient == null ) {
            return null;
        }

        HtsClientDto htsClientDto = new HtsClientDto();

        htsClientDto.setId( htsClient.getId() );
        htsClientDto.setTargetGroup( htsClient.getTargetGroup() );
        htsClientDto.setClientCode( htsClient.getClientCode() );
        htsClientDto.setDateVisit( htsClient.getDateVisit() );
        htsClientDto.setReferredFrom( htsClient.getReferredFrom() );
        htsClientDto.setTestingSetting( htsClient.getTestingSetting() );
        htsClientDto.setFirstTimeVisit( htsClient.getFirstTimeVisit() );
        htsClientDto.setNumChildren( htsClient.getNumChildren() );
        htsClientDto.setNumWives( htsClient.getNumWives() );
        htsClientDto.setTypeCounseling( htsClient.getTypeCounseling() );
        htsClientDto.setIndexClient( htsClient.getIndexClient() );
        htsClientDto.setPreviouslyTested( htsClient.getPreviouslyTested() );
        PersonResponseDto personResponseDto = personService.getDtoFromPerson(htsClient.getPerson());
        htsClientDto.setPersonResponseDto(personResponseDto);
        htsClientDto.setExtra( htsClient.getExtra() );
        htsClientDto.setPregnant( htsClient.getPregnant() );
        htsClientDto.setBreastFeeding( htsClient.getBreastFeeding() );
        htsClientDto.setRelationWithIndexClient( htsClient.getRelationWithIndexClient() );
        htsClientDto.setCapturedBy( htsClient.getCapturedBy() );
        htsClientDto.setRecency( htsClient.getRecency());
        htsClientDto.setKnowledgeAssessment( htsClient.getKnowledgeAssessment() );
        htsClientDto.setRiskAssessment( htsClient.getRiskAssessment() );
        htsClientDto.setTbScreening( htsClient.getTbScreening() );
        htsClientDto.setStiScreening( htsClient.getStiScreening() );
        htsClientDto.setTest1( htsClient.getTest1() );
        htsClientDto.setConfirmatoryTest( htsClient.getConfirmatoryTest() );
        htsClientDto.setTieBreakerTest( htsClient.getTieBreakerTest() );
        htsClientDto.setHivTestResult( htsClient.getHivTestResult() );

        htsClientDto.setTest2( htsClient.getTest2() );
        htsClientDto.setConfirmatoryTest2( htsClient.getConfirmatoryTest2() );
        htsClientDto.setTieBreakerTest2( htsClient.getTieBreakerTest2() );
        htsClientDto.setHivTestResult2( htsClient.getHivTestResult2() );

        htsClientDto.setPersonId(personResponseDto.getId());
        htsClientDto.setPostTestCounselingKnowledgeAssessment(htsClient.getPostTestCounselingKnowledgeAssessment());
        htsClientDto.setRecency(htsClient.getRecency());
        htsClientDto.setSyphilisTesting(htsClient.getSyphilisTesting());
        htsClientDto.setCd4(htsClient.getCd4());
        htsClientDto.setSexPartnerRiskAssessment(htsClient.getSexPartnerRiskAssessment());
        htsClientDto.setOthers(htsClient.getOthers());
        htsClientDto.setHepatitisTesting(htsClient.getHepatitisTesting());
        htsClientDto.setRiskStratificationCode(htsClient.getRiskStratificationCode());
        htsClientDto.setIndexNotificationServicesElicitation(htsClient.getIndexNotificationServicesElicitation());

        if(htsClient.getRiskStratificationCode() != null) {
            RiskStratificationResponseDto riskStratificationResponseDto
                    = riskStratificationService.getByCode(htsClient.getRiskStratificationCode());
            htsClientDto.setRiskStratificationResponseDto(riskStratificationResponseDto);
        }

        return htsClientDto;
    }

    public Page<HtsClient> findHtsClientPage(Pageable pageable) {
        Page<Person> personPage = personRepository.findAll(pageable);
        return htsClientRepository.findAll(pageable);
    }

    public Page<Person> findHtsClientPersonPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        if(!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")){
            String queryParam = "%"+searchValue+"%";
            return personRepository
                    .findAllPersonBySearchParameters(queryParam, UN_ARCHIVED, facilityId,  pageable);
        }
        return personRepository
                .getAllByArchivedAndFacilityIdOrderByIdDesc(UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization(),pageable);
    }

    public HtsClientDtos getAllHtsClientDtos(Page<HtsClient> page) {
        return getAllHtsClientDtos(page, null);
    }

    public List<HtsClientDtos> getAllPatients(){
        List<HtsClientDtos> htsClientDtosList = new ArrayList<>();
        for(PersonResponseDto personResponseDto :personService.getAllPerson()){
            Person person = this.getPerson(personResponseDto.getId());
            List<HtsClient> clients = htsClientRepository.findAllByPersonOrderByIdDesc(person);
            HtsClientDtos htsClientDtos = new HtsClientDtos();
            if(clients.isEmpty()){
                htsClientDtos.setHtsClientDtoList(new ArrayList<>());
                htsClientDtos.setHtsCount(0);
                htsClientDtos.setPersonResponseDto(personResponseDto);
                htsClientDtos.setPersonId(personResponseDto.getId());
                htsClientDtosList.add(htsClientDtos);
                //LOG.info("hts client is {}", htsClientDtos.getHtsCount());
            } else {
                htsClientDtosList.add(htsClientToHtsClientDtos(null, clients));
                //LOG.info("hts client is {}", clients.size());
            }

        }

        return htsClientDtosList;
    }

    public HtsClientDto updatePostTestCounselingKnowledgeAssessment(Long id, PostTestCounselingDto postTestCounselingDto){
        HtsClient htsClient = this.getById(id);
        //if(htsClient.getPerson().getId().equals(postTestCounselingDto.getPersonId())) throw new IllegalTypeException(Person.class, "Person", "id not match");
        htsClient.setPostTestCounselingKnowledgeAssessment(postTestCounselingDto.getPostTestCounselingKnowledgeAssessment());

        HtsClientDto htsClientDto = new HtsClientDto();
        BeanUtils.copyProperties(htsClientRepository.save(htsClient), htsClientDto);
        htsClientDto.setPersonResponseDto(personService.getDtoFromPerson(htsClient.getPerson()));
        if(htsClient.getRiskStratificationCode() != null) {
            RiskStratificationResponseDto riskStratificationResponseDto
                    = riskStratificationService.getByCode(htsClient.getRiskStratificationCode());
            htsClientDto.setRiskStratificationResponseDto(riskStratificationResponseDto);
        }
        return htsClientDto;
    }

    public HtsClientDto updateIndexNotificationServicesElicitation(Long id, IndexElicitationDto indexElicitationDto){
        /*HtsClient htsClient = this.getById(id);
        if(!this.getPersonId(htsClient).equals(indexElicitationDto.getPersonId())) {
            throw new IllegalTypeException(Person.class, "Person", "id does not match with supplied personId");
        }
        htsClient.setIndexNotificationServicesElicitation(indexElicitationDto
                        .getIndexNotificationServicesElicitation());

        HtsClientDto htsClientDto = new HtsClientDto();
        BeanUtils.copyProperties(htsClientRepository.save(htsClient), htsClientDto);*/
        return null;
    }

    public String getGenerateHtsClientCode(){
        Optional<Long> number = htsClientRepository.maxId();
        String random = RandomCodeGenerator.randomString(10, true, true);
        if(number.isPresent()){
            return number.get() + random;
        }
        return 1 + random;
    }

    public void delete(Long id) {
        HtsClient htsClient = this.getById(id);

        List<IndexElicitation> elicitation = htsClient.getIndexElicitation()
                .stream()
                .map(indexElicitation -> {
                    indexElicitation.setArchived(ARCHIVED);
                    return indexElicitation;})
                .collect(Collectors.toList());

        if(elicitation != null && !elicitation.isEmpty()) indexElicitationRepository.saveAll(elicitation);
        htsClient.setArchived(ARCHIVED);
        htsClientRepository.save(htsClient);
    }

    public HtsClientDto update(Long id, HtsClientUpdateRequestDto htsClientUpdateRequestDto) {
        if(!id.equals(htsClientUpdateRequestDto.getId())){
            throw new IllegalTypeException(Person.class, "Id", "id does not match");
        }
        if(!this.getById(htsClientUpdateRequestDto.getId()).getPerson().getId().equals(htsClientUpdateRequestDto.getPersonId())){
            throw new IllegalTypeException(Person.class, "Person", "id does not match with supplied personId");
        }
        Person person = this.getPerson(htsClientUpdateRequestDto.getPersonId());
        HtsClient htsClient = this.htsClientUpdateRequestDtoToHtsClient(htsClientUpdateRequestDto, person.getUuid());

        htsClient.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        htsClient = htsClientRepository.save(htsClient);
        htsClient.setPerson(person);
        return this.htsClientToHtsClientDto(htsClient);
    }

    public HtsClient htsClientUpdateRequestDtoToHtsClient(HtsClientUpdateRequestDto htsClientUpdateRequestDto, @NotNull String personUuid) {
        if ( htsClientUpdateRequestDto == null ) {
            return null;
        }

        HtsClient htsClient = new HtsClient();
        htsClient.setTargetGroup( htsClientUpdateRequestDto.getTargetGroup() );
        htsClient.setClientCode( htsClientUpdateRequestDto.getClientCode() );
        htsClient.setDateVisit( htsClientUpdateRequestDto.getDateVisit() );
        htsClient.setReferredFrom( htsClientUpdateRequestDto.getReferredFrom() );
        htsClient.setTestingSetting( htsClientUpdateRequestDto.getTestingSetting() );
        htsClient.setFirstTimeVisit( htsClientUpdateRequestDto.getFirstTimeVisit() );
        htsClient.setNumChildren( htsClientUpdateRequestDto.getNumChildren() );
        htsClient.setNumWives( htsClientUpdateRequestDto.getNumWives() );
        htsClient.setTypeCounseling( htsClientUpdateRequestDto.getTypeCounseling() );
        htsClient.setIndexClient( htsClientUpdateRequestDto.getIndexClient() );
        htsClient.setPreviouslyTested( htsClientUpdateRequestDto.getPreviouslyTested() );
        htsClient.setExtra( htsClientUpdateRequestDto.getExtra() );
        htsClient.setPersonUuid( personUuid);
        htsClient.setRiskStratificationCode( htsClientUpdateRequestDto.getRiskStratificationCode());
        htsClient.setPregnant(htsClientUpdateRequestDto.getPregnant());
        htsClient.setBreastFeeding(htsClientUpdateRequestDto.getBreastFeeding());
        htsClient.setRelationWithIndexClient(htsClientUpdateRequestDto.getRelationWithIndexClient());

        return htsClient;
    }

    public String getClientNameByCode(String code) {
        List<HtsClient> htsClients = htsClientRepository.findAllByClientCode(code);
        String name = "Record Not Found";

        if(moduleService.exist("PatientModule")){
            Optional<String> firstName = htsClientRepository.findInPatientByHospitalNumber(code);
            if(firstName.isPresent()){
                return firstName.get();
            }
        }
        if(!htsClients.isEmpty() && name.equals("Record Not Found")){
            Person person = htsClients.stream().findFirst().get().getPerson();
            return person.getFirstName() + " " + person.getSurname();
        }
        return name;
    }

    public HtsClientDtos getRiskStratificationHtsClients(Long personId) {
        HtsClientDtos htsClientDtos = this.getHtsClientByPersonId(personId);
        htsClientDtos.setRiskStratificationResponseDtos(riskStratificationService.getAllByPersonId(personId));
        return htsClientDtos;
    }
}

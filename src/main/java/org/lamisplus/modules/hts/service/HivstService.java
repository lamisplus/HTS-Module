package org.lamisplus.modules.hts.service;

import org.lamisplus.modules.hts.domain.dto.HivstDto;
import org.lamisplus.modules.hts.domain.entity.HivstPerson;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface HivstService {
    List<HivstDto> saveHivst(HivstDto hivstDto);


    String deleteHivst(Long id);

    HivstDto getHivstById(Long id);

    List<HivstDto> getAllHivstByPatientId(Long patientId);

    Page<HivstPerson> getAllHivstPerson(String searchValue, int pageNo, int pageSize);

   List<HivstDto> updateHivst(HivstDto hivstDto, Long id);
}

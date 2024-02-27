//package org.lamisplus.modules.hts.controller.impl;
//
//import org.hamcrest.Matchers;
//import org.hamcrest.core.Is;
//import org.junit.Before;
//import org.junit.Test;
//import org.junit.runner.RunWith;
//import org.lamisplus.modules.hts.controller.impl.CustomUtils;
//import org.lamisplus.modules.hts.controller.impl.RiskStratificationControllerImpl;
//import org.lamisplus.modules.hts.domain.entity.RiskStratification;
//import org.lamisplus.modules.hts.domain.mapper.ReferenceMapper;
//import org.lamisplus.modules.hts.domain.mapper.RiskStratificationMapper;
//import org.lamisplus.modules.hts.service.RiskStratificationService;
//import org.mockito.ArgumentMatchers;
//import org.mockito.InjectMocks;
//import org.mockito.Mockito;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.http.MediaType;
//import org.springframework.test.context.junit4.SpringRunner;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
//import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
//import org.springframework.test.web.servlet.setup.MockMvcBuilders;
//
//@SpringBootTest
//@AutoConfigureMockMvc
//@RunWith(SpringRunner.class)
//public class RiskStratificationControllerImplTest {
//    //TODO: create the data Test generator class RiskStratificationBuilder
//    private static final String ENDPOINT_URL = "/risk-stratifications";
//    @MockBean
//    private ReferenceMapper referenceMapper;
//    @InjectMocks
//    private RiskStratificationControllerImpl riskstratificationController;
//    @MockBean
//    private RiskStratificationService riskstratificationService;
//    @MockBean
//    private RiskStratificationMapper riskstratificationMapper;
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Before
//    public void setup() {
//        this.mockMvc = MockMvcBuilders.standaloneSetup(this.riskstratificationController).build();
//    }
//
//    @Test
//    public void getAll() throws Exception {
//        Mockito.when(riskstratificationMapper.asDTOList(ArgumentMatchers.any())).thenReturn(RiskStratificationBuilder.getListDTO());
//
//        Mockito.when(riskstratificationService.findAll()).thenReturn(RiskStratificationBuilder.getListEntities());
//        mockMvc.perform(MockMvcRequestBuilders.get(ENDPOINT_URL))
//                .andExpect(MockMvcResultMatchers.status().isOk())
//                .andExpect(MockMvcResultMatchers.content()
//                        .contentType(MediaType.APPLICATION_JSON_UTF8))
//                .andExpect(MockMvcResultMatchers.jsonPath("$", Matchers.hasSize(2)));
//
//    }
//
//    @Test
//    public void getById() throws Exception {
//        Mockito.when(riskstratificationMapper.asDTO(ArgumentMatchers.any())).thenReturn(RiskStratificationBuilder.getDTO());
//
//        Mockito.when(riskstratificationService.findById(ArgumentMatchers.anyLong())).thenReturn(java.util.Optional.of(RiskStratificationBuilder.getEntity()));
//
//        mockMvc.perform(MockMvcRequestBuilders.get(ENDPOINT_URL + "/1"))
//                .andExpect(MockMvcResultMatchers.status().isOk())
//                .andExpect(MockMvcResultMatchers.content()
//                        .contentType(MediaType.APPLICATION_JSON_UTF8))
//                .andExpect(MockMvcResultMatchers.jsonPath("$.id", Is.is(1)));
//        Mockito.verify(riskstratificationService, Mockito.times(1)).findById(1L);
//        Mockito.verifyNoMoreInteractions(riskstratificationService);
//    }
//
//    @Test
//    public void save() throws Exception {
//        Mockito.when(riskstratificationMapper.asEntity(ArgumentMatchers.any())).thenReturn(RiskStratificationBuilder.getEntity());
//        Mockito.when(riskstratificationService.save(ArgumentMatchers.any(RiskStratification.class))).thenReturn(RiskStratificationBuilder.getEntity());
//
//        mockMvc.perform(
//                        MockMvcRequestBuilders.post(ENDPOINT_URL)
//                                .contentType(MediaType.APPLICATION_JSON_UTF8)
//                                .content(CustomUtils.asJsonString(RiskStratificationBuilder.getDTO())))
//                .andExpect(MockMvcResultMatchers.status().isCreated());
//        Mockito.verify(riskstratificationService, Mockito.times(1)).save(ArgumentMatchers.any(RiskStratification.class));
//        Mockito.verifyNoMoreInteractions(riskstratificationService);
//    }
//
//    @Test
//    public void update() throws Exception {
//        Mockito.when(riskstratificationMapper.asEntity(ArgumentMatchers.any())).thenReturn(RiskStratificationBuilder.getEntity());
//        Mockito.when(riskstratificationService.update(ArgumentMatchers.any(), ArgumentMatchers.anyLong())).thenReturn(RiskStratificationBuilder.getEntity());
//
//        mockMvc.perform(
//                        MockMvcRequestBuilders.put(ENDPOINT_URL + "/1")
//                                .contentType(MediaType.APPLICATION_JSON_UTF8)
//                                .content(CustomUtils.asJsonString(RiskStratificationBuilder.getDTO())))
//                .andExpect(MockMvcResultMatchers.status().isOk());
//        Mockito.verify(riskstratificationService, Mockito.times(1)).update(ArgumentMatchers.any(RiskStratification.class), ArgumentMatchers.anyLong());
//        Mockito.verifyNoMoreInteractions(riskstratificationService);
//    }
//
//    @Test
//    public void delete() throws Exception {
//        Mockito.doNothing().when(riskstratificationService).deleteById(ArgumentMatchers.anyLong());
//        mockMvc.perform(
//                        MockMvcRequestBuilders.delete(ENDPOINT_URL + "/1"))
//                .andExpect(MockMvcResultMatchers.status().isOk());
//        Mockito.verify(riskstratificationService, Mockito.times(1)).deleteById(Mockito.anyLong());
//        Mockito.verifyNoMoreInteractions(riskstratificationService);
//    }
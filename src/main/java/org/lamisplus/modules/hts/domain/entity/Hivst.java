package org.lamisplus.modules.hts.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.array.StringArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeStringType;
import com.vladmihalcea.hibernate.type.json.JsonStringType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import org.hibernate.annotations.Where;
import org.lamisplus.modules.hts.domain.dto.HivstDto;
import org.lamisplus.modules.hts.domain.dto.HivstTestKitUserInfoDto;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Arrays;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Table(name = "hivst")
@Where(clause = "archived = 0")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class Hivst extends Audit<Hivst>  implements Serializable {
    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="patient_id")
    private Long patientId;

    @Column(name="date_of_visit")
    private LocalDate dateOfVisit;

    @Column(name="service_delivery_point")
    private String serviceDeliveryPoint;

    @Column(name="user_type")
    private String userType;

    @Column(name="serial_number")
    private String serialNumber;

    @Column(name="client_code", nullable = false)
    private String clientCode;

    @Column(name="previously_tested_within_12_months")
    private String previouslyTestedWithin12Months;

    @Column(name="result_of_previously_tested_within_12_months")
    private String resultOfPreviouslyTestedWithin12Months;

    @Column(name="consent_for_follow_up_calls")
    private String consentForFollowUpCalls;

    @Column(name="type_of_hivst_kit_received")
    private String typeOfHivstKitReceived;

    @Column(name="number_of_hivst_kits_received")
    private int numberOfHivstKitsReceived;

    @Column(name="name_of_test_kit")
    private String nameOfTestKit;

    @Column(name="lot_number")
    private String lotNumber;

    @Column(name="expiry_date")
    private LocalDate expiryDate;

    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb", name = "test_kit_users")
    private JsonNode testKitUsers;

    @Column(name="other_test_kit_user_info_available")
    private String otherTestKitUserInfoAvailable;

    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb", name = "other_test_kit_user_details")
    private JsonNode testKitUserDetails;

    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb", name = "part_b")
    private JsonNode postTestAssessment;

    @Type(type = "jsonb-node")
    @Column(columnDefinition = "jsonb", name = "referral_information")
    private JsonNode referralInformation;

    @Column(name = "archived")
    private Integer archived=0;

    public static Hivst fromDto(HivstDto hivstDto) {
        ObjectMapper objectMapper = new ObjectMapper();
        return Hivst.builder()
                .id(hivstDto.getId())
                .patientId(hivstDto.getPatientId())
                .dateOfVisit(hivstDto.getDateOfVisit())
                .serviceDeliveryPoint(hivstDto.getServiceDeliveryPoint())
                .userType(hivstDto.getUserType())
                .serialNumber(hivstDto.getSerialNumber())
                .clientCode(hivstDto.getClientCode())
                .previouslyTestedWithin12Months(hivstDto.getPreviouslyTestedWithin12Months())
                .resultOfPreviouslyTestedWithin12Months(hivstDto.getResultOfPreviouslyTestedWithin12Months())
                .consentForFollowUpCalls(hivstDto.getConsentForFollowUpCalls())
                .typeOfHivstKitReceived(hivstDto.getTypeOfHivstKitReceived())
                .numberOfHivstKitsReceived(hivstDto.getNumberOfHivstKitsReceived())
                .nameOfTestKit(hivstDto.getNameOfTestKit())
                .lotNumber(hivstDto.getLotNumber())
                .testKitUsers(objectMapper.valueToTree(hivstDto.getTestKitUsers()))
                .otherTestKitUserInfoAvailable(hivstDto.getOtherTestKitUserInfoAvailable())
                .testKitUserDetails(objectMapper.valueToTree(hivstDto.getTestKitUserDetails()))
                .postTestAssessment(objectMapper.valueToTree(hivstDto.getPostTestAssessment()))
                .referralInformation(objectMapper.valueToTree(hivstDto.getReferralInformation()))
                .build();
    }

    public static Hivst fromHivstTestKitUserInfoDtoAndHivstDto(HivstTestKitUserInfoDto hivstTestKitUserInfoDto, HivstDto hivstDto) {
        ObjectMapper objectMapper = new ObjectMapper();
        return Hivst.builder()
                .patientId(hivstDto.getPatientId())
                .dateOfVisit(hivstDto.getDateOfVisit())
                .serviceDeliveryPoint(hivstDto.getServiceDeliveryPoint())
                .userType(hivstDto.getUserType())
//                .serialNumber(hivstTestKitUserInfoDto.getSerialNumber())
                .clientCode(hivstTestKitUserInfoDto.getBasicUserInfo().getClientCode())
                .previouslyTestedWithin12Months("No")
                .resultOfPreviouslyTestedWithin12Months(null)
                .consentForFollowUpCalls(hivstDto.getConsentForFollowUpCalls())
                .typeOfHivstKitReceived(hivstDto.getTypeOfHivstKitReceived())
                .numberOfHivstKitsReceived(1)
                .nameOfTestKit(hivstDto.getNameOfTestKit())
                .lotNumber(hivstDto.getLotNumber())
                .testKitUsers(objectMapper.valueToTree(Arrays.asList(hivstTestKitUserInfoDto.getBasicUserInfo().getUserCategory())))
                .otherTestKitUserInfoAvailable("Yes")
                .testKitUserDetails(objectMapper.valueToTree(Arrays.asList(hivstTestKitUserInfoDto)))
                .postTestAssessment(objectMapper.valueToTree(hivstTestKitUserInfoDto.getPostTestAssessment()))
                .referralInformation(objectMapper.valueToTree(hivstTestKitUserInfoDto.getPostTestAssessment().getReferralInformation()))
                .build();
    }

    @PrePersist
    public void prePersist(){
        this.archived = 0;
    }

}

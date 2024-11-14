export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMxNjEwNTU0fQ.wwCgAkYVRpOSLaCH0dN3gBvV0G8rANidd3IQ6Oa_1tlGvm7KuYeZYmbjSFyZN_IgGmOAez0a7Guj1k5oZDHIRg"
    : new URLSearchParams(window.location.search).get("jwt");

let props = {
  completed: [],
  patientObj: {
    breastFeeding: "",
    capturedBy: "",
    riskStratificationCode: "",
    cd4: {},
    clientCode: "",
    confirmatoryTest: {},
    dateVisit: "2024-11-01",
    extra: {},
    firstTimeVisit: "",
    hepatitisTesting: {},
    hivTestResult: "",
    id: "",
    indexClient: "",
    indexClientCode: "",
    indexElicitation: [
      {
        address: "",
        altPhoneNumber: "",
        archived: 0,
        currentlyLiveWithPartner: true,
        datePartnerCameForTesting: "",
        dob: "",
        extra: {},
        facilityId: 0,
        firstName: "",
        hangOutSpots: "",
        htsClient: {
          archived: 0,
          breastFeeding: 0,
          capturedBy: "",
          cd4: {},
          clientCode: "",
          confirmatoryTest: {},
          dateVisit: "",
          extra: {},
          facilityId: 0,
          firstTimeVisit: true,
          hepatitisTesting: {},
          hivTestResult: "",
          id: 0,
          indexClient: true,
          indexClientCode: "",
          indexNotificationServicesElicitation: {},
          knowledgeAssessment: {},
          numChildren: 0,
          numWives: 0,
          others: {},
          person: {
            active: "",
            address: {},
            archived: 0,
            contact: {},
            contactPoint: {},
            createdDate: "",
            dateOfBirth: "",
            dateOfRegistration: "",
            deceased: true,
            deceasedDateTime: "",
            education: {},
            employmentStatus: {},
            emrId: "",
            facilityId: 0,
            firstName: "string",
            gender: {},
            hospitalNumber: "",
            id: "",
            identifier: {},
            isDateOfBirthEstimated: true,
            lastModifiedDate: "",
            maritalStatus: {},
            new: true,
            ninNumber: "",
            organization: {},
            otherName: "",
            sex: "",
            surname: "",
            uuid: "",
          },
          personUuid: "",
          postTestCounselingKnowledgeAssessment: {},
          pregnant: "",
          previouslyTested: true,
          recency: {},
          referredFrom: "",
          relationWithIndexClient: "",
          riskAssessment: {},
          sexPartnerRiskAssessment: {},
          stiScreening: {},
          syphilisTesting: {},
          targetGroup: 0,
          tbScreening: {},
          test1: {},
          testingSetting: "",
          tieBreakerTest: {},
          typeCounseling: "",
          uuid: "",
        },
        htsClientUuid: "",
        id: "",
        isDateOfBirthEstimated: true,
        lastName: "",
        middleName: "",
        notificationMethod: "",
        partnerTestedPositive: "",
        phoneNumber: "",
        physicalHurt: "",
        relationshipToIndexClient: "",
        sex: "",
        sexuallyUncomfortable: "",
        threatenToHurt: "",
        uuid: "",
      },
    ],
    indexNotificationServicesElicitation: {},
    knowledgeAssessment: {},
    numChildren: "",
    numWives: "",
    others: {},
    personId: "",
    personResponseDto: {
      active: true,
      address: {
        address: [
          {
            city: "",
            line: [""],
            stateId: "",
            district: "",
            countryId: 1,
            postalCode: "",
            organisationUnitId: 0,
          },
        ],
      },
      biometricStatus: true,
      checkInDate: "",
      contact: {},
      contactPoint: {
        contactPoint: [
          {
            type: "phone",
            value: "",
          },
        ],
      },
      dateOfBirth: "1980-12-29",
      dateOfRegistration: "",
      deceased: true,
      deceasedDateTime: "",
      education: {},
      employmentStatus: {},
      emrId: "",
      encounterDate: "",
      facilityId: "",
      firstName: "",
      gender: {},
      id: "",
      identifier: {},
      isDateOfBirthEstimated: "",
      maritalStatus: {},
      ninNumber: "",
      organization: {},
      otherName: "",
      sex: "",
      surname: "",
      visitId: "",
      dob: "1980-12-29",
    },
    postTestCounselingKnowledgeAssessment: {},
    pregnant: "",
    previouslyTested: "",
    recency: {},
    referredFrom: "",
    relationWithIndexClient: "",
    riskAssessment: {},
    sexPartnerRiskAssessment: {},
    stiScreening: {},
    syphilisTesting: {},
    targetGroup: "TARGET_GROUP_CHILDREN_OF_KP",
    tbScreening: {},
    test1: {},
    testingSetting: "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX",
    tieBreakerTest: {},
    typeCounseling: "",
    riskStratificationResponseDto: {
      id: 21545,
      age: 44,
      entryPoint: "HTS_ENTRY_POINT_COMMUNITY",
      testingSetting: "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX",
      modality: "",
      spokeFacility: "",
      healthFacility: "PHC SANWA",
      targetGroup: "TARGET_GROUP_CHILDREN_OF_KP",
      dob: "1980-12-29",
      code: "bbdd4732-5c1d-4fee-82cb-f73355252c85",
      visitDate: "2024-11-01",
      personId: 0,
      communityEntryPoint: "",
      riskAssessment: {
        lastHivTestForceToHaveSex: "",
        lastHivTestHadAnal: "",
        lastHivTestInjectedDrugs: "",
        whatWasTheResult: "",
        lastHivTestDone: "",
        diagnosedWithTb: "",
        lastHivTestPainfulUrination: "",
        lastHivTestBloodTransfusion: "",
        lastHivTestVaginalOral: "",
        lastHivTestBasedOnRequest: "true",
      },
      source: null,
      longitude: null,
      latitude: null,
    },
    modality: "",
  },
  extra: {
    age: 44,
    dob: "1980-12-29",
    code: "bbdd4732-5c1d-4fee-82cb-f73355252c85",
    visitDate: "2024-11-01",
    dateOfBirth: null,
    dateOfRegistration: null,
    isDateOfBirthEstimated: "",
    targetGroup: "TARGET_GROUP_CHILDREN_OF_KP",
    testingSetting: "COMMUNITY_HTS_TEST_SETTING_TBA_ORTHODOX",
    modality: "",
    careProvider: "",
    personId: "",
    id: "",
    riskAssessment: {
      lastHivTestForceToHaveSex: "",
      lastHivTestHadAnal: "",
      lastHivTestInjectedDrugs: "",
      whatWasTheResult: "",
      lastHivTestDone: "",
      diagnosedWithTb: "",
      lastHivTestPainfulUrination: "",
      lastHivTestBloodTransfusion: "",
      lastHivTestVaginalOral: "",
      lastHivTestBasedOnRequest: "true",
    },
    entryPoint: "HTS_ENTRY_POINT_COMMUNITY",
    communityEntryPoint: "",
    spokeFacility: "",
    healthFacility: "PHC SANWA",
  },
  indexInfo: {
    uuid: "",
    type: "",
    clientCode: "",
  },
};






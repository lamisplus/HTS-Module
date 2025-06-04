import { token, url as baseUrl } from "../api";
import axios from "axios";
import Cookies from "js-cookie";
//To make a text field accept alphabet value only


export const alphabetOnly = (value) => {
  const result = value.replace(/[^a-z]/gi, "");
  return result;
};

//*********************** REUSABLE API *****************8*/

// Get all genders
export const getAllGenders = async () => {
  try {
    const response = await axios.get(`${baseUrl}application-codesets/v2/SEX`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (e) {}
};

//Get all country
export const getAllCountry = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}organisation-units/parent-organisation-units/0`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (e) {}
};

//Get all state by state by country Id
export const getAllStateByCountryId = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}organisation-units/parent-organisation-units/1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (e) {}
};

//Get all state by province by state Id (it needs stateId as parameter)
export const getAllProvinces = async (stateId) => {
  try {
    const response = await axios.get(
      `${baseUrl}organisation-units/parent-organisation-units/${stateId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (e) {}
};

//Get all state by province by state Id (it needs stateId as parameter)
export const getAcount = async () => {

  const userAccountData = localStorage.getItem('user_account');
  if (userAccountData) {
      try {
        const storedValues = JSON.parse(userAccountData);
        Cookies.set("facilityName", storedValues?.currentOrganisationUnitName);
        return storedValues
      } catch (error) {
          console.error('Error parsing user_account JSON:', error);
          return null; // Return null if parsing fails
      }
  }
  return null; 
};

export const checkPregnantPatient =  async(id) => {
   try {
     const response = await axios.get(
       `${baseUrl}application-codesets/v2/PREGNANCY_STATUS`,
       {
         headers: { Authorization: `Bearer ${token}` },
       }
     );
     //Get the pregnant object
     let result = response.data.filter((each, index) => {
       return each.code === "PREGANACY_STATUS_PREGNANT";
     });
     //compare the object id with  parameter

    //  console.log(result[0].id, id, Number(result[0].id) === Number(id));

    //  return result[0].id;
     if (Number(result[0].id) === Number(id)) {
       // return true;
       return true;
     } else {
       return false;
     }
   } catch (e) {}


  

};
// TEST_SETTING_OTHERS_PMTCT_(POST_ANC1:_PREGNANCYL&DBF)

//check modality
export const getCheckModality = (patientObj) => {
  if (
    patientObj ===  "FACILITY_HTS_TEST_SETTING_ANC" ||
    patientObj === "FACILITY_HTS_TEST_SETTING_L&D" ||
    patientObj === "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING" 
  ) {


    return "skip";
  } else {
    localStorage.setItem("modality", "fill");
    return "fill";
  }
};

//check modality for new HTS
export const getCheckModalityForHTS = (patientObj) => {
  if (
    patientObj ===  "FACILITY_HTS_TEST_SETTING_ANC" ||
    patientObj === "FACILITY_HTS_TEST_SETTING_L&D" ||
    patientObj === "FACILITY_HTS_TEST_SETTING_POST_NATAL_WARD_BREASTFEEDING" 
  ) {
    return "show";
  } else {
    return "hidden";
  }
};

// Permission implementation

export const generateFormCode = (formName) => {
  switch (formName) {
    case "risk_stratification":
      return {
        name: "risk_stratification",
        code: "risk",
        general: true,
        condition: [],
      };
      break;
    case "client_intake_form":
      return {
        name: "client_intake_form",
        code: "basic",
        general: true,
        condition: [],
      };
      break;
    case "pre_test_counseling":
      return {
        name: "pre_test_counseling",
        code: "pre-test-counsel",
        general: true,
        condition: ["age < 15", "pmtct modality"],
      };
      break;
    case "request_and_result_form":
      return {
        name: "request_and_result_form",
        code: "hiv-test",
        general: true,
        condition: [],
      };
      break;
    case "post_test_counseling":
      return {
        name: "post_test_counseling",
        code: "post-test",
        general: true,
        condition: [],
      };
      break;
    case "hiv_recency_testing":
      return {
        name: "hiv_recency_testing",
        code: "recency-testing",
        general: true,
        condition: ["age < 15", "-HIV status"],
      };
      break;
    case "nigeria_pns_form":
      return {
        name: "nigeria_pns_form",
        code: "pns",
        general: false,
        condition: ["-HIV status"],
      };
      break;
    case "referral_form":
      return {
        name: "referral_form",
        code: "refferal-history",
        general: false,
        condition: [],
      };
  }
};



// note people with that condition will not see the form
let ArrayOfAllForms = [
  {
    name: "risk_stratification",
    code: "risk",
    general: true,
    condition: [],
  },
  { name: "client_intake_form", code: "basic", general: true, condition: [] },
  {
    name: "pre_test_counseling",  
    code: "pre-test-counsel",
    general: true,
    condition: ["age < 15", "pmtct modality"],
  },
  {
    name: "request_and_result_form",
    code: "hiv-test",
    general: true,
    condition: [],
  },
  {
    name: "post_test_counseling",
    code: "post-test",
    general: true,
    condition: [],
  },
  {
    name: "hiv_recency_testing",
    code: "recency-testing",
    general: true,
    condition: ["age < 15", "-HIV status"],
  },
  {
    name: "family_index_testing_form",
    code: "fit",
    general: false,
    condition: ["-HIV status"],
  },
  {
    name: "nigeria_pns_form",
    code: "pns",
    general: false,
    condition: ["-HIV status"],
  },
  {
    name: "referral_form",
    code: "refferal-history",
    general: false,
    condition: [],
  },
];

export const getListOfPermission = (permittedForms) => {

  let newListOfForms = [];

  //if it is admin then return all form
  if (permittedForms.includes("all_permission")) {
    return ArrayOfAllForms;
  } else {
    // map through all form array using nuser as the argument

    ArrayOfAllForms.map((each, index) => {
      if (each.general) {
        newListOfForms.push(each);
      } else {
        if (permittedForms.includes(each.name)) {
          // generate object body
          let objGenerated = generateFormCode(each.name);
          newListOfForms.push(objGenerated);
        }
      }
    });

    return newListOfForms;
  }
};


export const getNextForm = (formName, age, pmtctModality, hivStatus) => {
  let ageCondition = undefined;
  let pmctctModalityCondition = undefined;
  let HivStatuscondition = undefined;
   pmtctModality = pmtctModality
     ? pmtctModality
     : localStorage.getItem("modality");

  let authorizedForm = JSON.parse(localStorage.getItem("hts_permissions_forms"));

  let lengthOfAuthForm = authorizedForm.length;

  // get the index of the form
  let IndexOfForm = authorizedForm.findIndex((each) => {
    return each.name === formName;
  });

  // use the index of the form to send the code of the next page
  let nextPage;

  if (lengthOfAuthForm > IndexOfForm + 1) {
    nextPage = IndexOfForm + 1;

    let nextForm = authorizedForm[nextPage];

    console.log("authorizedForm", authorizedForm);

    //  confirm if there are no condition on the  NEXT form
    if (nextForm.condition.length === 0) {
      return [nextForm.code, authorizedForm[IndexOfForm].code];
    } else {
      let answer = loopThroughForms(
        nextForm,
        authorizedForm[IndexOfForm],
        IndexOfForm,
        age,
        pmtctModality,
        hivStatus
      );
      return answer;
    }

    //
  } else {

      return [
        authorizedForm[IndexOfForm].code,
        authorizedForm[IndexOfForm].code,
      ];
  }
};

export const getDoubleSkipForm = (code) => {
  let authorizedForm = JSON.parse(localStorage.getItem("hts_permissions_forms"));

  let lengthOfAuthForm = authorizedForm.length;

  // get the index of the form
  let IndexOfForm = authorizedForm.findIndex((each) => {
    return each.code === code;
  });

  // use the index of the form to send the code of the next page
  let nextPage;

  if (lengthOfAuthForm > IndexOfForm + 1) {
    nextPage = IndexOfForm + 1;

    let nextForm = authorizedForm[nextPage];

    // console.log([nextForm.code, authorizedForm[IndexOfForm].code]);

    return [nextForm.code, authorizedForm[IndexOfForm].code];
  } else {
    return "non";
  }
};

export const checkNextPageCondition = (
  nextForm,
  currentForm,
  IndexOfForm,
  age,
  pmtctModality,
  hivStatus
) => {
  let ageCondition = undefined;
  let pmctctModalityCondition = undefined;
  let HivStatuscondition = undefined;
let authorizedForm = JSON.parse(localStorage.getItem("hts_permissions_forms"));


 

 if (nextForm.condition.length === 0) {

    return [nextForm.code, authorizedForm[IndexOfForm].code];

 } else {
   // check if patient obj conform with the codition
   nextForm.condition.map((each, index) => {
     if (each === "age < 15") {
       ageCondition = age < 15 ? true : false;
     } else if (each === "pmtct modality") {
       pmctctModalityCondition = pmtctModality === "skip" ? true : false;
     } else if (each === "-HIV status" && hivStatus) {
       HivStatuscondition =
         hivStatus.toLowerCase() === "negative" ? true : false;
     } else if (each === "-HIV status" && !hivStatus) {
       HivStatuscondition = true
       
     }
   });
   //type of form
   let checkformType = [
     ageCondition,
     pmctctModalityCondition,
     HivStatuscondition,
   ];

   let confirmedFormType = checkformType.filter((each, index) => {
     return each !== undefined;
   });

  //  console.log("total condition seen", confirmedFormType);
   // check if any condition is true
   let answer = confirmedFormType.some((each) => {
     return each === true;
   });

   // skip to the next page ie +1+1
   if (answer) {
     // indexPage +1 +1 check the next page condtion ;

     return "recall " + IndexOfForm;
   } else {
    console.log("recal",nextForm.code, authorizedForm[IndexOfForm].code)
     return [nextForm.code, authorizedForm[IndexOfForm].code];
   }
 }
};

export const loopThroughForms = (
  nextForm,
  currentForm,
  IndexOfForm,
  age,
  pmtctModality,
  hivStatus
) => {
let authorizedForm = JSON.parse(localStorage.getItem("hts_permissions_forms"));
let latestNextForm = nextForm;
let nextFormIndex =
  authorizedForm.length > IndexOfForm + 1 ? IndexOfForm + 1 : IndexOfForm;

  //get the index of the next form

  for (let i = nextFormIndex; i < authorizedForm.length; i++) {
   
    let theNextPage = checkNextPageCondition(
      authorizedForm[i],
      authorizedForm[IndexOfForm],
      IndexOfForm,
      age,
      pmtctModality,
      hivStatus
    );

    if (theNextPage.includes("recall")) {
      // console.log(authorizedForm[i]);
    } else {
      return theNextPage;
    }
  }
};

export const loopThroughFormBackward = (
  nextForm,
  currentForm,
  IndexOfForm,
  age,
  pmtctModality,
  hivStatus
) => {
  let authorizedForm = JSON.parse(localStorage.getItem("hts_permissions_forms"));
  // console.log("length of the authorized form ", authorizedForm.length);
  let nextFormIndex =
  IndexOfForm - 1 >= 0 ? IndexOfForm - 1 : IndexOfForm;

  //get the index of the next form

  for (let i = nextFormIndex; i > 0; i--) {
    let theNextPage = checkNextPageCondition(
      authorizedForm[i],
      authorizedForm[IndexOfForm],
      IndexOfForm,
      age,
      pmtctModality,
      hivStatus
    );

    if (theNextPage.includes("recall")) {
      // console.log(authorizedForm[i]);
    } else {
      return theNextPage;
    }
  }
};

export const getPreviousForm = (formName, age, pmtctModality, hivStatus) => {

  let ageCondition = undefined;
  let pmctctModalityCondition = undefined;
  let HivStatuscondition = undefined;
  pmtctModality = pmtctModality !== ""
    ? pmtctModality
    : localStorage.getItem("modality");

    let authorizedForm = JSON.parse(localStorage.getItem("hts_permissions_forms"));

  let lengthOfAuthForm = authorizedForm.length;

  // get the index of the form
  let IndexOfForm = authorizedForm.findIndex((each) => {
    return each.name === formName;
  });

  // use the index of the form to send the code of the next page
  let prevPage;

  
  if (IndexOfForm - 1 >= 0) {
    prevPage = IndexOfForm - 1;

    let nextForm = authorizedForm[prevPage];

   

    //  confirm if there are no condition on the  NEXT form
    if (nextForm.condition.length === 0) {
      return [nextForm.code, authorizedForm[IndexOfForm].code];
    } else {
      let answer = loopThroughFormBackward(
        nextForm,
        authorizedForm[IndexOfForm],
        IndexOfForm,
        age,
        pmtctModality,
        hivStatus
      );
       return answer;
    }

    //
  } else {
    return ["", ""];
  }
};

export const getCurentForm=(activeItem)=>{
 
  switch(activeItem){
    case  "risk":
    return "risk_stratification";
    break;
    case  "basic":
    return "client_intake_form";

    case  "pre-test-counsel":
    return "pre_test_counseling";

    case  "hiv-test":
    return "request_and_result_form";

    case  "post-test":
    return "post_test_counseling";

    case  "recency-testing":
    return "hiv_recency_testing";

    case  "fit":
    return "family_index_testing_form";

    case  "fit-history":
      return "family_index_testing_form";

    case  "view-fit":
      return "family_index_testing_form";

    case  "pns":
    return "nigeria_pns_form";

    case  "pns-history":
      return "nigeria_pns_form";


    case  "client-referral":
    return "";

    case  "refferal-history":
    return "referral_form";

    case  "view-referral":
    return "referral_form";

    default:
      return "";    }

}

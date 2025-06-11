import React, {useEffect, useState} from "react";
import {CardBody, FormGroup, Input, Label} from "reactstrap";
import * as moment from "moment/moment";
import {Card, CardContent} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Select from 'react-select';


import SaveIcon from "@material-ui/icons/Save";
// import AddIcon from "@material-ui/icons/Add";
// import CancelIcon from "@material-ui/icons/Cancel";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import {token, url as baseUrl} from "../../../../api";
import "react-phone-input-2/lib/style.css";
import {Button, Icon, Label as LabelSui, List} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {Modal, Table} from "react-bootstrap";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import DualListBox from "react-dual-listbox";
import {calculate_age} from "../../utils";
import { useGetCodesets } from "../../../hooks/useGetCodesets.hook";

const useStyles = makeStyles((theme) => ({
    card: {
        margin: theme.spacing(20),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    cardBottom: {
        marginBottom: 20,
    },
    Select: {
        height: 45,
        width: 300,
    },
    button: {
        margin: theme.spacing(1),
    },
    root: {
        "& > *": {
            margin: theme.spacing(1),
        },
        "& .card-title": {
            color: "#fff",
            fontWeight: "bold",
        },
        "& .form-control": {
            borderRadius: "0.25rem",
            height: "41px",
        },
        "& .card-header:first-child": {
            borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0",
        },
        "& .dropdown-toggle::after": {
            display: " block !important",
        },
        "& select": {
            "-webkit-appearance": "listbox !important",
        },
        "& p": {
            color: "red",
        },
        "& label": {
            fontSize: "14px",
            color: "#014d88",
            fontWeight: "bold",
        },
    },
    demo: {
        backgroundColor: theme.palette.background.default,
    },
    inline: {
        display: "inline",
    },
    error: {
        color: "#f85032",
        fontSize: "12.8px",
    },
    success: {
        color: "green",
        fontSize: "12.8px",
        fontWeight: "bold",
    },
}));

const HIVSTPatientRegistration = (props) => {
    const patient = props.patientObject;
    const [saving, setSaving] = useState(false)
    const classes = useStyles();
    const [codesets, setCodesets] = useState({})
    const history = useHistory();
    const [errors, setErrors] = useState({});
    let temp = { ...errors };
    const [serialNumber, setSerialNumber] = useState(null);
    const [createdCode, setCreatedCode] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [otherText, setOtherText] = useState('');
    const [otherTestKitUserInfoAvailable, setIsUserInformationAvailable] = useState(false);
    const [kitUserInformation, setKitUserInformation] = useState([]);
    const [serviceNeeded, setServiceNeeded] = useState([]);
    const [hasConductedHIVST, setHasConductedHIVST] = useState(false);
    const [maritalStatus, setMaritalStatus] = useState([]);
    const [sexs, setSexs] = useState([]);
    const [userInformationList, setUserInformationList] = useState([])
    const [userInformationErrors, setUserInformationErrors] = useState({});
    const [ageDisabled, setAgeDisabled] = useState(true);
    const [open, setOpen] = React.useState(false);
    const toggle = () => setOpen(!open);

    const [objValues, setObjValues] = useState({
        patientId: patient?.personId ? patient.personId : "",
        // patientObject: {
        //     surname: patient?.surname ? patient.surname : "",
        //     firstName: patient?.firstName ? patient.firstName : "",
        //     otherName: patient?.otherName ? patient.otherName : "",
        //     dateOfBirth: patient?.dateOfBirth ? patient.dateOfBirth : "",
        //     maritalStatusId: "1",
        //     genderId: patient.gender ? patient.gender : "",
        //     sexId: patient.personResponseDto && patient.personResponseDto.sex !== null
        //         ? patient.personResponseDto.sex
        //         : "",
        //     address: "",
        //     dateOfRegistration: "",
        //     hospitalNumber: patient?.hospitalNumber ? patient?.hospitalNumber : "",
        // },
        dateOfVisit: "",
        serviceDeliveryPoint: "",
        userType: "",
        serialNumber: "",
        clientCode: "",
        previouslyTestedWithin12Months: "",
        resultOfPreviouslyTestedWithin12Months: "",
        consentForFollowUpCalls: "",
        typeOfHivstKitReceived: "",
        numberOfHivstKitsReceived: "",
        nameOfTestKit: "",
        lotNumber: "",
        expiryDate: "",
        testKitUsers: null,
        testKitUserDetails: [],
        otherTestKitUserInfoAvailable: "",
        hasConductedHIVST: "",
    });

    const [testKitUserDetails, setUserInformation] = useState(
        {
            basicUserInfo: {
                id: "",
                firstName:"",
                surname:"",
                otherName:"",
                dateOfRegistration:"",
                otherCategory: "",
                clientCode: "",
                dateOfBirth: "",
                age: "",
                sex: "",
                maritalStatusId: "",
                typeOfHivst: "",
                userCategory: "",
                isDateOfBirthEstimated: ""
            },
            postTestAssessment: {
                everUsedHivstKit: "",
                everUsedHivstKitForSelfOrOthers: "",
                otherHivstKitUserCategory: "",
                otherHivstKitUserCategoryText: "",
                resultOfHivstTest: "",
                accessConfirmatoryHts: "",
                referPreventionServices: "",
                referralInformation: {
                    referredForConfirmatoryHts: "",
                    dateReferredForConfirmatoryHts: "",
                    referredForPreventionServices: "",
                    dateReferredForPreventionServices: ""
                }
            }
        }
    );


    const options = [
        {value: 'myself', label: 'For myself'},
        {value: 'spouse', label: 'Spouse'},
        {value: 'children', label: 'Children'},
        {value: 'sexual partner', label: 'Sexual Partner'},
        {value: 'social network', label: 'Social Network'},
        {value: 'others', label: 'Others (Please specify)'},
    ];

    const matches = useMediaQuery('(max-width:600px)');
    const style = {fontSize: matches ? '12px' : '16px',};


   

    const validateObjValues = () => {
        temp.dateOfVisit = objValues.dateOfVisit ? "" : "This field is required.";
        temp.clientCode = objValues.clientCode ? "" : "This field is required.";
        temp.serviceDeliveryPoint = objValues.serviceDeliveryPoint ? "" : "This field is required.";
        temp.userType = objValues.userType ? "" : "This field is required.";
        temp.serialNumber = objValues.serialNumber ? "" : "This field is required.";
        temp.previouslyTestedWithin12Months = objValues.previouslyTestedWithin12Months ? "" : "This field is required.";
        temp.consentForFollowUpCalls = objValues.consentForFollowUpCalls ? "" : "This field is required.";
        if (objValues.previouslyTestedWithin12Months !== "" && objValues.previouslyTestedWithin12Months !== "No") {
            temp.resultOfPreviouslyTestedWithin12Months = objValues.resultOfPreviouslyTestedWithin12Months ? "" : "This field is required.";
        }
        temp.nameOfTestKit = objValues.nameOfTestKit ? "" : "This field is required.";
        temp.typeOfHivstKitReceived = objValues.typeOfHivstKitReceived ? "" : "This field is required.";
        temp.numberOfHivstKitsReceived = objValues.numberOfHivstKitsReceived ? "" : "This field is required.";
        temp.expiryDate = objValues.expiryDate ? "" : "This field is required.";
        temp.lotNumber = objValues.lotNumber ? "" : "This field is required.";
        if(selectedUsers.length === 0) {
            temp.selectedUsers =   objValues.testKitUsers ? "" : "Please select at least one user"
        }
    
        setErrors({ ...temp });
        return Object.values(temp).every((x) => x == "");
    }

    // validate testKitUserDetails
    const validateUserInformation = () => {
        // if (objValues.otherTestKitUserInfoAvailable === "Yes") {
            let temp = {};
            temp.firstName = testKitUserDetails.basicUserInfo.firstName ?  "" : "This field is required.";
            temp.surname = testKitUserDetails.basicUserInfo.surname ?  "" : "This field is required.";
            temp.userCategory = testKitUserDetails.basicUserInfo.userCategory ? "" : "This field is required.";
            // temp.otherCategory = testKitUserDetails.basicUserInfo.userCategory === "Others" ? testKitUserDetails.basicUserInfo.otherCategory ? "" : "This field is required." : "";
            temp.clientCode = testKitUserDetails.basicUserInfo.clientCode ? "" : "This field is required.";
            // temp.dateOfBirth = testKitUserDetails.basicUserInfo.dateOfBirth ? "" : "This field is required.";
            temp.typeOfHivst = testKitUserDetails.basicUserInfo.typeOfHivst ? "" : "This field is required.";
            // Check if the selected user category is in the selectedUsers array
            if (!selectedUsers.includes(testKitUserDetails.basicUserInfo.userCategory) && testKitUserDetails.basicUserInfo.userCategory !== "" ) {
                temp.userCategory = "The selected user category does not match the selected kit users.";
            }
            // the number of kit is empty
            setUserInformationErrors({...temp});
            return Object.values(temp).every((x) => x == "");
        // }
    }


    const handleInputChange = (e) => {
        const {name, value} = e.target;
        let newObjectValues = {...objValues};
        if (name in objValues) {
            newObjectValues[name] = value;
        } else if (name in objValues.postTestAssessment) {
            newObjectValues.postTestAssessment[name] = value;
        } else if (name in objValues.postTestAssessment.referralInformation) {
            newObjectValues.postTestAssessment.referralInformation[name] = value;
        }

        // Check if the name is "previouslyTestedWithin12Months"
        if (name === "previouslyTestedWithin12Months") {
            newObjectValues.resultOfPreviouslyTestedWithin12Months = "";
        }
        if (name === "typeOfHivstKitReceived") {
            newObjectValues.numberOfHivstKitsReceived = "";
            newObjectValues.nameOfTestKit = "";
            newObjectValues.lotNumber = "";
            newObjectValues.expiryDate = "";
        }
        // Check if the name is "hasConductedHIVST" and objValues.hasConductedHIVST is "No"
        if (name === "hasConductedHIVST") {
            testKitUserDetails.postTestAssessment = {
                ...testKitUserDetails.postTestAssessment,
                everUsedHivstKitForSelfOrOthers: "",
                otherHivstKitUserCategory: "",
                otherHivstKitUserCategoryText: "",
                resultOfHivstTest: "",
                accessConfirmatoryHts: "",
                referPreventionServices: "",
                referralInformation: {
                    referredForConfirmatoryHts: "",
                    dateReferredForConfirmatoryHts: "",
                    referredForPreventionServices: "",
                    dateReferredForPreventionServices: ""
                }
            };
        }
// Validate the field and remove the error message if the field is filled
        if (value) {
            let tempErrors = {...errors};
            tempErrors[name] = "";
            setErrors(tempErrors);
        }

        setObjValues(newObjectValues);
    }

    const handleUserInformationInputChange = (e, section) => {
        const {name, value} = e.target;
        let newUserInformation = {...testKitUserDetails};

        if (section === 'postTestAssessment' && name in newUserInformation[section].referralInformation) {
            newUserInformation[section].referralInformation[name] = value;
        } else {
            newUserInformation[section][name] = value;
        }

        // if everUsedHivstKitForSelfOrOthers  clear otherHivstKitUserCategory
        if (name === "everUsedHivstKitForSelfOrOthers") {
            newUserInformation.postTestAssessment = {
                ...newUserInformation.postTestAssessment,
                otherHivstKitUserCategory: "",
                otherHivstKitUserCategoryText: ""
            };
        }

        // if  resultOfHivstTestchnages clear all the feilds below
        if (name === "resultOfHivstTest") {
            newUserInformation.postTestAssessment = {
                ...newUserInformation.postTestAssessment,
                accessConfirmatoryHts: "",
                referPreventionServices: "",
                referralInformation: {
                    referredForConfirmatoryHts: "",
                    dateReferredForConfirmatoryHts: "",
                    referredForPreventionServices: "",
                    dateReferredForPreventionServices: ""
                }
            };

        }
        // if  accessConfirmatoryHtschnages clear all the feilds below
        if (name === "accessConfirmatoryHts") {
            newUserInformation.postTestAssessment = {
                ...newUserInformation.postTestAssessment,
                referPreventionServices: "",
                referralInformation: {
                    referredForConfirmatoryHts: "",
                    dateReferredForConfirmatoryHts: "",
                    referredForPreventionServices: "",
                    dateReferredForPreventionServices: ""
                }
            };

        }
        // if  referPreventionServiceschnages clear all the feilds below
        if (name === "referPreventionServices") {
            newUserInformation.postTestAssessment = {
                ...newUserInformation.postTestAssessment,
                referralInformation: {
                    referredForConfirmatoryHts: "",
                    dateReferredForConfirmatoryHts: "",
                    referredForPreventionServices: "",
                    dateReferredForPreventionServices: ""
                }
            };
        }

        // any change in referredForPreventionServices clear dateReferredForPreventionServices
        if (name === "referredForPreventionServices") {
            newUserInformation.postTestAssessment.referralInformation = {
                ...newUserInformation.postTestAssessment.referralInformation,
                dateReferredForPreventionServices: ""
            };
        }

        if (name === "hasConductedHIVST" && value === "No") {
            newUserInformation.postTestAssessment = {
                ...newUserInformation.postTestAssessment,
                everUsedHivstKitForSelfOrOthers: "",
                otherHivstKitUserCategory: "",
                otherHivstKitUserCategoryText: "",
                resultOfHivstTest: "",
                accessConfirmatoryHts: "",
                referPreventionServices: "",
                referralInformation: {
                    referredForConfirmatoryHts: "",
                    dateReferredForConfirmatoryHts: "",
                    referredForPreventionServices: "",
                }
            };
        }
        // if userCategory changes clear all other fields in basicUserInfo
        if (name === "userCategory") {
            newUserInformation.basicUserInfo = {
                ...newUserInformation.basicUserInfo,
                otherCategory: "",
                clientCode: "",
                dateOfBirth: "",
                age: "",
            }
        }
        // validate and remove error message if the field is filled
        if (value) {
            let tempErrors = {...userInformationErrors};
            tempErrors[name] = "";
            setUserInformationErrors(tempErrors);
        }

        setUserInformation(newUserInformation);
    };

    const addUserInformation = () => {
        if(validateUserInformation()) {
            if(userInformationList.length <= objValues.numberOfHivstKitsReceived) {
                let newUserInformation = {
                    basicUserInfo: {
                        id: "",
                        firstName:testKitUserDetails.basicUserInfo.firstName,
                        surname:testKitUserDetails.basicUserInfo.surname,
                        otherName:testKitUserDetails.basicUserInfo.otherName,
                        dateOfRegistration:testKitUserDetails.basicUserInfo.dateOfRegistration,
                        otherCategory: testKitUserDetails.basicUserInfo.otherCategory,
                        clientCode: testKitUserDetails.basicUserInfo.clientCode,
                        dateOfBirth: testKitUserDetails.basicUserInfo.dateOfBirth,
                        age: testKitUserDetails.basicUserInfo.age,
                        sex: testKitUserDetails.basicUserInfo.sex,
                        maritalStatusId: testKitUserDetails.basicUserInfo.maritalStatusId,
                        typeOfHivst: testKitUserDetails.basicUserInfo.typeOfHivst,
                        userCategory: testKitUserDetails.basicUserInfo.userCategory
                    },
                    postTestAssessment: {
                        everUsedHivstKit: testKitUserDetails.postTestAssessment.everUsedHivstKit,
                        everUsedHivstKitForSelfOrOthers: testKitUserDetails.postTestAssessment.everUsedHivstKitForSelfOrOthers,
                        otherHivstKitUserCategory: testKitUserDetails.postTestAssessment.otherHivstKitUserCategory,
                        otherHivstKitUserCategoryText: testKitUserDetails.postTestAssessment.otherHivstKitUserCategoryText,
                        resultOfHivstTest: testKitUserDetails.postTestAssessment.resultOfHivstTest,
                        accessConfirmatoryHts: testKitUserDetails.postTestAssessment.accessConfirmatoryHts,
                        referPreventionServices: testKitUserDetails.postTestAssessment.referPreventionServices,
                        referralInformation: {
                            referredForConfirmatoryHts: testKitUserDetails.postTestAssessment.referralInformation.referredForConfirmatoryHts,
                            dateReferredForConfirmatoryHts: testKitUserDetails.postTestAssessment.referralInformation.dateReferredForConfirmatoryHts,
                            referredForPreventionServices: testKitUserDetails.postTestAssessment.referralInformation.referredForPreventionServices,
                            dateReferredForPreventionServices: testKitUserDetails.postTestAssessment.referralInformation.dateReferredForPreventionServices
                        }
                    }
                }
                setUserInformationList([...userInformationList, newUserInformation]);
                setObjValues({...objValues, testKitUserDetails: [...userInformationList, newUserInformation]});

                // clear testKitUserDetails after adding to the list and also set the hasConductedHIVST to No
                setUserInformation({
                    basicUserInfo: {
                        firstName:"",
                        surname:"",
                        otherName:"",
                        dateOfRegistration:"",
                        otherCategory: "",
                        clientCode: "",
                        dateOfBirth: "",
                        age: "",
                        sex: "",
                        maritalStatusId: "",
                        typeOfHivst: "",
                        userCategory: "",
                        isDateOfBirthEstimated: ""
                    },
                    postTestAssessment: {
                        everUsedHivstKit: "",
                        everUsedHivstKitForSelfOrOthers: "",
                        otherHivstKitUserCategory: "",
                        otherHivstKitUserCategoryText: "",
                        resultOfHivstTest: "",
                        accessConfirmatoryHts: "",
                        referPreventionServices: "",
                        referralInformation: {
                            referredForConfirmatoryHts: "",
                            dateReferredForConfirmatoryHts: "",
                            referredForPreventionServices: "",
                            dateReferredForPreventionServices: ""
                        }
                    }
                });
                setObjValues({...objValues, hasConductedHIVST: "No"});
            } else {
               
            }
        } else{
            toast.error("Please fill all the required fields");
        }

    }

    const removeUserInformation = (index) => {
        const updatedUserInformationList = userInformationList.filter((_, i) => i !== index);
        setUserInformationList(updatedUserInformationList);
        setObjValues({...objValues, testKitUserDetails: updatedUserInformationList});
    };


    const updateUserInformation = (index, updatedUserInformation) => {
        const updatedUserInformationList = userInformationList.map((testKitUserDetails, i) =>
            i === index ? updatedUserInformation : testKitUserDetails
        );
        setUserInformationList(updatedUserInformationList);
        setObjValues({...objValues, testKitUserDetails: updatedUserInformationList});
    };

// Function to clear the testKitUserDetails list
    const clearUserInformationList = () => {
        setUserInformationList([]);
        setObjValues({...objValues, testKitUserDetails: []});
    };


    const handleKitSelectUserChange = selectedUsers => {
        // if (objValues.userType === "Secondary User") {
        //     setSelectedUsers(["myself"]);
        //     let newValues = {...objValues, testKitUsers: selectedUsers};
        //     setObjValues(newValues);
        // } else
        // {
            setSelectedUsers(selectedUsers);
            let newValues = {...objValues, testKitUsers: selectedUsers};
            if (!selectedUsers || selectedUsers.length === 0) {
                setShowUserInfo(false);
                newValues = {...newValues, otherTestKitUserInfoAvailable: ""};
            } else if (selectedUsers.length === 1 && selectedUsers[0] === 'myself') {
                setShowUserInfo(false);
                newValues = {...newValues, otherTestKitUserInfoAvailable: ""};
            } else {
                setShowUserInfo(true);
            }
            if (!showUserInfo) {
                testKitUserDetails.userCategory = "";
                testKitUserDetails.otherCategory = "";
                testKitUserDetails.clientCode = "";
                testKitUserDetails.dateOfBirth = "";
                testKitUserDetails.age = "";
                testKitUserDetails.sex = "";
                testKitUserDetails.maritalStatus = "";
                testKitUserDetails.clientCode = "";
                testKitUserDetails.typeOfHivSelfTest = "";
            }
            // always clear the userInformationList when the user selects a new user
            // setUserInformationList([]);
            setObjValues(newValues);
        // }
    };
    const checkClientCode = (e) => {
        let code = "";
        if (e.target.name === "serialNumber") {
            code = createdCode + e.target.value;
            setCreatedCode(code);
         
            setObjValues({...objValues, clientCode: code});
        }

        async function getIndexClientCode() {
            const indexClientCode = objValues.clientCode;
            const response = await axios.get(
                `${baseUrl}hts/client/${indexClientCode}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "text/plain",
                    },
                }
            );
        }

        getIndexClientCode();
    };


  

   

    const loadCodesets = (data) => {
        setCodesets(data)
        
        setSexs(data["SEX"])
        setMaritalStatus(data["MARITAL_STATUS"])
        const serviceNeeded = data["SERVICE_PROVIDED"]?.map((service) => {
            return {
                value: service.display,
                label: service.display
            }
        });
        setServiceNeeded(serviceNeeded);
      }
    
      useGetCodesets({
        codesetsKeys: [
         "SEX",
         "MARITAL_STATUS",
         "SERVICE_PROVIDED"
        ],
        patientId: props?.patientObj?.id || props?.basicInfo.id,
        onSuccess: loadCodesets
      })
    


    const setAge = () => {
        const age = calculate_age(testKitUserDetails.basicUserInfo?.dateOfBirth);
        setUserInformation(prevState => ({
            ...prevState,
            basicUserInfo: {
                ...prevState.basicUserInfo,
                age: age
            }
        }));
        return age;
    }

    const handleDateOfBirthChange1 = (e) => {
        let newUserInformation = {...testKitUserDetails};
        newUserInformation.basicUserInfo[e.target.name] = e.target.value;
        if (e.target.value && new Date(e.target.value) <= new Date()) {
            const age_now = calculate_age(e.target.value);
            newUserInformation.basicUserInfo.age = age_now;
        } else {
            newUserInformation.basicUserInfo.age = "";
        }
        setUserInformation(newUserInformation);
    }



    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateObjValues()) {
            const userInfoList = userInformationList;
            objValues.testKitUserDetails = userInformationList;
            setSaving(true)
            axios
                .post(`${baseUrl}hivst`, objValues, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })
                .then((response) => {
                    if (response.status === 200) {
                        setSaving(false)
                        toast.success("HIVST Registration Successful");
                        history.push("/patient/hivst");
                    }
                })
                .catch((error) => {
                    setSaving(false)
                    toast.error("An error occurred. Please try again.");
                });

        }
    }


    const handleDobChange = (e) => {
        const today = new Date();
        const birthDate = new Date(e.target.value);
        let age_now = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (age_now <= 0 && m < 0 && today.getDate() < birthDate.getDate()) {
            age_now--;
        }
        setUserInformation({
            ...testKitUserDetails,
            basicUserInfo: {
                ...testKitUserDetails.basicUserInfo,
                dateOfBirth: e.target.value,
                age: age_now
            }
        });
    };

    const handleDateOfBirthChange = (e) => {
        if (e.target.value == "Actual") {
            setUserInformation({
                ...testKitUserDetails,
                basicUserInfo: {
                    ...testKitUserDetails.basicUserInfo,
                    isDateOfBirthEstimated: false
                }
            });
            setAgeDisabled(true);
        } else if (e.target.value == "Estimated") {
            setUserInformation({
                ...testKitUserDetails,
                basicUserInfo: {
                    ...testKitUserDetails.basicUserInfo,
                    isDateOfBirthEstimated: true
                }
            });
            setAgeDisabled(false);
        }
    };

    const handleAgeChange = (e) => {
        if (!ageDisabled && e.target.value) {
            const currentDate = new Date();
            currentDate.setDate(15);
            currentDate.setMonth(5);
            const estDob = moment(currentDate.toISOString());
            const dobNew = estDob.add(e.target.value * -1, "years");
            setUserInformation({
                ...testKitUserDetails,
                basicUserInfo: {
                    ...testKitUserDetails.basicUserInfo,
                    age: e.target.value,
                    dateOfBirth: moment(dobNew).format("YYYY-MM-DD")
                }
            });
        }
    };




    return (
        <>
            <Card className={classes.root}>
                <CardBody>
                    <h2 style={{color: "#000"}}> HIV SELF - TEST AND RESPONSE CARD </h2>
                    <br/>
                    <form>
                        <div className="row mb-7">
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                    <Label for="">
                                        Visit Date <span style={{color: "red"}}> *</span>
                                    </Label>
                                    <Input
                                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                                        name="dateOfVisit"
                                        id="dateOfVisit"
                                        value={objValues.dateOfVisit}
                                        onChange={handleInputChange}
                                        min="1929-12-31"
                                        max={moment(new Date()).format("YYYY-MM-DD")}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.25rem",
                                        }}
                                    />
                                    {errors.dateOfVisit !== "" ? (
                                        <span className={classes.error}>{errors.dateOfVisit}</span>
                                    ) : (
                                        ""
                                    )}
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label >
                                        Service Delivery Point
                                        <span style={{color: "red"}}> *</span>
                                    </Label>
                                    <select
                                        className="form-control"
                                        name="serviceDeliveryPoint"
                                        id="serviceDeliveryPoint"
                                        value={objValues.serviceDeliveryPoint}
                                        onChange={handleInputChange}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.2rem",
                                        }}
                                    >
                                        <option value={""}></option>
                                        <option value="Health Facility">Health Facility</option>
                                        <option value="Comunity Pharmacy">Community Pharmacy</option>
                                        <option value="PPMV">PPMV</option>
                                        <option value="Mobile Distribution">Mobile Distribution</option>
                                        <option value="Workplace">WorkPlace</option>
                                        <option value="Others">Others</option>
                                        <option value="Home based">Home based</option>
                                        <option value="Door to Door">Door to Door</option>
                                    </select>
                                    {errors.serviceDeliveryPoint !== "" ? (
                                        <span className={classes.error}>{errors.serviceDeliveryPoint}</span>
                                    ) : (
                                        ""
                                    )}
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>
                                        User Type
                                        <span style={{color: "red"}}> *</span>
                                    </Label>
                                    <select
                                        className="form-control"
                                        name="userType"
                                        id="userType"
                                        value={objValues.userType}
                                        onChange={handleInputChange}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.2rem",
                                        }}
                                    >
                                        <option value={""}></option>
                                        <option value="Primary User">Primary User</option>
                                        <option value="Secondary User">secondary user</option>
                                    </select>
                                    {errors.userType !== "" ? (
                                        <span className={classes.error}>{errors.userType}</span>
                                    ) : (
                                        ""
                                    )}
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                    <Label for="">
                                        Serial Number <span style={{color: "red"}}> *</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        name="serialNumber"
                                        id="serialNumber"
                                        value={serialNumber}
                                        //value={Math.floor(Math.random() * 1093328)}
                                        onBlur={checkClientCode}
                                        onChange={handleInputChange}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.25rem",
                                        }}
                                    />
                                    {errors.serialNumber !== "" ? (
                                        <span className={classes.error}>{errors.serialNumber}</span>
                                    ) : (
                                        ""
                                    )}
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                    <Label for="">
                                        Client Code <span style={{color: "red"}}> *</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        name="clientCode"
                                        id="clientCode"
                                        value={objValues.clientCode}
                                        onChange={handleInputChange}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.25rem",
                                        }}
                                        //readOnly={props.activePage.actionType === "view"}
                                    />
                                     {errors.clientCode !== "" ? (
                                         <span className={classes.error}>{errors.clientCode}</span>
                                        ) : (
                                         ""
                                        )}
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>
                                        Have you previously tested for HIV in the last 12 months?
                                        <span style={{color: "red"}}> *</span>
                                    </Label>
                                    <select
                                        className="form-control"
                                        name="previouslyTestedWithin12Months"
                                        id="previouslyTestedWithin12Months"
                                        value={objValues.previouslyTestedWithin12Months}
                                        onChange={handleInputChange}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.2rem",
                                        }}
                                    >
                                        <option value={""}></option>
                                        <option value="Yes">YES</option>
                                        <option value="No">NO</option>
                                    </select>
                                    {errors.previouslyTestedWithin12Months !== "" ? (
                                        <span className={classes.error}>{errors.previouslyTestedWithin12Months}</span>
                                    ) : (
                                        ""
                                    )}
                                </FormGroup>
                            </div>
                            {objValues?.previouslyTestedWithin12Months === "Yes" ? (
                                <div className="form-group  col-md-4">
                                    <FormGroup>
                                        <Label >
                                            What was the test result?
                                            <span style={{color: "red"}}> *</span>
                                        </Label>
                                        <select
                                            className="form-control"
                                            name="resultOfPreviouslyTestedWithin12Months"
                                            id="resultOfPreviouslyTestedWithin12Months"
                                            value={objValues.resultOfPreviouslyTestedWithin12Months}
                                            onChange={handleInputChange}
                                            style={{
                                                border: "1px solid #014D88",
                                                borderRadius: "0.2rem",
                                            }}
                                        >
                                            <option value={""}></option>
                                            <option value="Positive">Positive</option>
                                            <option value="Negative">Negative</option>
                                            <option value="Unknown">Unknown</option>
                                        </select>
                                        {errors.resultOfPreviouslyTestedWithin12Months !== "" ? (
                                            <span className={classes.error}>{errors.resultOfPreviouslyTestedWithin12Months}</span>
                                        ) : (
                                            ""
                                        )}
                                    </FormGroup>
                                </div>
                            ) : ""}
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label >
                                        Do you consent to be followed-up via phone calls?
                                        {/*<span style={{color: "red"}}> *</span>*/}
                                    </Label>
                                    <select
                                        className="form-control"
                                        name="consentForFollowUpCalls"
                                        id="consentForFollowUpCalls"
                                        value={objValues.consentForFollowUpCalls}
                                        onChange={handleInputChange}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.2rem",
                                        }}
                                    >
                                        <option value={""}></option>
                                        <option value="Yes">YES</option>
                                        <option value="No">NO</option>
                                    </select>
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label >
                                        What type of HIVST kit did you receive/purchase today?
                                        <span style={{color: "red"}}> *</span>
                                    </Label>
                                    <select
                                        className="form-control"
                                        name="typeOfHivstKitReceived"
                                        id="typeOfHivstKitReceived"
                                        value={objValues.typeOfHivstKitReceived}
                                        onChange={handleInputChange}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.2rem",
                                        }}
                                    >
                                        <option value={""}></option>
                                        <option value="Oral fluid">Oral fluid</option>
                                        <option value="Blood">Blood</option>
                                    </select>
                                    {errors.typeOfHivstKitReceived !== "" ? (
                                        <span className={classes.error}>{errors.typeOfHivstKitReceived}</span>
                                    ) : (
                                        ""
                                    )}
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                    <Label for="">
                                        Number of individual HIV self-test kits received? {" "}
                                        <span style={{color: "red"}}> *</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        name="numberOfHivstKitsReceived"
                                        id="numberOfHivstKitsReceived"
                                        value={objValues.numberOfHivstKitsReceived}
                                        min="1"
                                        onChange={handleInputChange}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.25rem",
                                        }}
                                    />
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                    <Label for="providerNameCompletingForm">
                                        Name of Test Kit ?
                                        <span style={{color: "red"}}> *</span>
                                    </Label>
                                    <Input
                                        className="form-control"
                                        type="text"
                                        name="nameOfTestKit"
                                        id="nameOfTestKit"
                                        value={objValues.nameOfTestKit}
                                        onChange={handleInputChange}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.2rem",
                                        }}
                                    />
                                    {errors.nameOfTestKit !== "" ? (
                                        <span className={classes.error}>
                                            {errors.nameOfTestKit}
                                        </span>
                                    ) : (
                                        ""
                                    )}
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                    <Label for="providerNameCompletingForm">
                                        Lot No
                                        <span style={{color: "red"}}> *</span>
                                    </Label>
                                    <Input
                                        className="form-control"
                                        type="text"
                                        name="lotNumber"
                                        id="" lotNumber
                                        value={objValues.lotNumber}
                                        onChange={handleInputChange}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.2rem",
                                        }}
                                    />
                                    {errors.lotNumber !== "" ? (
                                        <span className={classes.error}>
                                            {errors.lotNumber}
                                        </span>
                                    ) : (
                                        ""
                                    )}

                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                    <Label for="">
                                        Expiry Date <span style={{color: "red"}}> *</span>
                                    </Label>
                                    <Input
                                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                                        name="expiryDate"
                                        id="expirtyDate"
                                        value={objValues.expiryDate}
                                        onChange={handleInputChange}
                                        min={moment(new Date()).format("YYYY-MM-DD")}
                                        max={moment(new Date()).add(5, 'years').format("YYYY-MM-DD")}
                                        style={{
                                            border: "1px solid #014D88",
                                            borderRadius: "0.25rem",
                                        }}
                                    />
                                    {errors.expiryDate !== "" ? (
                                        <span className={classes.error}>{errors.expiryDate}</span>
                                    ) : (
                                        ""
                                    )}
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-12">
                                <FormGroup>
                                    <Label for="dualListBox">
                                        Who do you want to use the kit for?
                                    </Label>
                                    <DualListBox
                                        options={options}
                                        selected={selectedUsers}
                                        onChange={handleKitSelectUserChange}
                                        // disabled={objValues.userType === "Secondary User" ? true : false}
                                    />
                                    {errors.testKitUsers !== "" ? (
                                        <span className={classes.error}>
                                            {errors.testKitUsers}
                                        </span>
                                    ) : (
                                        ""
                                    )}
                                </FormGroup>
                            </div>

                            {/*<div className="form-group mb-7 col-md-4">*/}
                            {/*    <FormGroup>*/}
                            {/*        <Label for="testKitUsers">*/}
                            {/*            Who do you want to use the kit for?*/}
                            {/*        </Label>*/}
                            {/*        <Select*/}
                            {/*            isMulti*/}
                            {/*            name="whoDoYouWantToUseTheKitFor"*/}
                            {/*            options={options}*/}
                            {/*            className="basic-multi-select"*/}
                            {/*            classNamePrefix="select"*/}
                            {/*            onChange={handleKitSelectUserChange}*/}
                            {/*            styles={{*/}
                            {/*                control: (provided) => ({*/}
                            {/*                    ...provided,*/}
                            {/*                    border: "1px solid #014D88",*/}
                            {/*                    borderRadius: "0.25rem",*/}
                            {/*                }),*/}
                            {/*            }}*/}
                            {/*        />*/}
                            {/*    </FormGroup>*/}
                            {/*</div>*/}

                            {selectedUsers && selectedUsers.length === 1 && selectedUsers[0] === 'others' &&
                                <div className="form-group mb-3 col-md-4">
                                    <FormGroup>
                                        <Label for="testKitUsers">
                                            Please Specify
                                        </Label>
                                        <Input
                                            type="text"
                                            name="otherText"
                                            id="otherText"
                                            value={otherText}
                                            onChange={e => setOtherText(e.target.value)}
                                            placeholder="Please specify"
                                            style={{
                                                border: "1px solid #014D88",
                                                borderRadius: "0.25rem",
                                            }}
                                        />
                                    </FormGroup>
                                </div>
                            }
                            {showUserInfo &&
                                <div className="form-group  col-md-4">
                                    <FormGroup>
                                        <Label >
                                            Is user information available?
                                            <span style={{color: "red"}}> *</span>
                                        </Label>
                                        <select
                                            className="form-control"
                                            name="otherTestKitUserInfoAvailable"
                                            id="otherTestKitUserInfoAvailable"
                                            value={objValues.otherTestKitUserInfoAvailable}
                                            onChange={handleInputChange}
                                            style={{
                                                border: "1px solid #014D88",
                                                borderRadius: "0.2rem",
                                            }}
                                            // disabled={objValues.userType === "Secondary User" ? true : false}
                                        >
                                            <option value={""}></option>
                                            <option value="Yes">YES</option>
                                            <option value="No">NO</option>
                                        </select>
                                        {/*                {errors.firstTimeVisit !== "" ? (*/}
                                        {/*                    <span className={classes.error}>*/}
                                        {/*  {errors.firstTimeVisit}*/}
                                        {/*</span>*/}
                                        {/*                ) : (*/}
                                        {/*                    ""*/}
                                        {/*                )}*/}
                                    </FormGroup>
                                </div>
                            }
                            {/*{objValues?.otherTestKitUserInfoAvailable === "Yes" &&*/}
                            {selectedUsers.length === 0 ? ("") : (
                                <>
                                    <div className="row center">
                                        <div
                                            className="form-group col-md-12 ml-3 text-center pt-2 mb-4"
                                            style={{
                                                backgroundColor: "#992E62",
                                                width: "125%",
                                                height: "35px",
                                                color: "#fff",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Intended Kit User Information
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="form-group mb-3 col-md-4">
                                            <FormGroup>
                                                <Label for="">
                                                    Registration Date
                                                    {/*<span style={{color: "red"}}> *</span>*/}
                                                </Label>
                                                <Input
                                                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                                                    name="dateOfRegistration"
                                                    id="dateOfRegistration"
                                                    min="1929-12-31"
                                                    max={moment(new Date()).format("YYYY-MM-DD")}
                                                    value={testKitUserDetails.basicUserInfo.dateOfRegistration}
                                                    onChange={(e) => handleUserInformationInputChange(e, "basicUserInfo")}
                                                    style={{
                                                        border: "1px solid #014D88",
                                                        borderRadius: "0.2rem",
                                                    }}
                                                    // disabled
                                                />
                                                {/*{errors.dateOfVisit !== "" ? (*/}
                                                {/*    <span className={classes.error}>{errors.dateOfVisit}</span>*/}
                                                {/*) : (*/}
                                                {/*    ""*/}
                                                {/*)}*/}
                                            </FormGroup>
                                        </div>
                                        <div className="form-group col-md-4">
                                            <FormGroup>
                                                <Label>
                                                    First Name
                                                    <span style={{color: "red"}}> *</span>
                                                </Label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="firstName"
                                                    id="firstName"
                                                    value={testKitUserDetails.basicUserInfo.firstName}
                                                    // onChange={handleInputChange1}
                                                    onChange={(e) => handleUserInformationInputChange(e, "basicUserInfo")}
                                                    style={{
                                                        border: "1px solid #014D88",
                                                        borderRadius: "0.2rem",
                                                    }}
                                                />
                                                {userInformationErrors.firstName !== "" ? (
                                                    <span
                                                        className={classes.error}>{userInformationErrors.firstName}</span>
                                                ) : (
                                                    ""
                                                )}
                                            </FormGroup>
                                        </div>
                                        <div className="form-group col-md-4">
                                            <FormGroup>
                                                <Label>
                                                    Surname
                                                    <span style={{color: "red"}}> *</span>
                                                </Label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="surname"
                                                    id="surname"
                                                    value={testKitUserDetails.basicUserInfo.surname}
                                                    // onChange={handleInputChange1}
                                                    onChange={(e) => handleUserInformationInputChange(e, "basicUserInfo")}
                                                    style={{
                                                        border: "1px solid #014D88",
                                                        borderRadius: "0.2rem",
                                                    }}
                                                />
                                                {userInformationErrors.surname !== "" ? (
                                                    <span
                                                        className={classes.error}>{userInformationErrors.surname}</span>
                                                ) : (
                                                    ""
                                                )}
                                            </FormGroup>
                                        </div>
                                        <div className="form-group col-md-4">
                                            <FormGroup>
                                                <Label>
                                                    Other name
                                                </Label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="otherName"
                                                    id="otherName"
                                                    value={testKitUserDetails.basicUserInfo.otherName}
                                                    // onChange={handleInputChange1}
                                                    onChange={(e) => handleUserInformationInputChange(e, "basicUserInfo")}
                                                    style={{
                                                        border: "1px solid #014D88",
                                                        borderRadius: "0.2rem",
                                                    }}
                                                />
                                            </FormGroup>
                                        </div>

                                        <div className="form-group  col-md-4">
                                            <FormGroup>
                                                <Label>
                                                    user Category
                                                    <span style={{color: "red"}}> *</span>
                                                </Label>
                                                <select
                                                    className="form-control"
                                                    name="userCategory"
                                                    id="userCategory"
                                                    value={testKitUserDetails.basicUserInfo.userCategory}
                                                    onChange={(e) => handleUserInformationInputChange(e, "basicUserInfo")}
                                                    style={{
                                                        border: "1px solid #014D88",
                                                        borderRadius: "0.2rem",
                                                    }}
                                                >
                                                    <option value={""}></option>
                                                    {/*{options.map(option => (*/}
                                                    {/*    <option key={option.value} value={option.value}>*/}
                                                    {/*        {option.label}*/}
                                                    {/*    </option>*/}
                                                    {/*))}*/}
                                                    {selectedUsers.map((user, index) => (
                                                        <option key={index} value={user}>{user}</option>
                                                    ))}
                                                    ))
                                                </select>
                                                {userInformationErrors.userCategory !== "" ? (
                                                    <span
                                                        className={classes.error}>{userInformationErrors.userCategory}</span>
                                                ) : (
                                                    ""
                                                )}
                                            </FormGroup>
                                        </div>
                                        {testKitUserDetails.basicUserInfo.userCategory === "others" ? (
                                            <div className="form-group col-md-4">
                                                <FormGroup>
                                                    <Label>
                                                        Specify Other Category
                                                        {/*<span style={{color: "red"}}> *</span>*/}
                                                    </Label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="otherCategory"
                                                        id="otherCategory"
                                                        value={testKitUserDetails.basicUserInfo.otherCategory}
                                                        // onChange={handleInputChange1}
                                                        onChange={(e) => handleUserInformationInputChange(e, "basicUserInfo")}
                                                        style={{
                                                            border: "1px solid #014D88",
                                                            borderRadius: "0.2rem",
                                                        }}
                                                    />
                                                </FormGroup>
                                            </div>
                                        ) : ""}
                                        <div className="form-group col-md-4">
                                            <FormGroup>
                                                <Label>
                                                    Client Code
                                                    <span style={{color: "red"}}> *</span>
                                                </Label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="clientCode"
                                                    id="clientCode"
                                                    value={testKitUserDetails.basicUserInfo.clientCode}
                                                    // onChange={handleInputChange1}
                                                    onChange={(e) => handleUserInformationInputChange(e, "basicUserInfo")}
                                                    style={{
                                                        border: "1px solid #014D88",
                                                        borderRadius: "0.2rem",
                                                    }}
                                                />
                                                {userInformationErrors.clientCode !== "" ? (
                                                    <span
                                                        className={classes.error}>{userInformationErrors.clientCode}</span>
                                                ) : (
                                                    ""
                                                )}
                                            </FormGroup>
                                        </div>

                                        <div className="form-group mb-2 col-md-2">
                                            <FormGroup>
                                                <Label>
                                                    Date Of Birth <span style={{color: "red"}}> *</span>
                                                </Label>
                                                <div className="radio">
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            value="Actual"
                                                            name="dateOfBirth"
                                                            defaultChecked
                                                            onChange={(e) => handleDateOfBirthChange(e)}
                                                            style={{
                                                                border: "1px solid #014D88",
                                                                borderRadius: "0.2rem",
                                                            }}
                                                        />{" "}
                                                        Actual
                                                    </label>
                                                </div>
                                                <div className="radio">
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            value="Estimated"
                                                            name="dateOfBirth"
                                                            onChange={(e) => handleDateOfBirthChange(e)}
                                                            style={{
                                                                border: "1px solid #014D88",
                                                                borderRadius: "0.2rem",
                                                            }}
                                                        />{" "}
                                                        Estimated
                                                    </label>
                                                </div>
                                            </FormGroup>
                                        </div>
                                        <div className="form-group mb-3 col-md-3">
                                            <FormGroup>
                                                <Label>
                                                    Date <span style={{color: "red"}}> *</span>
                                                </Label>
                                                <input
                                                    className="form-control"
                                                    type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                                                    name="dob"
                                                    id="dob"
                                                    min="1929-12-31"
                                                    max={moment(new Date()).format("YYYY-MM-DD")}
                                                    value={testKitUserDetails.basicUserInfo.dateOfBirth}
                                                    onChange={handleDobChange}
                                                    style={{
                                                        border: "1px solid #014D88",
                                                        borderRadius: "0.2rem",
                                                    }}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="form-group mb-3 col-md-3">
                                            <FormGroup>
                                                <Label>
                                                    Age <span style={{color: "red"}}> *</span>
                                                </Label>
                                                <input
                                                    className="form-control"
                                                    type="number"
                                                    name="age"
                                                    id="age"
                                                    value={testKitUserDetails.basicUserInfo.age}
                                                    disabled={ageDisabled}
                                                    onChange={handleAgeChange}
                                                    style={{
                                                        border: "1px solid #014D88",
                                                        borderRadius: "0.2rem",
                                                    }}
                                                />
                                            </FormGroup>
                                        </div>

                                        <div className="form-group  col-md-4">
                                            <FormGroup>
                                                <Label>
                                                    Sex
                                                    {/*<span style={{color: "red"}}> *</span> */}
                                                </Label>
                                                <select
                                                    className="form-control"
                                                    name="sex"
                                                    id="sex"
                                                    value={testKitUserDetails.basicUserInfo.sex}
                                                    onChange={(e) => handleUserInformationInputChange(e, "basicUserInfo")}
                                                    style={{
                                                        border: "1px solid #014D88",
                                                        borderRadius: "0.2rem",
                                                    }}
                                                >
                                                    <option value={""}></option>
                                                    {sexs.map((value) => (
                                                        <option key={value.id} value={value.display}>
                                                            {value.display}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormGroup>
                                        </div>
                                        {testKitUserDetails.basicUserInfo.age > 9 && (
                                            <div className="form-group  col-md-4">
                                                <FormGroup>
                                                    <Label>Marital Status</Label>
                                                    <select
                                                        className="form-control"
                                                        name="maritalStatusId"
                                                        id="maritalStatusId"
                                                        value={testKitUserDetails.basicUserInfo.maritalStatusId}
                                                        // onChange={handleInputChange1}
                                                        onChange={(e) => handleUserInformationInputChange(e, "basicUserInfo")}
                                                        style={{
                                                            border: "1px solid #014D88",
                                                            borderRadius: "0.2rem",
                                                        }}
                                                    >
                                                        <option value={""}></option>
                                                        {maritalStatus.map((value) => (
                                                            <option key={value.id} value={value.id}>
                                                                {value.display}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </FormGroup>
                                            </div>
                                        )}
                                        <div className="form-group  col-md-4">
                                            <FormGroup>
                                                <Label> Type of HIV Self-Test </Label>
                                                <select
                                                    className="form-control"
                                                    name="typeOfHivst"
                                                    id="typeOfHivst"
                                                    value={testKitUserDetails.basicUserInfo.typeOfHivst}
                                                    onChange={(e) => handleUserInformationInputChange(e, "basicUserInfo")}
                                                    style={{
                                                        border: "1px solid #014D88",
                                                        borderRadius: "0.2rem",
                                                    }}
                                                >
                                                    <option value={""}></option>
                                                    <option value="Assisted">
                                                        Assisted
                                                    </option>
                                                    <option value="Unassisted">
                                                        Unassisted
                                                    </option>
                                                </select>
                                                {
                                                    userInformationErrors.typeOfHivst !== "" ? (
                                                        <span
                                                            className={classes.error}>{userInformationErrors.typeOfHivst}</span>
                                                    ) : ("")

                                                }
                                            </FormGroup>
                                        </div>
                                        {/*<div className="form-group mb-3 col-md-6">*/}
                                        {/*    <LabelSui*/}
                                        {/*        as="a"*/}
                                        {/*        color="black"*/}
                                        {/*        // onClick={handleSubmitfamilyIndexRequestDto}*/}
                                        {/*        size="small"*/}
                                        {/*        style={{marginTop: 35}}*/}
                                        {/*    >*/}
                                        {/*        <Icon name="plus"/> Add*/}
                                        {/*    </LabelSui>*/}
                                        {/*</div>*/}
                                    </div>


                                </>
                            )}

                            {/*Checkbox to select if the User has conducted the HIVST – if checked, display the*/}
                            {/*following questions, else the user should be able to save the form.*/}
                            {/*<div className="row mb-7">*/}
                            {/*    <div className="form-group mb-3 col-md-4">*/}
                            {/*        <FormGroup>*/}
                            {/*            <label>*/}
                            {/*                <input*/}
                            {/*                    type="checkbox"*/}
                            {/*                    checked={objValues.hasConductedHIVST}*/}
                            {/*                    onChange={() => {*/}
                            {/*                        setObjValues(prevState => ({*/}
                            {/*                            ...prevState,*/}
                            {/*                            hasConductedHIVST: !prevState.hasConductedHIVST*/}
                            {/*                        }));*/}
                            {/*                        // console.log("Has Conducted HIVST", !objValues.hasConductedHIVST);*/}
                            {/*                    }}*/}
                            {/*                    style={{marginRight: "10px"}}*/}
                            {/*                />*/}
                            {/*                Have you conducted the HIVST ?*/}
                            {/*            </label>*/}
                            {/*        </FormGroup>*/}
                            {/*    </div>*/}
                            {/*</div>*/}


                            {objValues && objValues.otherTestKitUserInfoAvailable === "Yes" &&
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <hr style={{width: '100%'}}/>
                                </div>
                            }
                            {objValues && selectedUsers.length > 0 &&
                                <div className="row mb-7">
                                    <div className="form-group  col-md-4">
                                        <FormGroup>
                                            <Label>
                                                Have you conducted the HIVST ?
                                                {/*<span style={{color: "red"}}> *</span>*/}
                                            </Label>
                                            <select
                                                className="form-control"
                                                name="hasConductedHIVST"
                                                id="hasConductedHIVST"
                                                value={objValues.hasConductedHIVST}
                                                onChange={handleInputChange}
                                                style={{
                                                    border: "1px solid #014D88",
                                                    borderRadius: "0.2rem",
                                                }}
                                            >
                                                <option value={""}></option>
                                                <option value="Yes">YES</option>
                                                <option value="No">NO</option>
                                            </select>
                                        </FormGroup>
                                    </div>
                                </div>
                            }
                            <div className="row mb-7">
                                {objValues.hasConductedHIVST === "Yes" ? (
                                    // Display the following questions if the checkbox is checked
                                    <>
                                        <div className="row center">
                                            <div
                                                className="form-group col-md-12 ml-3 text-center pt-2 mb-4"
                                                style={{
                                                    backgroundColor: "green",
                                                    width: "125%",
                                                    height: "35px",
                                                    color: "#fff",
                                                    fontWeight: "bold",
                                                }}
                                            >

                                                Section B : HIVST Post Test Assessment
                                            </div>
                                            <div className="form-group  col-md-4">
                                                <FormGroup>
                                                    <Label >
                                                        Have you ever used HIVST kit?
                                                        {/*<span style={{color: "red"}}> *</span>*/}
                                                    </Label>
                                                    <select
                                                        className="form-control"
                                                        name="everUsedHivstKit"
                                                        id="everUsedHivstKitl"
                                                        // value={objValues.hasConductedHIVST ? "Yes" : "No"}
                                                        value={testKitUserDetails?.postTestAssessment?.everUsedHivstKit}
                                                        onChange={(e) => handleUserInformationInputChange(e, "postTestAssessment")}
                                                        style={{
                                                            border: "1px solid #014D88",
                                                            borderRadius: "0.2rem",
                                                        }}
                                                    >
                                                        <option value={""}></option>
                                                        <option value="Yes">YES</option>
                                                        <option value="No">NO</option>
                                                    </select>
                                                </FormGroup>
                                            </div>
                                            <div className="form-group  col-md-4">
                                                <FormGroup>
                                                    <Label >
                                                        Did you use the HIVST kit for yourself or someone else?
                                                        {/*<span style={{color: "red"}}> *</span>*/}
                                                    </Label>
                                                    <select
                                                        className="form-control"
                                                        name="everUsedHivstKitForSelfOrOthers"
                                                        id="everUsedHivstKitForSelfOrOthers"
                                                        value={testKitUserDetails.postTestAssessment.everUsedHivstKitForSelfOrOthers}
                                                        onChange={(e) => handleUserInformationInputChange(e, "postTestAssessment")}
                                                        style={{
                                                            border: "1px solid #014D88",
                                                            borderRadius: "0.2rem",
                                                        }}
                                                    >
                                                        <option value={""}></option>
                                                        <option value="Self">Self</option>
                                                        <option value="Someone else">Someone else</option>
                                                    </select>
                                                </FormGroup>
                                            </div>
                                            {testKitUserDetails.postTestAssessment.everUsedHivstKitForSelfOrOthers === "Someone else" &&
                                                <div className="form-group  col-md-4">
                                                    <FormGroup>
                                                        <Label >
                                                            Who did you give it to?
                                                            {/*<span style={{color: "red"}}> *</span>*/}
                                                        </Label>
                                                        <select
                                                            className="form-control"
                                                            name="otherHivstKitUserCategory"
                                                            id="otherHivstKitUserCategory"
                                                            value={testKitUserDetails.postTestAssessment.otherHivstKitUserCategory}
                                                            onChange={(e) => handleUserInformationInputChange(e, "postTestAssessment")}
                                                            style={{
                                                                border: "1px solid #014D88",
                                                                borderRadius: "0.2rem",
                                                            }}
                                                        >
                                                            <option value={""}></option>
                                                            {options.map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </FormGroup>
                                                </div>
                                            }
                                            {testKitUserDetails.postTestAssessment?.otherHivstKitUserCategory === "others" ? (
                                                <div className="form-group col-md-4">
                                                    <FormGroup>
                                                        <Label>
                                                            Please Specify Other Category
                                                            {/*<span style={{color: "red"}}> *</span>*/}
                                                        </Label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="otherHivstKitUserCategoryText"
                                                            id="otherHivstKitUserCategoryText"
                                                            value={testKitUserDetails.postTestAssessment.otherHivstKitUserCategoryText}
                                                            onChange={(e) => handleUserInformationInputChange(e, "postTestAssessment")}
                                                            style={{
                                                                border: "1px solid #014D88",
                                                                borderRadius: "0.2rem",
                                                            }}
                                                        />
                                                    </FormGroup>
                                                </div>
                                            ) : ""}

                                            <div className="form-group  col-md-4">
                                                <FormGroup>
                                                    <Label >
                                                        What was the result of the HIVST?
                                                        {/*<span style={{color: "red"}}> *</span>*/}
                                                    </Label>
                                                    <select
                                                        className="form-control"
                                                        name="resultOfHivstTest"
                                                        id="resultOfHivstTest"
                                                        value={testKitUserDetails.postTestAssessment.resultOfHivstTest}
                                                        onChange={(e) => handleUserInformationInputChange(e, "postTestAssessment")}
                                                        style={{
                                                            border: "1px solid #014D88",
                                                            borderRadius: "0.2rem",
                                                        }}
                                                    >
                                                        <option value={""}></option>
                                                        <option value="Reactive">Reactive</option>
                                                        <option value="Non-Reactive">Non Reactive</option>
                                                        <option value="Indeterminate">Indeterminate</option>
                                                    </select>
                                                </FormGroup>
                                            </div>
                                            {testKitUserDetails?.postTestAssessment?.resultOfHivstTest === "Reactive" &&
                                                <div className="form-group  col-md-4">
                                                    <FormGroup>
                                                        <Label >
                                                            Would you like to access HIV testing to confirm my HIVST
                                                            result?
                                                            {/*<span style={{color: "red"}}> *</span>*/}
                                                        </Label>
                                                        <select
                                                            className="form-control"
                                                            name="accessConfirmatoryHts"
                                                            id="accessConfirmatoryHts"
                                                            value={testKitUserDetails.postTestAssessment.accessConfirmatoryHts}
                                                            onChange={(e) => handleUserInformationInputChange(e, "postTestAssessment")}
                                                            style={{
                                                                border: "1px solid #014D88",
                                                                borderRadius: "0.2rem",
                                                            }}
                                                        >
                                                            <option value={""}></option>
                                                            <option value="Yes">YES</option>
                                                            <option value="No">NO</option>
                                                        </select>
                                                    </FormGroup>
                                                </div>
                                            }
                                            {testKitUserDetails?.postTestAssessment?.resultOfHivstTest === "Non-Reactive" &&
                                                <div className="form-group  col-md-4">
                                                    <FormGroup>
                                                        <Label >
                                                            Would you like to be referred for prevention services
                                                            {/*<span style={{color: "red"}}> *</span>*/}
                                                        </Label>
                                                        <select
                                                            className="form-control"
                                                            name="referPreventionServices"
                                                            id="referPreventionServices"
                                                            value={testKitUserDetails.postTestAssessment.referPreventionServices}
                                                            onChange={(e) => handleUserInformationInputChange(e, "postTestAssessment")}
                                                            style={{
                                                                border: "1px solid #014D88",
                                                                borderRadius: "0.2rem",
                                                            }}
                                                        >
                                                            <option value={""}></option>
                                                            <option value="Yes">YES</option>
                                                            <option value="No">NO</option>
                                                        </select>
                                                    </FormGroup>
                                                </div>
                                            }

                                        </div>
                                        {
                                            testKitUserDetails.postTestAssessment
                                            && testKitUserDetails.postTestAssessment.accessConfirmatoryHts === "Yes"
                                            || testKitUserDetails.postTestAssessment.referPreventionServices === "Yes" ?
                                                (
                                                    <div className="row center">
                                                        <div
                                                            className="form-group col-md-12 ml-3 text-center pt-2 mb-4"
                                                            style={{
                                                                backgroundColor: "rgba(25, 96, 176, 0.8)",
                                                                width: "125%",
                                                                height: "35px",
                                                                color: "#fff",
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            Section C : Referral Information
                                                        </div>
                                                        {testKitUserDetails.postTestAssessment.accessConfirmatoryHts === "Yes" && <div className="form-group  col-md-4">
                                                            <FormGroup>
                                                                <Label >
                                                                    Referred for Confirmatory HTS Testing
                                                                    {/*<span style={{color: "red"}}> *</span>*/}
                                                                </Label>
                                                                <select
                                                                    className="form-control"
                                                                    name="referredForConfirmatoryHts"
                                                                    id="referredForConfirmatoryHts"
                                                                    value={testKitUserDetails.postTestAssessment.referralInformation.referredForConfirmatoryHts}
                                                                    onChange={(e) => handleUserInformationInputChange(e, "postTestAssessment")}
                                                                    style={{
                                                                        border: "1px solid #014D88",
                                                                        borderRadius: "0.2rem",
                                                                    }}
                                                                >
                                                                    <option value={""}></option>
                                                                    <option value="Yes">YES</option>
                                                                    <option value="No">NO</option>
                                                                </select>
                                                            </FormGroup>
                                                        </div>}
                                                        {testKitUserDetails.postTestAssessment.referralInformation && testKitUserDetails.postTestAssessment.referralInformation.referredForConfirmatoryHts === "Yes" &&
                                                            <div className="form-group mb-3 col-md-4">
                                                                <FormGroup>
                                                                    <Label for="">
                                                                        Date referred for confirmatory HTS testing
                                                                        field
                                                                        {/*<span style={{color: "red"}}> *</span>*/}
                                                                    </Label>
                                                                    <Input
                                                                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                                                                        name="dateReferredForConfirmatoryHts"
                                                                        id="dateReferredForConfirmatoryHts"
                                                                        value={testKitUserDetails.postTestAssessment.referralInformation.dateReferredForConfirmatoryHts}
                                                                        onChange={(e) => handleUserInformationInputChange(e, "postTestAssessment")}

                                                                        min={objValues.dateOfVisit}
                                                                        max={moment(new Date()).format("YYYY-MM-DD")}
                                                                        style={{
                                                                            border: "1px solid #014D88",
                                                                            borderRadius: "0.25rem",
                                                                        }}
                                                                    />
                                                                </FormGroup>
                                                            </div>}
                                                        {testKitUserDetails.postTestAssessment.referralInformation && testKitUserDetails?.postTestAssessment?.referPreventionServices === "Yes" &&
                                                            <div className="form-group  col-md-4">
                                                                <FormGroup>
                                                                    <Label >
                                                                        Referred for Prevention Services
                                                                        {/*<span style={{color: "red"}}> *</span>*/}
                                                                    </Label>
                                                                    <select
                                                                        className="form-control"
                                                                        name="referredForPreventionServices"
                                                                        id="referredForPreventionServices"
                                                                        value={testKitUserDetails.postTestAssessment.referralInformation.referredForPreventionServices}
                                                                        onChange={(e) => handleUserInformationInputChange(e, "postTestAssessment")}

                                                                        style={{
                                                                            border: "1px solid #014D88",
                                                                            borderRadius: "0.2rem",
                                                                        }}
                                                                    >
                                                                        <option value={""}></option>
                                                                        <option value="Yes">YES</option>
                                                                        <option value="No">NO</option>
                                                                    </select>
                                                                </FormGroup>
                                                            </div>
                                                        }
                                                        {testKitUserDetails.postTestAssessment.referralInformation && testKitUserDetails.postTestAssessment.referralInformation.referredForPreventionServices === "Yes" &&
                                                            <div className="form-group mb-3 col-md-4">
                                                                <FormGroup>
                                                                    <Label for="">
                                                                        Date referred for prevention services
                                                                        {/*<span style={{color: "red"}}> *</span>*/}
                                                                    </Label>
                                                                    <Input
                                                                        type="date"                       onKeyPress={(e)=>{e.preventDefault()}}

                                                                        name="dateReferredForPreventionServices"
                                                                        id="dateReferredForPreventionServices"
                                                                        value={testKitUserDetails.postTestAssessment.referralInformation.dateReferredForPreventionServices}
                                                                        onChange={(e) => handleUserInformationInputChange(e, "postTestAssessment")}
                                                                        min={objValues.dateOfVisit}
                                                                        max={moment(new Date()).format("YYYY-MM-DD")}
                                                                        style={{
                                                                            border: "1px solid #014D88",
                                                                            borderRadius: "0.25rem",
                                                                        }}
                                                                    />
                                                                    {/*{errors.dateOfVisit !== "" ? (*/}
                                                                    {/*    <span className={classes.error}>{errors.dateOfVisit}</span>*/}
                                                                    {/*) : (*/}
                                                                    {/*    ""*/}
                                                                    {/*)}*/}
                                                                </FormGroup>
                                                            </div>
                                                        }

                                                    </div>) : ""}
                                    </>
                                  ) : ( ""
                                    // Display the save form button if the checkbox is not checked
                                    // <div className="row">
                                    //     {// if selected user  is myself only show save button and save secondary user information
                                    //         selectedUsers && selectedUsers.length === 1 && selectedUsers[0] === "myself" &&
                                    //         <div className="form-group mb-3 col-md-6">
                                    //             <Button
                                    //                 content="save myself information"
                                    //                 icon="save"
                                    //                 labelPosition="right"
                                    //                 style={{backgroundColor: "#014d88", color: "#fff"}}
                                    //                 onClick={handleSubmit}
                                    //                 disabled={saving}
                                    //             />
                                    //         </div>
                                    //     }
                                    //
                                    // </div>
                                )}
                            </div>
                            {selectedUsers.length > 0 && <div className="row">
                                <div className="form-group mb-3 col-md-6">
                                    <LabelSui
                                        as="a"
                                        color="black"
                                        onClick={addUserInformation}
                                        size="small"
                                        style={{marginTop: 35}}
                                    >
                                        <Icon name="plus"/> Add
                                    </LabelSui>
                                </div>
                            </div>
                            }
                            {/*added kit user */}
                            {userInformationList.length > 0 ? (
                                <div class="row">
                                    <List className="mb-5">
                                        <Table striped responsive>
                                            <thead style={{
                                                backgroundColor: "#014D88",
                                                color: "white",
                                                fontSize: "10px"
                                            }}>
                                            <tr>
                                                <th>Client Code</th>
                                                <th>HIV Self Test Type</th>
                                                {/*<th>Ever used HIVST Kit</th>*/}
                                                <th>User Category</th>
                                                <th>Action</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {userInformationList.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.basicUserInfo.clientCode}</td>
                                                    <td>{item.basicUserInfo.typeOfHivst}</td>
                                                    {/*<th>{item.postTestAssessment.everUsedHivstKit}</th>*/}
                                                    <td>{item.basicUserInfo.userCategory}</td>
                                                    <td>
                                                        <IconButton
                                                            aria-label="delete"
                                                            size="small"
                                                            color="error"
                                                            onClick={() => removeUserInformation(index)}
                                                        >
                                                            <DeleteIcon fontSize="inherit"/>
                                                        </IconButton>
                                                        {/*<IconButton>*/}
                                                        {/*    <EditIcon fontSize="inherit"/>*/}
                                                        {/*</IconButton>*/}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                    </List>
                                </div>
                                ) : " "}
                            {/*{selectedUsers.length > 0 &&*/}
                            {/*    <div className="row">*/}
                            {/*        <div className="form-group mb-3 col-md-6">*/}
                            {/*            <Button*/}
                            {/*                content="save"*/}
                            {/*                icon="save"*/}
                            {/*                labelPosition="right"*/}
                            {/*                style={{backgroundColor: "#014d88", color: "#fff"}}*/}
                            {/*                onClick={handleSubmit}*/}
                            {/*                // disabled={saving}*/}
                            {/*                disabled={userInformationList.length === 0}*/}
                            {/*            />*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*}*/}

                            {
                                objValues?.otherTestKitUserInfoAvailable === "No" ?
                                    (
                                        <div className="row mb-7">
                                            <div className="form-group mb-3 col-md-6">
                                                <Button
                                                    content="Save without user Info"
                                                    icon="save"
                                                    labelPosition="right"
                                                    style={{backgroundColor: "#014d88", color: "#fff"}}
                                                    onClick={handleSubmit}
                                                    disabled={saving}
                                                />
                                            </div>
                                        </div>
                                    ) :
                                    (
                                        <div className="row">
                                            <div className="form-group mb-3 col-md-6">
                                                <Button
                                                    content="Save"
                                                    icon="save"
                                                    labelPosition="right"
                                                    style={{backgroundColor: "#014d88", color: "#fff"}}
                                                    onClick={handleSubmit}
                                                    disabled={userInformationList.length === 0}
                                                />
                                            </div>
                                        </div>
                                    )
                            }

                        </div>

                    </form>
                </CardBody>
            </Card>

            <Modal
                show={open}
                toggle={toggle}
                className="fade"
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Notification!
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>Are you Sure of the Age entered?</h4>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={toggle}
                        style={{ backgroundColor: "#014d88", color: "#fff" }}
                    >
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
export default HIVSTPatientRegistration;
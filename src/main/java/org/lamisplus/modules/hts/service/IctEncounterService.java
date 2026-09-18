package org.lamisplus.modules.hts.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.hts.domain.dto.*;
import org.lamisplus.modules.hts.domain.entity.HtsEncounter;
import org.lamisplus.modules.hts.domain.entity.IctContact;
import org.lamisplus.modules.hts.domain.entity.IctEncounter;
import org.lamisplus.modules.hts.repository.HtsEncounterRepository;
import org.lamisplus.modules.hts.repository.IctContactRepository;
import org.lamisplus.modules.hts.repository.IctEncounterRepository;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IctEncounterService {

    private final IctEncounterRepository ictEncounterRepository;
    private final IctContactRepository ictContactRepository;
    private final HtsEncounterRepository htsEncounterRepository;
    private final PersonRepository personRepository;
    private final ObjectMapper objectMapper;

    private HtsEncounter validateAndFetchConfirmedPositiveHts(Long htsEncounterId) {
        HtsEncounter hts = findHtsOrThrow(htsEncounterId);
        JsonNode obs = hts.getObservation();

        boolean confirmatoryPositive = obs != null && obs.has("confirmatoryHivTest")
                && "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE".equals(obs.get("confirmatoryHivTest").asText());
        boolean finalResultPositive = obs != null && obs.has("finalHivTestResult")
                && "Positive".equalsIgnoreCase(obs.get("finalHivTestResult").asText());

        if (!confirmatoryPositive && !finalResultPositive) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "ICT encounter can only be created for a client with a confirmed positive HIV test result.");
        }
        return hts;
    }

    // Person.getUuid() returns Object (legacy data can hold either a UUID or a String) -
    // this mirrors the exact instanceof handling already used inline in save() below, as a
    // reusable helper for the Transfer-In check, which needs a String.
    private String personUuidAsString(Person person) {
        if (person == null) {
            return null;
        }
        Object uuid = person.getUuid();
        if (uuid instanceof UUID) {
            return uuid.toString();
        }
        if (uuid instanceof String) {
            return (String) uuid;
        }
        return uuid != null ? uuid.toString() : null;
    }

    public IctEncounterResponse save(IctEncounterRequest request) {
        Person person = findPersonOrThrow(request.getPatientId());

        IctEncounter encounter = new IctEncounter();
        encounter.setPerson(person);

        Object uuid = person.getUuid();
        if (uuid instanceof UUID) {
            encounter.setPatientUuid((UUID) uuid);
        } else if (uuid instanceof String) {
            encounter.setPatientUuid(UUID.fromString((String) uuid));
        }

        encounter.setFacilityId(request.getFacilityId());
        mapRequestToEncounter(request, encounter);

        boolean createdViaTransferIn = false;

        if (request.getHtsEncounterId() != null) {
            HtsEncounter hts = validateAndFetchConfirmedPositiveHts(request.getHtsEncounterId());
            encounter.setHtsEncounter(hts);
            if (hts.getUuid() != null) {
                encounter.setHtsEncounterUuid(hts.getUuid().toString());
            }
        } else {
            // No HTS link provided - the only other path to ICT eligibility is a documented,
            // active HIV Transfer-In record (a transfer-in patient is, by definition, already
            // confirmed positive at their originating facility - the transfer-in table itself
            // has no separate HIV-status field, so presence in it IS the proof). This closes
            // the previous gap where omitting htsEncounterId skipped validation entirely.
            boolean activeTransferIn = htsEncounterRepository.existsActiveHivTransferInForPerson(
                    person.getId(), personUuidAsString(person));

            if (!activeTransferIn) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "ICT encounter can only be created for a client with a confirmed positive HTS result, " +
                                "or a patient with a documented, active HIV Transfer-In record.");
            }
            createdViaTransferIn = true;
        }

        if (createdViaTransferIn) {
            // Audit marker - only set when the Transfer-In exception is the actual reason
            // this record was allowed through, not when a valid HTS link was also provided.
            ((ObjectNode) encounter.getData()).put("createdViaTransferInException", true);
        }

        IctEncounter savedEncounter = ictEncounterRepository.save(encounter);

        List<IctContact> contacts = buildContacts(request.getContacts(), savedEncounter);
        if (!contacts.isEmpty()) {
            ictContactRepository.saveAll(contacts);
            savedEncounter.getContacts().addAll(contacts);
        }

        return toResponse(savedEncounter);
    }
    private List<IctContact> buildContacts(List<IctContactRequest> contactRequests, IctEncounter encounter) {
        if (contactRequests == null || contactRequests.isEmpty()) {
            return new ArrayList<>();
        }
        return contactRequests.stream()
                .map(cr -> mapToContact(cr, encounter))
                .collect(Collectors.toList());
    }

    public IctEncounterResponse getById(Long id) {
        return toResponse(findActiveOrThrow(id));
    }

    public List<IctEncounterResponse> getByPatientId(Long patientId) {
        return ictEncounterRepository
                .findByPerson_IdAndArchivedOrderByIdDesc(patientId, false)

//                .findByPerson_IdAndArchivedOrderByDateOfServiceDesc(patientId, false)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public IctEncounterResponse getByHtsEncounterId(Long htsEncounterId) {
        return ictEncounterRepository
                .findByHtsEncounter_IdAndArchived(htsEncounterId, false)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No ICT encounter found for HTS encounter id " + htsEncounterId));
    }

    public Page<IctEncounterResponse> search(Long facilityId, String search, Pageable pageable) {
        return ictEncounterRepository
                .search(facilityId, search, pageable)
                .map(this::toResponse);
    }

    public IctEncounterResponse update(Long id, IctEncounterRequest request) {
        IctEncounter encounter = findActiveOrThrow(id);

        // Capture BEFORE mapRequestToEncounter() rebuilds `data` from scratch, wholesale -
        // the exact same issue found on the HTS side (observation replaced entirely on every
        // update, not merged). Needed to grandfather an already-legitimate Transfer-In-sourced
        // record when this particular edit doesn't (re)provide an HTS link.
        JsonNode existingData = encounter.getData();
        boolean previouslyCreatedViaTransferIn = existingData != null
                && existingData.has("createdViaTransferInException")
                && existingData.get("createdViaTransferInException").asBoolean(false);

        mapRequestToEncounter(request, encounter);

        boolean createdViaTransferIn = false;

        if (request.getHtsEncounterId() != null) {
            HtsEncounter hts = validateAndFetchConfirmedPositiveHts(request.getHtsEncounterId());
            encounter.setHtsEncounter(hts);
            if (hts.getUuid() != null) {
                encounter.setHtsEncounterUuid(hts.getUuid().toString());
            } else {
                encounter.setHtsEncounterUuid(null);
            }
            // A valid HTS link is now the record's justification - the marker is recomputed
            // fresh each save based on THIS save's actual justification, not carried forward
            // permanently once set.
        } else {
            // No HTS link (kept or newly provided) - eligibility must come from Transfer-In,
            // either grandfathered from how this record was originally created (so a patient
            // whose Transfer-In status is later closed out doesn't have an already-legitimate
            // record become permanently un-editable), or currently active.
            Person person = encounter.getPerson();
            boolean currentlyActiveTransferIn = htsEncounterRepository.existsActiveHivTransferInForPerson(
                    person != null ? person.getId() : null, personUuidAsString(person));

            if (!previouslyCreatedViaTransferIn && !currentlyActiveTransferIn) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "This ICT encounter has no confirmed-positive HTS record linked, and the patient does " +
                                "not have an active HIV Transfer-In record. An ICT encounter must be linked to a " +
                                "confirmed positive HTS result or belong to a patient with a documented Transfer-In " +
                                "record.");
            }

            encounter.setHtsEncounter(null);
            encounter.setHtsEncounterUuid(null);
            createdViaTransferIn = true;
        }

        if (createdViaTransferIn) {
            ((ObjectNode) encounter.getData()).put("createdViaTransferInException", true);
        }

        encounter.getContacts().clear();
        addContactsToEncounter(request.getContacts(), encounter);

        IctEncounter updated = ictEncounterRepository.save(encounter);
        return toResponse(updated);
    }
    public void delete(Long id) {
        IctEncounter encounter = findActiveOrThrow(id);
        encounter.setArchived(true);
        List<IctContact> contacts = ictContactRepository.findByIctEncounter_IdAndArchivedOrderById(id, false);
        contacts.forEach(c -> c.setArchived(true));
        ictContactRepository.saveAll(contacts);
        ictEncounterRepository.save(encounter);
    }

    private void mapRequestToEncounter(IctEncounterRequest req, IctEncounter e) {
        e.setDateOfService(req.getDateOfService());
        e.setSetting(req.getSetting());
        e.setClientCategory(req.getClientCategory());
        e.setClientCategoryOther(req.getClientCategoryOther());
        e.setOfferedPns(req.getOfferedPns());
        e.setAcceptedPns(req.getAcceptedPns());

        ObjectNode data = objectMapper.createObjectNode();
        putIfNotNull(data, "facilitySetting",     req.getFacilitySetting());
        putIfNotNull(data, "communityEntryPoint",  req.getCommunityEntryPoint());
        putIfNotNull(data, "artClinic",            req.getArtClinic());
//        putIfNotNull(data, "clientCategoryOther",  req.getClientCategoryOther());
        putIfNotNull(data, "indexClientId",        req.getIndexClientId());
        putIfNotNull(data, "artUniqueId",          req.getArtUniqueId());
        putIfNotNull(data, "indexFirstName",       req.getIndexFirstName());
        putIfNotNull(data, "indexMiddleName",      req.getIndexMiddleName());
        putIfNotNull(data, "indexSurname",         req.getIndexSurname());
        putIfNotNull(data, "indexSex",             req.getIndexSex());
        putIfNotNull(data, "indexPhone",           req.getIndexPhone());
        putIfNotNull(data, "indexAltPhone",        req.getIndexAltPhone());
        putIfNotNull(data, "indexAddress",         req.getIndexAddress());
        putIfNotNull(data, "facilityName", req.getFacilityName());
        putIfNotNull(data, "state",        req.getState());
        putIfNotNull(data, "lga",          req.getLga());
        if (req.getIndexDob() != null) data.put("indexDob", req.getIndexDob().toString());
        if (req.getIndexAge() != null) data.put("indexAge", req.getIndexAge());

        e.setData(data);
    }

    private void addContactsToEncounter(List<IctContactRequest> contactRequests, IctEncounter encounter) {
        if (contactRequests == null || contactRequests.isEmpty()) return;
        contactRequests.stream()
                .map(cr -> mapToContact(cr, encounter))
                .forEach(encounter.getContacts()::add);
    }

    private IctContact mapToContact(IctContactRequest cr, IctEncounter encounter) {
        IctContact c = new IctContact();
        c.setIctEncounter(encounter);
        c.setFacilityId(encounter.getFacilityId());
        c.setContactCode(cr.getContactCode());
        c.setFirstName(cr.getFirstName());
        c.setMiddleName(cr.getMiddleName());
        c.setSurname(cr.getSurname());
        c.setRelationshipToIndex(cr.getRelationshipToIndex());
        c.setSex(cr.getSex());
        c.setPhone(cr.getPhone());
        c.setAge(cr.getAge());
        c.setAddress(cr.getAddress());
        c.setSameAddressAsIndex(Boolean.TRUE.equals(cr.getSameAddressAsIndex()));
        c.setNotificationMethod(cr.getNotificationMethod());
        c.setFollowUpLocation(cr.getFollowUpLocation());
        c.setAttempts(cr.getAttempts() != null ? cr.getAttempts() : 0);
        c.setKnownHivPositive(cr.getKnownHivPositive());
        c.setHivTestResult(cr.getHivTestResult());
        c.setDateTestedHiv(cr.getDateTestedHiv());
        c.setDateEnrolledArt(cr.getDateEnrolledArt());
        c.setArtClinic(cr.getArtClinic());
        c.setOnArt(cr.getOnArt());
        c.setEnrolledInOvc(Boolean.TRUE.equals(cr.getEnrolledInOvc()));
        c.setDateEnrolledOvc(cr.getDateEnrolledOvc());
        c.setOvcId(cr.getOvcId());

        if (encounter.getUuid() != null) {
            c.setIctEncounterUuid(encounter.getUuid().toString());
        }

        return c;
    }



    private IctEncounterResponse toResponse(IctEncounter e) {
        IctEncounterResponse r = new IctEncounterResponse();
        r.setId(e.getId());
        r.setUuid(e.getUuid());
        r.setPatientId(e.getPerson() != null ? e.getPerson().getId() : null);
        r.setPatientUuid(e.getPatientUuid());
        r.setHtsEncounterId(e.getHtsEncounter() != null ? e.getHtsEncounter().getId() : null);
        r.setFacilityId(e.getFacilityId());
        r.setDateOfService(e.getDateOfService());
        r.setSetting(e.getSetting());
        r.setClientCategory(e.getClientCategory());
        r.setClientCategoryOther(e.getClientCategoryOther());
        r.setOfferedPns(e.getOfferedPns());
        r.setAcceptedPns(e.getAcceptedPns());
        r.setData(e.getData());

        List<IctContactResponse> contactResponses =
                ictContactRepository.findByIctEncounter_IdAndArchivedOrderById(e.getId(), false)
                        .stream()
                        .map(this::toContactResponse)
                        .collect(Collectors.toList());
        r.setContacts(contactResponses);
        return r;
    }

    private IctContactResponse toContactResponse(IctContact c) {
        IctContactResponse r = new IctContactResponse();
        r.setId(c.getId());
        r.setUuid(c.getUuid());
        r.setContactCode(c.getContactCode());
        r.setFirstName(c.getFirstName());
        r.setMiddleName(c.getMiddleName());
        r.setSurname(c.getSurname());
        r.setRelationshipToIndex(c.getRelationshipToIndex());
        r.setSex(c.getSex());
        r.setPhone(c.getPhone());
        r.setAge(c.getAge());
        r.setAddress(c.getAddress());
        r.setSameAddressAsIndex(c.getSameAddressAsIndex());
        r.setNotificationMethod(c.getNotificationMethod());
        r.setFollowUpLocation(c.getFollowUpLocation());
        r.setAttempts(c.getAttempts());
        r.setKnownHivPositive(c.getKnownHivPositive());
        r.setHivTestResult(c.getHivTestResult());
        r.setDateTestedHiv(c.getDateTestedHiv());
        r.setDateEnrolledArt(c.getDateEnrolledArt());
        r.setArtClinic(c.getArtClinic());
        r.setOnArt(c.getOnArt());
        r.setEnrolledInOvc(c.getEnrolledInOvc());
        r.setDateEnrolledOvc(c.getDateEnrolledOvc());
        r.setOvcId(c.getOvcId());
        return r;
    }

    private IctEncounter findActiveOrThrow(Long id) {
        return ictEncounterRepository.findByIdAndArchived(id, false)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "ICT encounter not found with id " + id));
    }

    private Person findPersonOrThrow(Long patientId) {
        return personRepository.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Person not found with id " + patientId));
    }

    private HtsEncounter findHtsOrThrow(Long htsId) {
        return htsEncounterRepository.findByIdAndArchived(htsId, false)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "HTS encounter not found with id " + htsId));
    }

    private void putIfNotNull(ObjectNode node, String key, String value) {
        if (value != null) node.put(key, value);
    }
}
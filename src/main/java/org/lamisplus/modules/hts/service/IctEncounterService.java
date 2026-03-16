package org.lamisplus.modules.hts.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
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

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public IctEncounterResponse save(IctEncounterRequest request) {
        Person person = findPersonOrThrow(request.getPersonId());

        IctEncounter encounter = new IctEncounter();
        encounter.setPerson(person);
        encounter.setFacilityId(request.getFacilityId());
        mapRequestToEncounter(request, encounter);

        // Link HTS encounter if provided
        if (request.getHtsEncounterId() != null) {
            HtsEncounter hts = findHtsOrThrow(request.getHtsEncounterId());
            encounter.setHtsEncounter(hts);
        }

        IctEncounter saved = ictEncounterRepository.save(encounter);

        // Persist contacts
        persistContacts(request.getContacts(), saved);

        return toResponse(saved);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public IctEncounterResponse getById(Long id) {
        return toResponse(findActiveOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<IctEncounterResponse> getByPersonId(Long personId) {
        return ictEncounterRepository
                .findByPerson_IdAndArchivedOrderByDateOfServiceDesc(personId, 0)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IctEncounterResponse getByHtsEncounterId(Long htsEncounterId) {
        return ictEncounterRepository
                .findByHtsEncounter_IdAndArchived(htsEncounterId, 0)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No ICT encounter found for HTS encounter id " + htsEncounterId));
    }

    @Transactional(readOnly = true)
    public Page<IctEncounterResponse> search(Long facilityId, String search, Pageable pageable) {
        return ictEncounterRepository
                .search(facilityId, search, pageable)
                .map(this::toResponse);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public IctEncounterResponse update(Long id, IctEncounterRequest request) {
        IctEncounter encounter = findActiveOrThrow(id);
        mapRequestToEncounter(request, encounter);

        // Re-link HTS encounter if a new one is provided
        if (request.getHtsEncounterId() != null) {
            HtsEncounter hts = findHtsOrThrow(request.getHtsEncounterId());
            encounter.setHtsEncounter(hts);
        }

        // Replace contacts wholesale: delete existing, re-persist from request.
        // This is intentionally simple — contacts are fully owned by the encounter
        // and there is no independent contact lifecycle to preserve.
        ictContactRepository.deleteAllByIctEncounterId(id);
        persistContacts(request.getContacts(), encounter);

        IctEncounter updated = ictEncounterRepository.save(encounter);
        return toResponse(updated);
    }

    // ── Delete (soft) ─────────────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        IctEncounter encounter = findActiveOrThrow(id);
        encounter.setArchived(1);

        // Soft-delete contacts as well so they don't leak into queries
        List<IctContact> contacts =
                ictContactRepository.findByIctEncounter_IdAndArchivedOrderById(id, 0);
        contacts.forEach(c -> c.setArchived(1));
        ictContactRepository.saveAll(contacts);

        ictEncounterRepository.save(encounter);
    }

    // ── Mapping helpers ───────────────────────────────────────────────────────

    private void mapRequestToEncounter(IctEncounterRequest req, IctEncounter e) {
        e.setDateOfService(req.getDateOfService());
        e.setSetting(req.getSetting());
        e.setClientCategory(req.getClientCategory());
        e.setOfferedPns(req.getOfferedPns());
        e.setAcceptedPns(req.getAcceptedPns());

        // Build JSONB data node for overflow fields
        ObjectNode data = objectMapper.createObjectNode();
        putIfNotNull(data, "facilitySetting",     req.getFacilitySetting());
        putIfNotNull(data, "communityEntryPoint",  req.getCommunityEntryPoint());
        putIfNotNull(data, "artClinic",            req.getArtClinic());
        putIfNotNull(data, "clientCategoryOther",  req.getClientCategoryOther());

        // Index client snapshot — stored in JSONB, not separate columns,
        // because this is read-only context data, not independently queryable.
        putIfNotNull(data, "indexClientId",    req.getIndexClientId());
        putIfNotNull(data, "artUniqueId",      req.getArtUniqueId());
        putIfNotNull(data, "indexFirstName",   req.getIndexFirstName());
        putIfNotNull(data, "indexMiddleName",  req.getIndexMiddleName());
        putIfNotNull(data, "indexSurname",     req.getIndexSurname());
        putIfNotNull(data, "indexSex",         req.getIndexSex());
        putIfNotNull(data, "indexPhone",       req.getIndexPhone());
        putIfNotNull(data, "indexAltPhone",    req.getIndexAltPhone());
        putIfNotNull(data, "indexAddress",     req.getIndexAddress());

        if (req.getIndexDob() != null)  data.put("indexDob",  req.getIndexDob().toString());
        if (req.getIndexAge() != null)  data.put("indexAge",  req.getIndexAge());

        e.setData(data);
    }

    private void persistContacts(List<IctContactRequest> contactRequests, IctEncounter encounter) {
        if (contactRequests == null || contactRequests.isEmpty()) return;

        List<IctContact> contacts = contactRequests.stream()
                .map(cr -> mapToContact(cr, encounter))
                .collect(Collectors.toList());

        ictContactRepository.saveAll(contacts);
    }

    private IctContact mapToContact(IctContactRequest cr, IctEncounter encounter) {
        IctContact c = new IctContact();
        c.setIctEncounter(encounter);
        c.setContactId(cr.getContactId());
        c.setNameOfContact(cr.getNameOfContact());
        c.setRelationshipToIndex(cr.getRelationshipToIndex());
        c.setContactSex(cr.getContactSex());
        c.setContactAgeGroup(cr.getContactAgeGroup());
        c.setContactPhone(cr.getContactPhone());
        c.setContactAddress(cr.getContactAddress());
        c.setSameAddressAsIndex(Boolean.TRUE.equals(cr.getSameAddressAsIndex()));
        c.setNotificationMethod(cr.getNotificationMethod());
        c.setFollowUpLocation(cr.getFollowUpLocation());
        c.setAttempts(cr.getAttempts() != null ? cr.getAttempts() : 0);
        c.setKnownHivPositive(cr.getKnownHivPositive());
        c.setHivTestResult(cr.getHivTestResult());
        c.setDateTestedHiv(cr.getDateTestedHiv());
        c.setDateEnrolledArt(cr.getDateEnrolledArt());
        c.setEnrolledInOvc(Boolean.TRUE.equals(cr.getEnrolledInOvc()));
        c.setDateEnrolledOvc(cr.getDateEnrolledOvc());
        c.setOvcId(cr.getOvcId());
        return c;
    }

    // ── Response mappers ──────────────────────────────────────────────────────

    private IctEncounterResponse toResponse(IctEncounter e) {
        IctEncounterResponse r = new IctEncounterResponse();
        r.setId(e.getId());
        r.setUuid(e.getUuid());
        r.setPersonId(e.getPerson() != null ? e.getPerson().getId() : null);
        r.setHtsEncounterId(e.getHtsEncounter() != null ? e.getHtsEncounter().getId() : null);
        r.setFacilityId(e.getFacilityId());
        r.setDateOfService(e.getDateOfService());
        r.setSetting(e.getSetting());
        r.setClientCategory(e.getClientCategory());
        r.setOfferedPns(e.getOfferedPns());
        r.setAcceptedPns(e.getAcceptedPns());
        r.setData(e.getData());

        // Load contacts for this encounter
        List<IctContactResponse> contactResponses =
                ictContactRepository.findByIctEncounter_IdAndArchivedOrderById(e.getId(), 0)
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
        r.setContactId(c.getContactId());
        r.setNameOfContact(c.getNameOfContact());
        r.setRelationshipToIndex(c.getRelationshipToIndex());
        r.setContactSex(c.getContactSex());
        r.setContactAgeGroup(c.getContactAgeGroup());
        r.setContactPhone(c.getContactPhone());
        r.setContactAddress(c.getContactAddress());
        r.setSameAddressAsIndex(c.getSameAddressAsIndex());
        r.setNotificationMethod(c.getNotificationMethod());
        r.setFollowUpLocation(c.getFollowUpLocation());
        r.setAttempts(c.getAttempts());
        r.setKnownHivPositive(c.getKnownHivPositive());
        r.setHivTestResult(c.getHivTestResult());
        r.setDateTestedHiv(c.getDateTestedHiv());
        r.setDateEnrolledArt(c.getDateEnrolledArt());
        r.setEnrolledInOvc(c.getEnrolledInOvc());
        r.setDateEnrolledOvc(c.getDateEnrolledOvc());
        r.setOvcId(c.getOvcId());
        return r;
    }

    // ── Lookup helpers ────────────────────────────────────────────────────────

    private IctEncounter findActiveOrThrow(Long id) {
        return ictEncounterRepository.findByIdAndArchived(id, 0)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "ICT encounter not found with id " + id));
    }

    private Person findPersonOrThrow(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Person not found with id " + personId));
    }

    private HtsEncounter findHtsOrThrow(Long htsId) {
        return htsEncounterRepository.findByIdAndArchived(htsId, 0)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "HTS encounter not found with id " + htsId));
    }

    private void putIfNotNull(ObjectNode node, String key, String value) {
        if (value != null) node.put(key, value);
    }
}
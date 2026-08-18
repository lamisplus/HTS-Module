package org.lamisplus.modules.hts.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;

/**
 * Service that answers uniqueness checks for any client-code string.
 *
 * Uses {@link EntityManager} with a native SQL query directly - no Spring Data
 * repository interface is needed because there is no JPA entity backing this
 * query (it spans three tables).
 *
 * Four locations are checked in a single UNION ALL query:
 * 1. hts_encounter.client_code
 * 2. hts_encounter.observation->>'indexClientCode' (JSONB)
 * 3. hts_ict_encounter.data->>'indexClientId' (JSONB)
 * 4. hts_ict_contact.contact_code
 */
@Service
@Slf4j
public class ClientCodeUniquenessService {

    /**
     * Injected by the JPA container - no constructor argument needed, so
     * {@code @RequiredArgsConstructor} is intentionally omitted here.
     */
    @PersistenceContext
    private EntityManager entityManager;

    private static final String EXISTS_SQL =
            // 1. HTS client_code
            "SELECT 1 FROM hts_encounter " +
                    "WHERE archived = false AND client_code ILIKE :code " +
                    "UNION ALL " +
                    // 2. HTS observation->>'indexClientCode'
                    "SELECT 1 FROM hts_encounter " +
                    "WHERE archived = false AND observation IS NOT NULL " +
                    "AND observation->>'indexClientCode' ILIKE :code " +
                    "UNION ALL " +
                    // 3. ICT data->>'indexClientId'
                    "SELECT 1 FROM hts_ict_encounter " +
                    "WHERE archived = false AND data IS NOT NULL " +
                    "AND data->>'indexClientId' ILIKE :code " +
                    "UNION ALL " +
                    // 4. ICT contact_code
                    "SELECT 1 FROM hts_ict_contact " +
                    "WHERE archived = false AND contact_code ILIKE :code " +
                    "LIMIT 1";

    /**
     * Returns {@code true} when the supplied {@code clientCode} already exists
     * in any of the four locations searched. The check is case-insensitive.
     * Blank / null inputs always return {@code false}.
     *
     * @param clientCode the raw code string typed by the user
     * @return {@code true} if taken, {@code false} if available
     */
    public boolean isClientCodeTaken(String clientCode) {
        if (clientCode == null || clientCode.trim().isEmpty()) {
            return false;
        }
        String trimmed = clientCode.trim();
        // log.debug("Checking uniqueness for client code: {}", trimmed);

        @SuppressWarnings("unchecked")
        List<Object> results = entityManager
                .createNativeQuery(EXISTS_SQL)
                .setParameter("code", trimmed)
                .getResultList();

        return !results.isEmpty();
    }
}
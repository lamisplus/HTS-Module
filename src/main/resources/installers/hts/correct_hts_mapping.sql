UPDATE hts_encounter
SET
    observation = jsonb_set(
            observation,
            '{facilitySetting}',
            to_jsonb(
                    CASE
                        WHEN (observation->>'facilitySetting' = 'POINT_ENTRY_OTHERS'
                            AND setting = 'Community')
                            THEN 'COMMUNITY_HTS_TEST_SETTING_OUTREACH'

                        WHEN (observation->>'facilitySetting' = 'TEST_SETTING_CPMTCT'
                            AND setting = 'HTS_ENTRY_POINT_COMMUNITY')
                            THEN 'COMMUNITY_HTS_TEST_SETTING_STANDALONE_HTS'

                        WHEN (observation->>'facilitySetting' = 'TEST_SETTING_STANDALONE_HTS'
                            AND setting = 'Facility')
                            THEN 'FACILITY_HTS_TEST_SETTING_STANDALONE_HTS'

                        -- FIXME: This branch was previously duplicated with the one above
                        -- (identical WHEN condition), so it was unreachable.  Replace the
                        -- condition below with the correct source value for ANC, then
                        -- remove this comment.
                        WHEN (observation->>'facilitySetting' = 'TEST_SETTING_ANC'
                            AND setting = 'Facility')
                            THEN 'FACILITY_HTS_TEST_SETTING_ANC'

                        WHEN (observation->>'facilitySetting' = 'TEST_SETTING_CT'
                            AND setting = 'HTS_ENTRY_POINT_FACILITY')
                            THEN 'FACILITY_HTS_TEST_SETTING_CT'

                        WHEN (observation->>'facilitySetting' = 'POINT_ENTRY_OPD'
                            AND setting = 'HTS_ENTRY_POINT_FACILITY')
                            THEN 'FACILITY_HTS_TEST_SETTING_OTHERS_(SPECIFY)'

                        WHEN (observation->>'facilitySetting' = 'POINT_ENTRY_OTHERS'
                            AND setting = 'Facility')
                            THEN 'FACILITY_HTS_TEST_SETTING_PEDIATRIC'

                        WHEN (observation->>'facilitySetting' = 'TEST_SETTING_CPMTCT'
                            AND setting = 'Facility')
                            THEN 'FACILITY_HTS_TEST_SETTING_SPOKE_HEALTH_FACILITY'

                        WHEN (observation->>'facilitySetting' = 'TEST_SETTING_TB'
                            AND setting = 'HTS_ENTRY_POINT_FACILITY')
                            THEN 'FACILITY_HTS_TEST_SETTING_TB'

                        WHEN (observation->>'facilitySetting' = 'TEST_SETTING_CT'
                            AND setting = 'Facility')
                            THEN 'FACILITY_HTS_TEST_SETTING_WARD_INPATIENT'

                        ELSE observation->>'facilitySetting'
                        END
                )
        ),
    date_modified = NOW(),
    modified_by   = 'DATA - Fi ETL_v1'
WHERE jsonb_exists(observation, 'facilitySetting')
  AND observation->>'facilitySetting' IN (
    'POINT_ENTRY_OTHERS',
    'TEST_SETTING_CPMTCT',
    'TEST_SETTING_STANDALONE_HTS',
    'TEST_SETTING_CT',
    'POINT_ENTRY_OPD',
    'TEST_SETTING_TB'
    );

UPDATE hts_encounter
SET setting = CASE setting
                  WHEN 'Facility'  THEN 'HTS_ENTRY_POINT_FACILITY'
                  WHEN 'Community' THEN 'HTS_ENTRY_POINT_COMMUNITY'
    END
WHERE setting IN ('Facility', 'Community');
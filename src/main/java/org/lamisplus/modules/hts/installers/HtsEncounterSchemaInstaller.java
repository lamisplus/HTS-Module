package org.lamisplus.modules.hts.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(20)
@Installer(name = "hts-encounter-schema-installer-new",
        description = "Creates the hts_encounter table — V3: boolean archived, patient_id, patient_uuid, facility_uuid, observation column",
        version = 29)
public class HtsEncounterSchemaInstaller extends AcrossLiquibaseInstaller {
    public HtsEncounterSchemaInstaller() {
        super("classpath:installers/hts/encounter_schema.xml");
    }
}
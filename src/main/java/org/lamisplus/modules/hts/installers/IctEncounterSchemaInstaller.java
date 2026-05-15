package org.lamisplus.modules.hts.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(21)
@Installer(name = "ict-encounter-schema-installer-new",
        description = "Creates ict_encounter and ict_contact tables — V3: boolean archived, patient_id, patient_uuid, facility_uuid, contact renames, removed age columns",
        version = 26)
public class IctEncounterSchemaInstaller extends AcrossLiquibaseInstaller {
    public IctEncounterSchemaInstaller() {
        super("classpath:installers/hts/ict_encounter_schema.xml");
    }
}
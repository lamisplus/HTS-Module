package org.lamisplus.modules.hts.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(21)
@Installer(name = "ict-encounter-schema-installer",
        description = "Creates ict_encounter and ict_contact tables for the ICT form",
        version = 1)
public class IctEncounterSchemaInstaller extends AcrossLiquibaseInstaller {
    public IctEncounterSchemaInstaller() {
        super("classpath:installers/hts/ict_encounter_schema.xml");
    }
}

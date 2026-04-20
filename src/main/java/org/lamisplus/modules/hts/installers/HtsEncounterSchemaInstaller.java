package org.lamisplus.modules.hts.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(20)
@Installer(name = "hts-encounter-schema-installer-new",
        description = "Creates the hts_encounter table for new merged HTS form",
        version = 6)
public class HtsEncounterSchemaInstaller extends AcrossLiquibaseInstaller {
    public HtsEncounterSchemaInstaller() {
        super("classpath:installers/hts/encounter_schema.xml");
    }
}
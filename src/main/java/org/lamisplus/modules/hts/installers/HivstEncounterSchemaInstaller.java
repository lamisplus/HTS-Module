package org.lamisplus.modules.hts.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(25)
@Installer(name = "hivst-encounter-schema-installer",
        description = "Creates hivst_encounter and hivst_result tables",
        version = 1)
public class HivstEncounterSchemaInstaller extends AcrossLiquibaseInstaller {
    public HivstEncounterSchemaInstaller() {
        super("classpath:installers/hts/hivst_schema.xml");
    }
}
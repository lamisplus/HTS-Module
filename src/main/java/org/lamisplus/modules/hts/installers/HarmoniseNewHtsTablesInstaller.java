package org.lamisplus.modules.hts.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(23)
@Installer(name = "harmonize-new-hts-tables-new",
        description = "Resolves divergent HTS tables",
        version = 15)
public class HarmoniseNewHtsTablesInstaller extends AcrossLiquibaseInstaller {
    public HarmoniseNewHtsTablesInstaller() {
        super("classpath:installers/hts/harmonise_new_hts_tables.xml");
    }
}
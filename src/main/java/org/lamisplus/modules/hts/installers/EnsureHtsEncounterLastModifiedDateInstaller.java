package org.lamisplus.modules.hts.installers;
import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

// Must run after HtsEncounterSchemaInstaller (@Order 20), which creates hts_encounter.
@Order(27)
@Installer(name = "ensure-hts-encounter-last-modified-date-installer",
        description = "Re-applies hts_encounter changesets (last_modified_date, perf indexes, pregnancy status fix) that the Updates installer skipped",
        version = 2)
public class EnsureHtsEncounterLastModifiedDateInstaller extends AcrossLiquibaseInstaller {
    public EnsureHtsEncounterLastModifiedDateInstaller() {
        super("classpath:installers/hts/ensure_hts_encounter_last_modified_date.xml");
    }
}

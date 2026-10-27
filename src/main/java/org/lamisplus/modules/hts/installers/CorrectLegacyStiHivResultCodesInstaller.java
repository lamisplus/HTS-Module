package org.lamisplus.modules.hts.installers;
import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

// Must run after HtsEncounterSchemaInstaller (@Order 20), the harmonise backfill (@Order 23)
// and EnsureHtsEncounterLastModifiedDateInstaller (@Order 27), which guarantees last_modified_date.
@Order(31)
@Installer(name = "correct-legacy-sti-hiv-result-codes-installer",
        description = "Moves initialHivTest and confirmatoryHivTest off the STI_HIV_RESULT codeset onto HIV_TEST_RESULT and HIV_CONFIRMATORY_TEST_RESULT",
        version = 1)
public class CorrectLegacyStiHivResultCodesInstaller extends AcrossLiquibaseInstaller {
    public CorrectLegacyStiHivResultCodesInstaller() {
        super("classpath:installers/hts/correct_legacy_sti_hiv_result_codes.xml");
    }
}

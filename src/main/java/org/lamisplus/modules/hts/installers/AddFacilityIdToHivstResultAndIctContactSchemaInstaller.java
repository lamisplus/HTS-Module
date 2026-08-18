package org.lamisplus.modules.hts.installers;
import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(26)
@Installer(name = "add-facility-id-to-hivst-result-and-ict-contact-installer",
        description = "Adds facility_id to hivst_result and hts_ict_contact, backfilled from their parent encounters",
        version = 2)
public class AddFacilityIdToHivstResultAndIctContactSchemaInstaller extends AcrossLiquibaseInstaller {
    public AddFacilityIdToHivstResultAndIctContactSchemaInstaller() {
        super("classpath:installers/hts/add_facility_id_to_hivst_result_and_ict_contact.xml");
    }
}
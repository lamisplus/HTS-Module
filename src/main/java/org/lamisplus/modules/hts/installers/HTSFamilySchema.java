package org.lamisplus.modules.hts.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(6)
@Installer(
        name = "contact-id-update-schema",
        description = "Added Contact Id to family index testing",
        version = 3
)
public class HTSFamilySchema extends AcrossLiquibaseInstaller {
    public HTSFamilySchema() {
        super("classpath:installers/hts/family_index_testing_update.xml");
    }
}

package org.lamisplus.modules.hts.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(2)
@Installer(name = "schema-installer",
        description = "Installs the required database for hts tables",
        version = 17)
public class SchemaInstaller extends AcrossLiquibaseInstaller {
    public SchemaInstaller() {
        super("classpath:installers/hts/schema.xml");
    }
}

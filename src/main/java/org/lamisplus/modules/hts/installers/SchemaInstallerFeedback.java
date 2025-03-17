package org.lamisplus.modules.hts.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(1)
@Installer(name = "schema-installer-feedback",
        description = "Installs the required database for hts feedback table",
        version = 2)
public class SchemaInstallerFeedback extends AcrossLiquibaseInstaller {
    public SchemaInstallerFeedback() {
        super("classpath:installers/hts/schema_feedback.xml");
    }
}

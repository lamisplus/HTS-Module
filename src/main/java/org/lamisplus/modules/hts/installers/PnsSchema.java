package org.lamisplus.modules.hts.installers;

import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;

@Order(3)
@Installer(name = "pns-schema-installer", description = "create pns schema",
        version = 7)
public class PnsSchema extends AcrossLiquibaseInstaller {
    public PnsSchema() {
        super("classpath:installers/hts/pns_schema.xml");
    }

}

package org.lamisplus.modules.hts.installers;
import com.foreach.across.core.annotations.Installer;
import com.foreach.across.core.installers.AcrossLiquibaseInstaller;
import org.springframework.core.annotation.Order;


@Order(30)
@Installer(name = "CorrectHtsMapping",
        description = "Resolves HTS mapping issues for historical records",
        version = 2)

public class CorrectHtsMapping extends AcrossLiquibaseInstaller {
    public CorrectHtsMapping() {
        super("classpath:installers/hts/correct_hts_mapping.sql");
    }

}
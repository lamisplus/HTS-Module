package org.lamisplus.modules.hts;

import com.foreach.across.config.AcrossApplication;
import com.foreach.across.core.AcrossModule;
import com.foreach.across.core.context.configurer.ComponentScanConfigurer;

@AcrossApplication(
        modules = {

        }
)
public class HtsModule extends AcrossModule {
    public static final String NAME = "HtsModule";

    public HtsModule() {
        super ();
        addApplicationContextConfigurer (new ComponentScanConfigurer (
                getClass ().getPackage ().getName () + ".repository",
                getClass ().getPackage ().getName () + ".service",
                getClass ().getPackage ().getName () + ".controller"
        ));
    }
    @Override
    public String getName() {
        return NAME;
    }
}

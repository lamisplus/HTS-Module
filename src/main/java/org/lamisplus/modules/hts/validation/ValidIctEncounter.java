package org.lamisplus.modules.hts.validation;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = IctEncounterValidator.class)
@Documented
public @interface ValidIctEncounter {
    String message() default "Invalid ICT encounter data";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

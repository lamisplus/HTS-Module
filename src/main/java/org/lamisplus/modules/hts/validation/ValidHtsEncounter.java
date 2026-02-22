package org.lamisplus.modules.hts.validation;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = HtsEncounterValidator.class)
@Documented
public @interface ValidHtsEncounter {
    String message() default "Invalid HTS encounter data";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
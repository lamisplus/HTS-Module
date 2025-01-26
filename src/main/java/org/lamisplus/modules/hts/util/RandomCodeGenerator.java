package org.lamisplus.modules.hts.util;

import org.apache.commons.lang3.RandomStringUtils;

import java.util.UUID;

public class RandomCodeGenerator {
    private RandomCodeGenerator() {}

    public static String randomAlphabeticString (int length) {
        return RandomStringUtils.randomAlphanumeric(length);
    }

    public static String randomAlphanumericString (int length) {
        return RandomStringUtils.randomAlphanumeric(length);
    }

    public static String randomString (int length, boolean useLetters, boolean useNumbers) {
        return RandomStringUtils.random(length, useLetters, useNumbers);
    }

    public static String randomUUID() {
        return UUID.randomUUID().toString();
    }

}

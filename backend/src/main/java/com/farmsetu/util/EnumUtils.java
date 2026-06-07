package com.farmsetu.util;

import com.farmsetu.exception.BadRequestException;
import java.util.Arrays;
import java.util.stream.Collectors;

public class EnumUtils {

    public static <T extends Enum<T>> T parseEnum(Class<T> enumClass, Object value) {
        if (value == null) {
            return null;
        }
        String str = value.toString().trim();
        if (str.isEmpty()) {
            return null;
        }
        try {
            return Enum.valueOf(enumClass, str.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Search case-insensitively
            for (T candidate : enumClass.getEnumConstants()) {
                if (candidate.name().equalsIgnoreCase(str)) {
                    return candidate;
                }
            }
            String allowed = Arrays.stream(enumClass.getEnumConstants())
                    .map(Enum::name)
                    .collect(Collectors.joining(", "));
            throw new BadRequestException(String.format("Invalid value '%s' for type %s. Allowed values are: %s",
                    str, enumClass.getSimpleName(), allowed));
        }
    }

    public static <T extends Enum<T>> T parseEnum(Class<T> enumClass, Object value, T defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        try {
            T parsed = parseEnum(enumClass, value);
            return parsed != null ? parsed : defaultValue;
        } catch (BadRequestException e) {
            return defaultValue;
        }
    }
}

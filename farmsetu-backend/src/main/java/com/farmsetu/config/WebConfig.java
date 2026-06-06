package com.farmsetu.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.stream.Collectors;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverterFactory(new CaseInsensitiveEnumConverterFactory());
    }

    private static class CaseInsensitiveEnumConverterFactory implements ConverterFactory<String, Enum> {
        @Override
        public <T extends Enum> Converter<String, T> getConverter(Class<T> targetType) {
            return new CaseInsensitiveEnumConverter<>(targetType);
        }
    }

    private static class CaseInsensitiveEnumConverter<T extends Enum> implements Converter<String, T> {
        private final Class<T> enumType;

        public CaseInsensitiveEnumConverter(Class<T> enumType) {
            this.enumType = enumType;
        }

        @Override
        public T convert(String source) {
            if (source.trim().isEmpty()) {
                return null;
            }
            try {
                return (T) Enum.valueOf(enumType, source.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                for (T candidate : enumType.getEnumConstants()) {
                    if (candidate.name().equalsIgnoreCase(source.trim())) {
                        return candidate;
                    }
                }
                String allowed = Arrays.stream(enumType.getEnumConstants())
                        .map(Enum::name)
                        .collect(Collectors.joining(", "));
                throw new IllegalArgumentException(String.format("Invalid value '%s' for type %s. Allowed values are: %s",
                        source.trim(), enumType.getSimpleName(), allowed));
            }
        }
    }
}

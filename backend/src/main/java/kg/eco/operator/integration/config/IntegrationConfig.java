package kg.eco.operator.integration.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Arrays;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class IntegrationConfig {

    private final IntegrationProperties properties;
    private final Environment environment;

    @Bean
    @Profile("production")
    public RestClient taxServiceClient() {
        log.info("Configuring RestClient for ГНС КР: {}", properties.getTaxService().getBaseUrl());
        return buildClient(properties.getTaxService());
    }

    @Bean
    @Profile("production")
    public RestClient customsServiceClient() {
        log.info("Configuring RestClient for ГТС КР: {}", properties.getCustomsService().getBaseUrl());
        return buildClient(properties.getCustomsService());
    }

    @Bean
    @Profile("production")
    public RestClient bankingClient() {
        log.info("Configuring RestClient for банковской системы: {}", properties.getBanking().getBaseUrl());
        return buildClient(properties.getBanking());
    }

    /**
     * In production, validate that all required integration URLs are configured.
     */
    @PostConstruct
    public void validateProductionConfig() {
        if (!Arrays.asList(environment.getActiveProfiles()).contains("production")) {
            return;
        }
        validateUrl("tax-service", properties.getTaxService());
        validateUrl("customs-service", properties.getCustomsService());
        validateUrl("banking", properties.getBanking());
    }

    private RestClient buildClient(IntegrationProperties.ServiceConfig config) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(config.getTimeout()));
        factory.setReadTimeout(Duration.ofMillis(config.getTimeout()));

        return RestClient.builder()
                .baseUrl(config.getBaseUrl())
                .defaultHeader("X-API-Key", config.getApiKey())
                .defaultHeader("Content-Type", "application/json")
                .requestFactory(factory)
                .build();
    }

    private void validateUrl(String name, IntegrationProperties.ServiceConfig config) {
        if (config.isEnabled() && (config.getBaseUrl() == null || config.getBaseUrl().contains("stub")
                || config.getBaseUrl().contains("localhost"))) {
            throw new IllegalStateException(
                    "Production profile requires real URL for " + name
                            + ". Current: " + config.getBaseUrl());
        }
    }
}

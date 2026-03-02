package kg.eco.operator.integration.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "integration")
@Data
public class IntegrationProperties {

    private int defaultTimeout = 10000;

    private ServiceConfig taxService = new ServiceConfig();
    private ServiceConfig customsService = new ServiceConfig();
    private BankingConfig banking = new BankingConfig();

    @Data
    public static class ServiceConfig {
        private String baseUrl;
        private String apiKey;
        private int timeout = 15000;
        private boolean enabled = true;
    }

    @Data
    public static class BankingConfig extends ServiceConfig {
        private String ecoOperatorAccount;
        private String ecoOperatorBik;
    }
}

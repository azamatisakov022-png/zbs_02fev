package kg.eco.operator.integration.common;

/**
 * Exception thrown when an external service integration fails.
 * Contains the service name and operation for diagnostics.
 */
public class IntegrationException extends RuntimeException {

    private final String serviceName;
    private final String operation;

    public IntegrationException(String serviceName, String operation, String message) {
        super("Ошибка интеграции с " + serviceName + " (" + operation + "): " + message);
        this.serviceName = serviceName;
        this.operation = operation;
    }

    public IntegrationException(String serviceName, String operation, Throwable cause) {
        super("Ошибка интеграции с " + serviceName + " (" + operation + "): " + cause.getMessage(), cause);
        this.serviceName = serviceName;
        this.operation = operation;
    }

    public String getServiceName() {
        return serviceName;
    }

    public String getOperation() {
        return operation;
    }
}

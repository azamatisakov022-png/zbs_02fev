package kg.eco.operator.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " с ID " + id + " не найден");
    }

    public ResourceNotFoundException(String resource, String field, String value) {
        super(resource + " с " + field + " " + value + " не найден");
    }
}

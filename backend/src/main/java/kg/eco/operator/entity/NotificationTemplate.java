package kg.eco.operator.entity;

import jakarta.persistence.*;
import kg.eco.operator.entity.enums.NotificationType;
import lombok.Data;

@Data
@Entity
@Table(name = "notification_templates")
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(name = "message_template", nullable = false, columnDefinition = "text")
    private String messageTemplate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType type;
}

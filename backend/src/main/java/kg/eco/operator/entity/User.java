package kg.eco.operator.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import kg.eco.operator.entity.enums.ApplicantType;
import kg.eco.operator.entity.enums.BusinessType;
import kg.eco.operator.entity.enums.RoleEnum;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 14)
    private String inn;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(name = "company_name")
    private String companyName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoleEnum role;

    /**
     * Тип бизнес-пользователя (только для role=BUSINESS):
     * PAYER — плательщик утильсбора (существующее поведение);
     * APPLICANT — заявитель на лицензию (переработчик, полигон и т.п.);
     * BOTH — редкий случай: и платит, и подаёт на лицензию.
     * Для не-BUSINESS ролей игнорируется, хранится значение по умолчанию.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "business_type", nullable = false, length = 10)
    private BusinessType businessType = BusinessType.PAYER;

    /**
     * Подтип заявителя на лицензию. Заполняется только если businessType
     * равен APPLICANT или BOTH (т.е. пользователь намерен подавать заявки
     * на лицензии). Используется для предзаполнения формы первой заявки —
     * чтобы пользователю не приходилось второй раз выбирать
     * RECYCLER / LANDFILL / COLLECTION_POINT / OTHER. Может меняться
     * пользователем в настройках профиля.
     * Для PAYER и не-BUSINESS ролей — NULL.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "applicant_type", length = 32)
    private ApplicantType applicantType;

    @Column(length = 100)
    private String email;

    @Column(length = 30)
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @JsonIgnore
    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

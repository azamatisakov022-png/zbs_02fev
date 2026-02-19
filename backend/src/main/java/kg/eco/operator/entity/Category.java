package kg.eco.operator.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_number", nullable = false, unique = true)
    private Integer groupNumber;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "unit", length = 20)
    private String unit;
}

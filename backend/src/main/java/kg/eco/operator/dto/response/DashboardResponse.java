package kg.eco.operator.dto.response;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = BusinessDashboardResponse.class, name = "business"),
        @JsonSubTypes.Type(value = EcoOperatorDashboardResponse.class, name = "eco-operator"),
        @JsonSubTypes.Type(value = EmployeeDashboardResponse.class, name = "employee"),
        @JsonSubTypes.Type(value = MinistryDashboardResponse.class, name = "ministry"),
        @JsonSubTypes.Type(value = AdminDashboardResponse.class, name = "admin"),
        @JsonSubTypes.Type(value = GuestDashboardResponse.class, name = "guest")
})
public abstract class DashboardResponse {

    private String role;
    private String userName;
    private String companyName;
}

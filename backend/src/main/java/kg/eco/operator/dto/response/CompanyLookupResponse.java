package kg.eco.operator.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyLookupResponse {

    private boolean found;
    private boolean active;
    private String errorMessage;

    private String inn;
    private String officialName;
    private String legalForm;
    private String legalAddress;
    private String actualAddress;
    private String director;
    private String directorPosition;
    private String okpoCode;
    private List<String> okedCodes;
    private String phone;
    private String email;
    private LocalDate registrationDate;
    private String status;
    private String taxRegime;
}

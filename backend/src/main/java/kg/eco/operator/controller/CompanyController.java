package kg.eco.operator.controller;

import kg.eco.operator.dto.response.CompanyResponse;
import kg.eco.operator.entity.Company;
import kg.eco.operator.exception.BusinessLogicException;
import kg.eco.operator.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Профиль компании текущего пользователя.
 *
 * Используется фронтом для предзаполнения форм — в первую очередь
 * мастером подачи заявки на лицензию (наименование, ИНН, ОПФ, юр. адрес,
 * директор, контакты), чтобы applicant не вбивал то, что АИС о нём
 * уже знает из учётной записи.
 */
@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyRepository companyRepository;

    /**
     * GET /companies/my — профиль компании, к которой привязан текущий
     * аутентифицированный пользователь (по ИНН из JWT).
     */
    @GetMapping("/my")
    public ResponseEntity<CompanyResponse> getMyCompany(Authentication auth) {
        String inn = auth.getName();
        Company company = companyRepository.findByInn(inn)
                .orElseThrow(() -> new BusinessLogicException(
                        "Профиль компании не найден для ИНН " + inn));
        return ResponseEntity.ok(CompanyResponse.from(company));
    }
}

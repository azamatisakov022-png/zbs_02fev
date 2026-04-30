package kg.eco.operator.dto.request;

import kg.eco.operator.entity.enums.ApplicantType;
import lombok.Data;

/**
 * Запрос на смену подтипа заявителя на лицензию.
 * Может слать сам пользователь из настроек профиля своего ЛК.
 *
 * Допустимо передать null, чтобы сбросить тип (для пользователей,
 * которые перестали быть заявителями).
 */
@Data
public class UpdateApplicantTypeRequest {

    /** RECYCLER | LANDFILL | COLLECTION_POINT | OTHER, либо null для сброса. */
    private ApplicantType applicantType;
}

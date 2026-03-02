package kg.eco.operator.integration.customs;

import kg.eco.operator.integration.customs.dto.CustomsDeclarationRequest;
import kg.eco.operator.integration.customs.dto.CustomsDeclarationResponse;
import kg.eco.operator.integration.customs.dto.CustomsVolumeVerificationResponse;

import java.util.List;

/**
 * Port for integration with ГТС КР (Государственная таможенная служба).
 * Provides import declaration data retrieval and volume cross-referencing.
 */
public interface CustomsServicePort {

    /**
     * Retrieve import declarations (ГТД) for a company in a given period.
     */
    List<CustomsDeclarationResponse> getImportDeclarations(CustomsDeclarationRequest request);

    /**
     * Verify declared product volumes against actual customs import data.
     */
    CustomsVolumeVerificationResponse verifyDeclaredVolumes(String companyInn, int year, int quarter);
}

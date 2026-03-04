package kg.eco.operator.service;

import kg.eco.operator.dto.response.ProductGroupDetailResponse;
import kg.eco.operator.dto.response.ProductGroupSummaryResponse;
import kg.eco.operator.dto.response.ProductSubgroupResponse;

import java.util.List;

public interface ProductGroupService {

    List<ProductGroupSummaryResponse> getAll();

    ProductGroupDetailResponse getByGroupNumber(Integer groupNumber);

    List<ProductSubgroupResponse> getSubgroups(Integer groupNumber);

    List<ProductSubgroupResponse> search(Integer groupNumber, String query);
}

package kg.eco.operator.service.impl;

import kg.eco.operator.dto.mapper.ProductGroupMapper;
import kg.eco.operator.dto.response.*;
import kg.eco.operator.entity.ProductGroup;
import kg.eco.operator.entity.ProductGroupRate;
import kg.eco.operator.repository.ProductGroupNormRepository;
import kg.eco.operator.repository.ProductGroupRateRepository;
import kg.eco.operator.repository.ProductGroupRepository;
import kg.eco.operator.repository.ProductSubgroupRepository;
import kg.eco.operator.service.ProductGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductGroupServiceImpl implements ProductGroupService {

    private final ProductGroupRepository productGroupRepository;
    private final ProductSubgroupRepository productSubgroupRepository;
    private final ProductGroupRateRepository productGroupRateRepository;
    private final ProductGroupNormRepository productGroupNormRepository;
    private final ProductGroupMapper mapper;

    @Override
    @Cacheable("productGroups")
    public List<ProductGroupSummaryResponse> getAll() {
        List<ProductGroup> groups = productGroupRepository.findAllWithSubgroups();
        return groups.stream()
                .map(pg -> {
                    BigDecimal rate = productGroupRateRepository
                            .findCurrentByProductGroupId(pg.getId())
                            .map(ProductGroupRate::getRatePerTon)
                            .orElse(null);
                    return mapper.toSummaryWithRate(pg, rate);
                })
                .toList();
    }

    @Override
    @Cacheable(value = "productGroupDetail", key = "#groupNumber")
    public ProductGroupDetailResponse getByGroupNumber(Integer groupNumber) {
        ProductGroup pg = productGroupRepository.findByGroupNumberWithDetails(groupNumber)
                .orElseThrow(() -> new NoSuchElementException(
                        "Product group not found: " + groupNumber));

        ProductGroupRateResponse rateDetails = productGroupRateRepository
                .findCurrentByProductGroupId(pg.getId())
                .map(mapper::toRateResponse)
                .orElse(null);

        BigDecimal currentRate = rateDetails != null ? rateDetails.ratePerTon() : null;

        List<ProductSubgroupResponse> subgroups = mapper.toSubgroupResponseList(pg.getSubgroups());
        List<ProductGroupNormResponse> norms = mapper.toNormResponseList(
                productGroupNormRepository.findByProductGroup_IdOrderByYear(pg.getId()));

        return mapper.toDetailFull(pg, currentRate, subgroups, norms, rateDetails);
    }

    @Override
    @Cacheable(value = "productGroupSubgroups", key = "#groupNumber")
    public List<ProductSubgroupResponse> getSubgroups(Integer groupNumber) {
        return mapper.toSubgroupResponseList(
                productSubgroupRepository.findByProductGroup_GroupNumberOrderBySortOrder(groupNumber));
    }

    @Override
    public List<ProductSubgroupResponse> search(Integer groupNumber, String query) {
        if (query == null || query.trim().isEmpty()) {
            return mapper.toSubgroupResponseList(
                    productSubgroupRepository.findByProductGroup_GroupNumberOrderBySortOrder(groupNumber));
        }
        return mapper.toSubgroupResponseList(
                productSubgroupRepository.search(groupNumber, query.trim()));
    }
}

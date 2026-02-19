package kg.eco.operator.service;

import kg.eco.operator.dto.response.*;

import java.util.List;

public interface AnalyticsService {

    AnalyticsSummaryResponse getSummary(String periodFrom, String periodTo, String region);

    List<IncomeDataResponse> getIncome(String groupBy, String periodFrom, String periodTo);

    List<RecyclingDataResponse> getRecycling(String productGroup, String periodFrom, String periodTo);

    List<RegionDataResponse> getRegions();

    byte[] exportReport(String format, String reportType, String periodFrom, String periodTo);
}

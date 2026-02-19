package kg.eco.operator.service;

import java.util.List;
import java.util.Map;

public interface PublicService {

    Map<String, Object> calculate(Map<String, Object> request);

    List<Map<String, Object>> getRecyclers(String region, String wasteGroup);

    List<Map<String, Object>> getLandfills(String region);

    List<Map<String, Object>> getCollectionPoints(String region);

    List<Map<String, Object>> getRates();

    List<Map<String, Object>> getFaq();
}

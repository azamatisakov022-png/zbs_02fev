package kg.eco.operator.controller;

import kg.eco.operator.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/gis")
@RequiredArgsConstructor
public class GisController {

    private final RecyclerRepository recyclerRepository;
    private final LandfillRepository landfillRepository;
    private final DumpRepository dumpRepository;
    private final CollectionPointRepository collectionPointRepository;

    @GetMapping("/objects")
    public ResponseEntity<List<Map<String, Object>>> getGisObjects(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String status) {

        List<Map<String, Object>> result = new ArrayList<>();

        if (type == null || "recycler".equals(type)) {
            recyclerRepository.findAll().forEach(r -> {
                Map<String, Object> obj = new LinkedHashMap<>();
                obj.put("id", r.getId());
                obj.put("type", "recycler");
                obj.put("name", r.getCompanyName());
                obj.put("latitude", r.getLatitude());
                obj.put("longitude", r.getLongitude());
                obj.put("region", r.getRegion());
                obj.put("status", r.getStatus() != null ? r.getStatus().getValue() : null);
                result.add(obj);
            });
        }

        if (type == null || "landfill".equals(type)) {
            landfillRepository.findAll().forEach(l -> {
                Map<String, Object> obj = new LinkedHashMap<>();
                obj.put("id", l.getId());
                obj.put("type", "landfill");
                obj.put("name", l.getName());
                obj.put("latitude", l.getLatitude());
                obj.put("longitude", l.getLongitude());
                obj.put("region", l.getRegion());
                obj.put("status", l.getStatus() != null ? l.getStatus().getValue() : null);
                result.add(obj);
            });
        }

        if (type == null || "dump".equals(type)) {
            dumpRepository.findAll().forEach(d -> {
                Map<String, Object> obj = new LinkedHashMap<>();
                obj.put("id", d.getId());
                obj.put("type", "dump");
                obj.put("name", d.getName());
                obj.put("latitude", d.getLatitude());
                obj.put("longitude", d.getLongitude());
                obj.put("region", d.getRegion());
                obj.put("status", d.getStatus() != null ? d.getStatus().getValue() : null);
                result.add(obj);
            });
        }

        if (type == null || "collection_point".equals(type)) {
            collectionPointRepository.findAll().forEach(cp -> {
                Map<String, Object> obj = new LinkedHashMap<>();
                obj.put("id", cp.getId());
                obj.put("type", "collection_point");
                obj.put("name", cp.getName());
                obj.put("latitude", cp.getLatitude());
                obj.put("longitude", cp.getLongitude());
                obj.put("region", cp.getRegion());
                obj.put("status", cp.getStatus() != null ? cp.getStatus().getValue() : null);
                result.add(obj);
            });
        }

        // Apply region/status filters if provided
        if (region != null) {
            result.removeIf(obj -> !region.equalsIgnoreCase((String) obj.get("region")));
        }
        if (status != null) {
            result.removeIf(obj -> !status.equalsIgnoreCase((String) obj.get("status")));
        }

        return ResponseEntity.ok(result);
    }
}

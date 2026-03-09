package kg.eco.operator.controller;

import kg.eco.operator.dto.response.ProductGroupDetailResponse;
import kg.eco.operator.dto.response.ProductGroupSummaryResponse;
import kg.eco.operator.dto.response.ProductSubgroupResponse;
import kg.eco.operator.service.ProductGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public/product-groups")
@RequiredArgsConstructor
public class ProductGroupController {

    private final ProductGroupService productGroupService;

    @GetMapping
    public ResponseEntity<List<ProductGroupSummaryResponse>> getAll() {
        return ResponseEntity.ok(productGroupService.getAll());
    }

    @GetMapping("/{groupNumber}")
    public ResponseEntity<ProductGroupDetailResponse> getByGroupNumber(
            @PathVariable Integer groupNumber) {
        return ResponseEntity.ok(productGroupService.getByGroupNumber(groupNumber));
    }

    @GetMapping("/{groupNumber}/subgroups")
    public ResponseEntity<List<ProductSubgroupResponse>> getSubgroups(
            @PathVariable Integer groupNumber) {
        return ResponseEntity.ok(productGroupService.getSubgroups(groupNumber));
    }

    @GetMapping("/{groupNumber}/subgroups/search")
    public ResponseEntity<List<ProductSubgroupResponse>> search(
            @PathVariable Integer groupNumber,
            @RequestParam(value = "q", required = false) String query) {
        return ResponseEntity.ok(productGroupService.search(groupNumber, query));
    }
}

package kg.eco.operator.controller;

import kg.eco.operator.service.PublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicService publicService;

    /**
     * POST /public/calculator — Публичный калькулятор РОП
     */
    @PostMapping("/calculator")
    public ResponseEntity<Map<String, Object>> calculate(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(publicService.calculate(request));
    }

    /**
     * GET /public/recyclers — Публичный реестр переработчиков
     */
    @GetMapping("/recyclers")
    public ResponseEntity<List<Map<String, Object>>> getRecyclers(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String wasteGroup) {
        return ResponseEntity.ok(publicService.getRecyclers(region, wasteGroup));
    }

    /**
     * GET /public/landfills — Публичный реестр полигонов
     */
    @GetMapping("/landfills")
    public ResponseEntity<List<Map<String, Object>>> getLandfills(
            @RequestParam(required = false) String region) {
        return ResponseEntity.ok(publicService.getLandfills(region));
    }

    /**
     * GET /public/collection-points — Публичный реестр пунктов приёма
     */
    @GetMapping("/collection-points")
    public ResponseEntity<List<Map<String, Object>>> getCollectionPoints(
            @RequestParam(required = false) String region) {
        return ResponseEntity.ok(publicService.getCollectionPoints(region));
    }

    /**
     * GET /public/rates — Публичные ставки утилизационного сбора
     */
    @GetMapping("/rates")
    public ResponseEntity<List<Map<String, Object>>> getRates() {
        return ResponseEntity.ok(publicService.getRates());
    }

    /**
     * GET /public/faq — FAQ
     */
    @GetMapping("/faq")
    public ResponseEntity<List<Map<String, Object>>> getFaq() {
        return ResponseEntity.ok(publicService.getFaq());
    }
}

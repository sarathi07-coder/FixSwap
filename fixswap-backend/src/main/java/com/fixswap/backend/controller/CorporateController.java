package com.fixswap.backend.controller;

import com.fixswap.backend.entity.CorporateTeamMember;
import com.fixswap.backend.entity.EWastePickupRequest;
import com.fixswap.backend.service.CorporateService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/corporate")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CorporateController {

    private final CorporateService corporateService;

    @GetMapping("/{companyId}/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(@PathVariable UUID companyId) {
        return ResponseEntity.ok(corporateService.getDashboard(companyId));
    }

    @GetMapping("/{companyId}/delays")
    public ResponseEntity<List<Map<String, Object>>> delays(@PathVariable UUID companyId) {
        return ResponseEntity.ok(corporateService.getDelays(companyId));
    }

    @GetMapping("/{companyId}/esg")
    public ResponseEntity<Map<String, Object>> esg(@PathVariable UUID companyId) {
        return ResponseEntity.ok(corporateService.getEsgReport(companyId));
    }

    @PostMapping("/{companyId}/esg/pickup")
    public ResponseEntity<EWastePickupRequest> schedulePickup(
            @PathVariable UUID companyId,
            @RequestBody PickupRequest body) {
        return ResponseEntity.ok(corporateService.schedulePickup(
                companyId, body.getWasteType(), body.getEstimatedKg()));
    }

    @GetMapping("/{companyId}/team")
    public ResponseEntity<List<Map<String, Object>>> team(@PathVariable UUID companyId) {
        return ResponseEntity.ok(corporateService.getTeam(companyId));
    }

    @PostMapping("/{companyId}/team")
    public ResponseEntity<CorporateTeamMember> addTeam(
            @PathVariable UUID companyId,
            @RequestBody TeamRequest body) {
        return ResponseEntity.ok(corporateService.addTeamMember(
                companyId, body.getFullName(), body.getEmail(), body.getRole()));
    }

    @DeleteMapping("/team/{memberId}")
    public ResponseEntity<Void> removeTeam(@PathVariable UUID memberId) {
        corporateService.removeTeamMember(memberId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/asset-intelligence")
    public ResponseEntity<Map<String, Object>> assetIntelligence(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(corporateService.analyzeAsset(body));
    }

    @Data
    public static class PickupRequest {
        private String wasteType;
        private BigDecimal estimatedKg;
    }

    @Data
    public static class TeamRequest {
        private String fullName;
        private String email;
        private String role;
    }
}

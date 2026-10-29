package com.fixswap.backend.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * AI-style asset risk scoring (category, brand, age, issue keywords).
 * Replaceable with external ML API — same request/response shape.
 */
@Service
public class EnterpriseAssetIntelligenceService {

    public Map<String, Object> analyzeAsset(String category, String product, String brand,
                                              Integer year, String issueHint) {
        double risk = 0.35;
        String cat = category == null ? "" : category.toUpperCase(Locale.ROOT);

        if (cat.contains("HVAC")) risk += 0.15;
        if (cat.contains("COMMERCIAL") || cat.contains("LARGE")) risk += 0.12;
        if (brand != null && brand.toUpperCase(Locale.ROOT).matches(".*(CARRIER|TRANE|LG|SAMSUNG).*")) risk += 0.05;

        if (year != null) {
            int age = Math.max(0, java.time.Year.now().getValue() - year);
            if (age > 8) risk += 0.18;
            else if (age > 4) risk += 0.08;
        }

        if (issueHint != null) {
            String low = issueHint.toLowerCase(Locale.ROOT);
            if (low.matches(".*(burn|smoke|leak|compressor|pcb|motor|dead).*")) risk += 0.2;
        }

        risk = Math.min(0.95, risk);
        String tier = risk >= 0.7 ? "HIGH" : risk >= 0.45 ? "MEDIUM" : "LOW";
        int slaMinutes = risk >= 0.7 ? 120 : risk >= 0.45 ? 180 : 240;

        Map<String, Object> result = new HashMap<>();
        result.put("modelVersion", "fixswap-asset-intel-v1");
        result.put("riskScore", Math.round(risk * 100) / 100.0);
        result.put("riskTier", tier);
        result.put("recommendedSlaMinutes", slaMinutes);
        result.put("maintenancePriority", tier.equals("HIGH") ? "Schedule within 48h" : "Standard quarterly check");
        result.put("summary", String.format(
                "%s %s scored %s risk — suggest %d min SLA response window.",
                category != null ? category : "Asset",
                product != null ? product : "unit",
                tier,
                slaMinutes
        ));
        return result;
    }
}

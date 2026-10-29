package com.fixswap.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthCheckController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> checkHealth() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "FixSwap Enterprise Backend is running successfully!",
            "database", "Connected (Validation Pending)"
        ));
    }
}

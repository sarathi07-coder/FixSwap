package com.fixswap.backend.controller;

import com.fixswap.backend.service.DataCleanupService;
import com.fixswap.backend.repository.ServiceTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
public class DevController {

    private final ServiceTicketRepository ticketRepository;
    private final DataCleanupService dataCleanupService;

    @DeleteMapping("/clear-history")
    public ResponseEntity<String> clearHistory() {
        dataCleanupService.clearAllOperationalData();
        return ResponseEntity.ok("All repair history cleared successfully.");
    }

    @DeleteMapping("/clear-all-data")
    public ResponseEntity<Map<String, String>> clearAllData() {
        dataCleanupService.clearAllOperationalData();
        return ResponseEntity.ok(Map.of(
                "message", "Fresh reset complete: tickets, garage, invoices, team invites, ESG pickups, and logs cleared. User accounts kept.",
                "status", "OK"
        ));
    }
}

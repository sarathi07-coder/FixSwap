package com.fixswap.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        log.info("Starting database initialization/schema patching...");
        try {
            // Fix for the 'CANCELLED' enum value in PostgreSQL
            // Since Hibernate 'update' doesn't add values to custom types, we do it manually.
            jdbcTemplate.execute("ALTER TYPE ticket_state ADD VALUE IF NOT EXISTS 'CANCELLED'");
            for (String state : new String[]{
                "LOANER_COLLECTED_AT_HUB", "EN_ROUTE_TO_CUSTOMER", "EN_ROUTE_TO_HUB_DROP", "REPAIRED_COLLECTED_AT_HUB"
            }) {
                jdbcTemplate.execute("ALTER TYPE ticket_state ADD VALUE IF NOT EXISTS '" + state + "'");
            }
            log.info("Database patch: ticket_state enum values updated.");
        } catch (Exception e) {
            log.warn("Database patch skipped or already applied: {}", e.getMessage());
        }
    }
}

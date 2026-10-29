package com.fixswap.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SchemaMigrationRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute(
                "ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS ticket_channel VARCHAR(20) DEFAULT 'HOUSEHOLD'");
        jdbcTemplate.execute(
                "UPDATE service_tickets SET ticket_channel = 'HOUSEHOLD' WHERE ticket_channel IS NULL");
        jdbcTemplate.execute(
                "UPDATE service_tickets SET ticket_channel = 'ENTERPRISE' " +
                        "WHERE issue_description LIKE '%[Enterprise SLA]%'");
        jdbcTemplate.execute(
                "ALTER TABLE user_garage_appliances ADD COLUMN IF NOT EXISTS registry_type VARCHAR(20) DEFAULT 'HOUSEHOLD'");
        jdbcTemplate.execute(
                "UPDATE user_garage_appliances SET registry_type = 'HOUSEHOLD' WHERE registry_type IS NULL");
    }
}

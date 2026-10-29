package com.fixswap.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DataCleanupService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public void clearAllOperationalData() {
        jdbcTemplate.execute("UPDATE temp_inventory SET loaned_to = NULL WHERE loaned_to IS NOT NULL");
        jdbcTemplate.execute("DELETE FROM otp_verifications");
        jdbcTemplate.execute("DELETE FROM ticket_assignments");
        jdbcTemplate.execute("DELETE FROM financial_ledger");
        jdbcTemplate.execute("DELETE FROM customer_reviews");
        jdbcTemplate.execute("DELETE FROM e_waste_pickup_requests");
        jdbcTemplate.execute("DELETE FROM corporate_team_members");
        jdbcTemplate.execute("DELETE FROM asset_maintenance_logs");
        jdbcTemplate.execute("DELETE FROM e_waste_ledger");
        jdbcTemplate.execute("DELETE FROM audit_logs");
        jdbcTemplate.execute("DELETE FROM agent_telemetry");
        jdbcTemplate.execute("DELETE FROM iot_error_logs");
        jdbcTemplate.execute("DELETE FROM login_history");
        jdbcTemplate.execute("DELETE FROM user_garage_appliances");
        jdbcTemplate.execute("DELETE FROM service_tickets");
        jdbcTemplate.execute("UPDATE b2b_contracts SET swaps_used_this_month = 0 WHERE swaps_used_this_month IS NOT NULL AND swaps_used_this_month > 0");
    }
}

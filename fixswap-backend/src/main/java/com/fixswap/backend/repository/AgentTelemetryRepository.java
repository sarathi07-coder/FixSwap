package com.fixswap.backend.repository;

import com.fixswap.backend.entity.AgentTelemetry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface AgentTelemetryRepository extends JpaRepository<AgentTelemetry, UUID> {
    List<AgentTelemetry> findByIsOnDutyTrue();

    @Query(value = """
        SELECT a.* FROM agent_telemetry a
        WHERE a.is_on_duty = true
        ORDER BY func_calc_distance_km(a.current_lat, a.current_lon, :lat, :lon) ASC
        LIMIT 1
        """, nativeQuery = true)
    AgentTelemetry findNearestAvailableAgent(@Param("lat") BigDecimal lat, @Param("lon") BigDecimal lon);
}

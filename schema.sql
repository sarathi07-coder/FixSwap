-- ==============================================================================
-- FIXSWAP: ENTERPRISE DATABASE ARCHITECTURE (MNC LEVEL)
-- TOPIC: APPLIANCE-AS-A-SERVICE (AaaS) & RESCUE LOGISTICS
-- FEATURES: 14 Tables, Partitioning, JSONB, Triggers, Procs, Views, RLS, PostGIS logic
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS & SCHEMAS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ==============================================================================
-- 2. ENUMS
-- ==============================================================================
CREATE TYPE role_type AS ENUM ('CUSTOMER', 'SHOP_OWNER', 'ADMIN', 'RESCUE_WORKER');
CREATE TYPE customer_category AS ENUM ('HOUSEHOLD', 'HOTEL_B2B');
CREATE TYPE device_state AS ENUM ('AVAILABLE', 'LOANED_OUT', 'IN_MAINTENANCE', 'RETIRED');
CREATE TYPE ticket_state AS ENUM ('PENDING', 'ACCEPTED', 'TECH_DISPATCHED', 'ITEM_COLLECTED', 'LOANER_GIVEN', 'DEVICE_SWAPPED', 'IN_REPAIR', 'REPAIR_DONE', 'RETURNING', 'COMPLETED', 'DISPUTED', 'CANCELLED');
CREATE TYPE contract_status AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED');

-- ==============================================================================
-- 3. CORE ENTITIES (14 TABLES)
-- ==============================================================================

-- TABLE 1: Users Base (Customer, Shop Owner, Agent)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    role role_type DEFAULT 'CUSTOMER',
    customer_type customer_category DEFAULT 'HOUSEHOLD',
    trust_score DECIMAL(3,2) DEFAULT 5.00,
    tax_id VARCHAR(50),
    hq_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 2: User Credentials (Security/Separation of Concerns)
CREATE TABLE user_credentials (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    last_login TIMESTAMP,
    failed_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT false
);

-- TABLE 2B: Login History (Audit Tracking)
CREATE TABLE login_history (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    session_status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'LOGGED_OUT'
    session_duration_seconds BIGINT
);

-- TABLE 3: B2B Hotel Contracts (Financial Retainers)
CREATE TABLE b2b_contracts (
    contract_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    monthly_retainer_fee DECIMAL(12,2) NOT NULL,
    included_swaps_per_month INT NOT NULL,
    swaps_used_this_month INT DEFAULT 0,
    status contract_status DEFAULT 'ACTIVE',
    valid_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 4: Shops / Micro-Hubs
CREATE TABLE shops (
    shop_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    shop_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    geo_lat DECIMAL(10,8) NOT NULL,
    geo_lon DECIMAL(11,8) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- TABLE 5: Temporary Appliance Inventory
CREATE TABLE temp_inventory (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(shop_id) ON DELETE SET NULL,
    appliance_category VARCHAR(50) NOT NULL, -- e.g., 'AC', 'Refrigerator'
    brand VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    replacement_value DECIMAL(10,2) NOT NULL,
    daily_rental_rate DECIMAL(8,2) NOT NULL,
    status device_state DEFAULT 'AVAILABLE',
    total_life_cycles INT DEFAULT 0
);

-- TABLE 6: Asset Maintenance Logs
CREATE TABLE asset_maintenance_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES temp_inventory(asset_id) ON DELETE CASCADE,
    maintenance_cost DECIMAL(10,2) NOT NULL,
    description TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 7: IoT Telemetry Payloads (JSONB)
CREATE TABLE iot_error_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    appliance_type VARCHAR(50),
    sensor_payload JSONB NOT NULL, -- e.g., {"error_code": "E4", "temp": 35}
    is_processed BOOLEAN DEFAULT false,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 8: Rescue Worker Logistics
CREATE TABLE agent_telemetry (
    agent_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    is_on_duty BOOLEAN DEFAULT false,
    current_lat DECIMAL(10,8),
    current_lon DECIMAL(11,8),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 9: Service Tickets (Core Workflow)
CREATE TABLE service_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(user_id) ON DELETE RESTRICT,
    shop_id UUID REFERENCES shops(shop_id) ON DELETE RESTRICT,
    appliance_category VARCHAR(50) NOT NULL,
    appliance_product VARCHAR(100) NOT NULL,
    appliance_brand VARCHAR(100),
    appliance_model VARCHAR(100),
    issue_description TEXT NOT NULL,
    issue_photos JSONB DEFAULT '[]',
    customer_lat DECIMAL(10,8) NOT NULL,
    customer_lon DECIMAL(11,8) NOT NULL,
    status ticket_state DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- TABLE 10: Ticket Assignments
CREATE TABLE ticket_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES service_tickets(ticket_id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agent_telemetry(agent_id) ON DELETE RESTRICT,
    asset_id UUID REFERENCES temp_inventory(asset_id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- TABLE 11: Financial Ledger (Billing & Invoicing)
CREATE TABLE financial_ledger (
    invoice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES service_tickets(ticket_id) ON DELETE CASCADE,
    base_repair_cost DECIMAL(10,2) DEFAULT 0.00,
    rental_cost DECIMAL(10,2) DEFAULT 0.00,
    b2b_discount DECIMAL(10,2) DEFAULT 0.00,
    final_total DECIMAL(10,2) GENERATED ALWAYS AS (base_repair_cost + rental_cost - b2b_discount) STORED,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 12: Eco-Waste Ledger
CREATE TABLE e_waste_ledger (
    ledger_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES service_tickets(ticket_id) ON DELETE CASCADE,
    carbon_saved_kg DECIMAL(8,2) NOT NULL,
    metal_saved_kg DECIMAL(8,2) NOT NULL,
    coolant_saved_g DECIMAL(8,2) NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 13: Customer Reviews
CREATE TABLE customer_reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES service_tickets(ticket_id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 14: Audit Logs (PARTITIONED BY RANGE)
CREATE TABLE audit_logs (
    log_id UUID DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    record_data JSONB,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (logged_at);

-- Create partitions for current and next year
CREATE TABLE audit_logs_2026 PARTITION OF audit_logs FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE audit_logs_2027 PARTITION OF audit_logs FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');

-- ==============================================================================
-- 4. ADVANCED INDEXING
-- ==============================================================================
CREATE INDEX idx_active_tickets ON service_tickets(ticket_id) WHERE status != 'COMPLETED' AND status != 'DISPUTED';
CREATE INDEX idx_gin_issue_desc ON service_tickets USING GIN (issue_description gin_trgm_ops);
CREATE INDEX idx_json_iot ON iot_error_logs USING GIN (sensor_payload);
CREATE INDEX idx_geo_shops ON shops(geo_lat, geo_lon);

-- ==============================================================================
-- 5. ROW-LEVEL SECURITY (RLS)
-- ==============================================================================
-- Helper functions for RLS (reads from session context)
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION current_shop_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_shop_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_view_own_tickets ON service_tickets FOR SELECT USING (customer_id = current_user_id());
CREATE POLICY shop_view_own_tickets ON service_tickets FOR SELECT USING (shop_id = current_shop_id());

-- ==============================================================================
-- 6. ADVANCED FUNCTIONS
-- ==============================================================================

-- A. Distance Calculation (Haversine)
CREATE OR REPLACE FUNCTION func_calc_distance_km(lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL) RETURNS DECIMAL AS $$
DECLARE R INT := 6371; dlat DECIMAL; dlon DECIMAL; a DECIMAL; c DECIMAL;
BEGIN
    dlat := radians(lat2 - lat1); dlon := radians(lon2 - lon1);
    a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN (R * c);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- B. B2B Discount Calculator
CREATE OR REPLACE FUNCTION func_calculate_b2b_discount(c_id UUID, total_cost DECIMAL) RETURNS DECIMAL AS $$
DECLARE
    ctype customer_category;
    swaps_used INT; swaps_allowed INT;
BEGIN
    SELECT customer_type INTO ctype FROM users WHERE user_id = c_id;
    IF ctype = 'HOTEL_B2B' THEN
        SELECT swaps_used_this_month, included_swaps_per_month INTO swaps_used, swaps_allowed 
        FROM b2b_contracts WHERE hotel_id = c_id AND status = 'ACTIVE';
        
        IF swaps_used < swaps_allowed THEN RETURN total_cost; END IF; -- 100% discount
    END IF;
    RETURN 0.00;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 7. STORED PROCEDURES
-- ==============================================================================

-- A. Process IoT Error Log
CREATE PROCEDURE proc_process_iot_alert(p_log_id UUID) LANGUAGE plpgsql AS $$
DECLARE v_user UUID; v_desc TEXT;
BEGIN
    SELECT user_id, sensor_payload->>'error_code' INTO v_user, v_desc FROM iot_error_logs WHERE log_id = p_log_id;
    -- Automatically create a pending ticket
    INSERT INTO service_tickets (customer_id, shop_id, appliance_category, appliance_product, issue_description, customer_lat, customer_lon)
    VALUES (v_user, (SELECT shop_id FROM shops LIMIT 1), 'IoT Device', 'Connected Appliance', 'AUTO IOT ALERT: Error ' || v_desc, 0.0, 0.0);
    
    UPDATE iot_error_logs SET is_processed = true WHERE log_id = p_log_id;
    COMMIT;
END;
$$;

-- B. Assign Worker (Spatial Dispatch)
CREATE PROCEDURE proc_dispatch_worker(p_ticket_id UUID) LANGUAGE plpgsql AS $$
DECLARE v_agent UUID; v_asset UUID; v_tlat DECIMAL; v_tlon DECIMAL;
BEGIN
    SELECT customer_lat, customer_lon INTO v_tlat, v_tlon FROM service_tickets WHERE ticket_id = p_ticket_id;
    -- Find nearest on-duty agent
    SELECT agent_id INTO v_agent FROM agent_telemetry WHERE is_on_duty = true 
    ORDER BY func_calc_distance_km(current_lat, current_lon, v_tlat, v_tlon) ASC LIMIT 1;
    
    IF v_agent IS NOT NULL THEN
        -- Assign temp asset
        SELECT asset_id INTO v_asset FROM temp_inventory WHERE status = 'AVAILABLE' LIMIT 1;
        INSERT INTO ticket_assignments (ticket_id, agent_id, asset_id) VALUES (p_ticket_id, v_agent, v_asset);
        UPDATE service_tickets SET status = 'ACCEPTED' WHERE ticket_id = p_ticket_id;
    END IF;
    COMMIT;
END;
$$;

-- ==============================================================================
-- 8. DATABASE TRIGGERS
-- ==============================================================================

-- A. Auto-Invoice on Completion
CREATE OR REPLACE FUNCTION trg_generate_invoice() RETURNS TRIGGER AS $$
DECLARE discount DECIMAL;
BEGIN
    IF NEW.status = 'COMPLETED' THEN
        discount := func_calculate_b2b_discount(NEW.customer_id, 150.00); -- Mock base cost
        INSERT INTO financial_ledger (ticket_id, base_repair_cost, rental_cost, b2b_discount)
        VALUES (NEW.ticket_id, 100.00, 50.00, discount);
        
        -- Update B2B usage
        UPDATE b2b_contracts SET swaps_used_this_month = swaps_used_this_month + 1 
        WHERE hotel_id = NEW.customer_id AND status = 'ACTIVE';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_invoice
AFTER UPDATE ON service_tickets FOR EACH ROW WHEN (NEW.status = 'COMPLETED') EXECUTE FUNCTION trg_generate_invoice();

-- B. Immutable Audit Trail
CREATE OR REPLACE FUNCTION trg_audit_logger() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_data)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_tickets AFTER UPDATE ON service_tickets FOR EACH ROW EXECUTE FUNCTION trg_audit_logger();

-- ==============================================================================
-- 9. VIEWS & MATERIALIZED VIEWS
-- ==============================================================================

-- A. Window Function View: Agent Performance Ranking
CREATE VIEW v_agent_leaderboard AS
SELECT a.agent_id, u.full_name, COUNT(t.ticket_id) as jobs_completed,
       RANK() OVER (ORDER BY COUNT(t.ticket_id) DESC) as city_rank
FROM ticket_assignments a
JOIN users u ON a.agent_id = u.user_id
JOIN service_tickets t ON a.ticket_id = t.ticket_id
WHERE t.status = 'COMPLETED'
GROUP BY a.agent_id, u.full_name;

-- B. B2B Retainer Revenue View
CREATE VIEW v_monthly_mrr AS
SELECT SUM(monthly_retainer_fee) as Total_MRR, COUNT(contract_id) as active_hotels
FROM b2b_contracts WHERE status = 'ACTIVE';

-- C. Materialized View: Live Inventory Map
CREATE MATERIALIZED VIEW mv_live_inventory_map AS
SELECT s.shop_name, s.geo_lat, s.geo_lon, COUNT(t.asset_id) as total_ready_appliances
FROM shops s
JOIN temp_inventory t ON s.shop_id = t.shop_id
WHERE t.status = 'AVAILABLE'
GROUP BY s.shop_name, s.geo_lat, s.geo_lon;

-- ==============================================================================
-- 10. RECURSIVE CTE (Appliance History)
-- ==============================================================================
-- Query to trace every user who rented a specific appliance chronologically
WITH RECURSIVE asset_history AS (
    SELECT assignment_id, ticket_id, asset_id, assigned_at
    FROM ticket_assignments WHERE asset_id = 'c1234567-89ab-cdef-0123-456789abcdef'
    UNION
    SELECT ta.assignment_id, ta.ticket_id, ta.asset_id, ta.assigned_at
    FROM ticket_assignments ta
    INNER JOIN asset_history ah ON ta.asset_id = ah.asset_id
    WHERE ta.assigned_at > ah.assigned_at
)
SELECT * FROM asset_history LIMIT 10;

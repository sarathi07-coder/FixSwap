-- FixSwap Bootstrap Schema v2.0 (Normalized Auth Architecture)
-- Run this ONCE after wiping the DB to create all tables in dependency order.

-- ── 1. ENUM TYPES ──────────────────────────────────────────────────────────
CREATE TYPE role_type AS ENUM (
    'CUSTOMER', 'SHOP_OWNER', 'RESCUE_WORKER', 'ADMIN', 'B2B_ADMIN', 'HOTEL_B2B'
);

CREATE TYPE customer_category AS ENUM (
    'HOUSEHOLD', 'HOTEL_B2B', 'CORPORATE', 'GOVERNMENT'
);

CREATE TYPE ticket_state AS ENUM (
    'PENDING', 'ACCEPTED', 'TECH_DISPATCHED', 'ITEM_COLLECTED', 'LOANER_GIVEN',
    'IN_REPAIR', 'REPAIR_DONE', 'RETURNING', 'COMPLETED', 'CANCELLED', 'DISPUTED'
);

CREATE TYPE device_state AS ENUM (
    'AVAILABLE', 'LOANED_OUT', 'UNDER_MAINTENANCE', 'RETIRED'
);

CREATE TYPE contract_status AS ENUM (
    'ACTIVE', 'EXPIRED', 'SUSPENDED'
);

-- ── 2. CORE AUTH TABLE (root of all FKs) ────────────────────────────────────
CREATE TABLE auth_credentials (
    auth_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(150) NOT NULL,
    phone_number  VARCHAR(20)  NOT NULL,
    password_hash TEXT,
    role          role_type    NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (phone_number, role)
);

-- ── 3. PROFILE TABLES ────────────────────────────────────────────────────────
CREATE TABLE customer_profiles (
    customer_id            UUID PRIMARY KEY REFERENCES auth_credentials(auth_id) ON DELETE CASCADE,
    full_name              VARCHAR(150) NOT NULL,
    customer_type          customer_category NOT NULL DEFAULT 'HOUSEHOLD',
    trust_score            NUMERIC(3,2) DEFAULT 5.00,
    household_address      TEXT,
    profile_photo          TEXT,
    sms_notifications      BOOLEAN DEFAULT TRUE,
    whatsapp_notifications BOOLEAN DEFAULT TRUE
);

CREATE TABLE shops (
    shop_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id          UUID REFERENCES auth_credentials(auth_id) ON DELETE SET NULL,
    owner_name        VARCHAR(150),
    shop_name         VARCHAR(150) NOT NULL,
    address           TEXT NOT NULL,
    geo_lat           NUMERIC(10,8) NOT NULL DEFAULT 13.08268,
    geo_lon           NUMERIC(11,8) NOT NULL DEFAULT 80.27068,
    is_active         BOOLEAN DEFAULT TRUE,
    phone_number      VARCHAR(20),
    service_radius_km DOUBLE PRECISION DEFAULT 8.0,
    has_loaner_device BOOLEAN DEFAULT TRUE
);

CREATE TABLE technician_workers (
    worker_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id             UUID REFERENCES auth_credentials(auth_id) ON DELETE CASCADE,
    shop_id             UUID REFERENCES shops(shop_id) ON DELETE SET NULL,
    full_name           VARCHAR(150),
    email               VARCHAR(150),
    phone_verified      BOOLEAN DEFAULT FALSE,
    email_verified      BOOLEAN DEFAULT FALSE,
    id_card_no          VARCHAR(100),
    driving_license_no  VARCHAR(100),
    vehicle_type        VARCHAR(50),
    aadhar_reference    VARCHAR(100),
    kyc_status          VARCHAR(50) DEFAULT 'PENDING',
    is_on_duty          BOOLEAN DEFAULT FALSE,
    current_lat         NUMERIC(10,8),
    current_lon         NUMERIC(11,8),
    rating              NUMERIC(3,2) DEFAULT 5.00,
    total_jobs          INTEGER DEFAULT 0
);

CREATE TABLE b2b_contracts (
    contract_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id             UUID REFERENCES auth_credentials(auth_id) ON DELETE SET NULL,
    company_name         VARCHAR(150),
    company_contact_name VARCHAR(150),
    monthly_retainer_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    device_limit         INTEGER DEFAULT 5,
    contract_status      contract_status NOT NULL DEFAULT 'ACTIVE',
    start_date           DATE,
    end_date             DATE,
    tax_id               VARCHAR(100),
    hq_address           TEXT
);

-- ── 4. OPERATIONAL TABLES ────────────────────────────────────────────────────
CREATE TABLE service_tickets (
    ticket_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id        UUID NOT NULL REFERENCES auth_credentials(auth_id) ON DELETE RESTRICT,
    shop_id            UUID NOT NULL REFERENCES shops(shop_id) ON DELETE RESTRICT,
    appliance_category VARCHAR(50)  NOT NULL,
    appliance_product  VARCHAR(100) NOT NULL,
    appliance_brand    VARCHAR(100),
    appliance_model    VARCHAR(100),
    purchase_year      INTEGER,
    customer_address   TEXT,
    issue_description  TEXT NOT NULL,
    issue_photos       JSONB,
    customer_lat       NUMERIC(10,8) NOT NULL,
    customer_lon       NUMERIC(11,8) NOT NULL,
    status             ticket_state NOT NULL DEFAULT 'PENDING',
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    resolved_at        TIMESTAMPTZ,
    assigned_worker_id UUID REFERENCES technician_workers(worker_id) ON DELETE SET NULL,
    pickup_otp         VARCHAR(6),
    delivery_otp       VARCHAR(6),
    loaner_device_id   UUID,
    worker_assigned_at TIMESTAMPTZ,
    otp_verified_at    TIMESTAMPTZ
);

CREATE TABLE temp_inventory (
    device_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id      UUID NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
    device_name  VARCHAR(150) NOT NULL,
    device_model VARCHAR(100),
    status       device_state NOT NULL DEFAULT 'AVAILABLE',
    loaned_to    UUID REFERENCES service_tickets(ticket_id) ON DELETE SET NULL,
    added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE login_history (
    session_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES auth_credentials(auth_id) ON DELETE CASCADE,
    login_time             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    logout_time            TIMESTAMPTZ,
    session_status         VARCHAR(30) DEFAULT 'ACTIVE',
    portal_type            VARCHAR(50),
    session_duration_seconds BIGINT
);

CREATE TABLE otp_verifications (
    otp_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID REFERENCES service_tickets(ticket_id) ON DELETE CASCADE,
    otp_type    VARCHAR(40) NOT NULL,
    code        VARCHAR(10) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at  TIMESTAMPTZ,
    verified_at TIMESTAMPTZ
);

CREATE TABLE financial_ledger (
    ledger_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id       UUID REFERENCES service_tickets(ticket_id) ON DELETE SET NULL,
    base_repair_cost NUMERIC(10,2) DEFAULT 0,
    rental_cost      NUMERIC(10,2) DEFAULT 0,
    b2b_discount     NUMERIC(10,2) DEFAULT 0,
    fine_amount      NUMERIC(10,2) DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_reviews (
    review_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id  UUID REFERENCES service_tickets(ticket_id) ON DELETE SET NULL,
    rating     INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id     UUID REFERENCES service_tickets(ticket_id) ON DELETE CASCADE,
    worker_id     UUID REFERENCES technician_workers(worker_id) ON DELETE SET NULL,
    assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status        VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE agent_telemetry (
    agent_id    UUID PRIMARY KEY REFERENCES auth_credentials(auth_id) ON DELETE CASCADE,
    is_on_duty  BOOLEAN DEFAULT FALSE,
    current_lat NUMERIC(10,8),
    current_lon NUMERIC(11,8),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE iot_error_logs (
    log_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES auth_credentials(auth_id) ON DELETE SET NULL,
    appliance_type VARCHAR(50),
    sensor_payload JSONB NOT NULL,
    is_processed   BOOLEAN DEFAULT FALSE,
    logged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_garage_appliances (
    garage_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth_credentials(auth_id) ON DELETE CASCADE,
    category     VARCHAR(50)  NOT NULL,
    product      VARCHAR(100) NOT NULL,
    brand        VARCHAR(100),
    model        VARCHAR(100),
    purchase_year INTEGER,
    photo_base64  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    audit_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100),
    operation  VARCHAR(20),
    record_id  UUID,
    changed_by UUID REFERENCES auth_credentials(auth_id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    old_data   JSONB,
    new_data   JSONB
);

CREATE TABLE e_waste_ledger (
    ewaste_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id      UUID REFERENCES service_tickets(ticket_id) ON DELETE SET NULL,
    part_name      VARCHAR(150),
    disposal_method VARCHAR(100),
    disposed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_maintenance_logs (
    log_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id   UUID REFERENCES temp_inventory(device_id) ON DELETE CASCADE,
    notes       TEXT,
    serviced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. UTILITY FUNCTION FOR GEO DISTANCE ────────────────────────────────────
CREATE OR REPLACE FUNCTION func_calc_distance_km(
    lat1 NUMERIC, lon1 NUMERIC, lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    R CONSTANT NUMERIC := 6371;
    dlat NUMERIC;
    dlon NUMERIC;
    a NUMERIC;
    c NUMERIC;
BEGIN
    dlat := RADIANS(lat2 - lat1);
    dlon := RADIANS(lon2 - lon1);
    a := SIN(dlat/2)^2 + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon/2)^2;
    c := 2 * ASIN(SQRT(a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

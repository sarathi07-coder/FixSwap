-- FixSwap: Delivery Partner (Courier) seed credentials
-- Run: psql -h localhost -U postgres -d FixSwaps -f seed_delivery_partners.sql

-- Primary delivery partner (Swiggy/Zomato-style courier)
WITH new_auth AS (
    INSERT INTO auth_credentials (email, phone_number, password_hash, role)
    VALUES ('courier@test.com', '6665554443', 'password123', 'RESCUE_WORKER')
    ON CONFLICT DO NOTHING
    RETURNING auth_id
)
INSERT INTO technician_workers (
    worker_id, full_name, email, worker_type, kyc_status,
    phone_verified, vehicle_type, is_on_duty
)
SELECT
    auth_id,
    'Raj Courier',
    'courier@test.com',
    'DELIVERY_COURIER',
    'VERIFIED',
    true,
    'BIKE',
    false
FROM new_auth
ON CONFLICT DO NOTHING;

-- Secondary delivery partner (for multi-courier testing)
WITH new_auth AS (
    INSERT INTO auth_credentials (email, phone_number, password_hash, role)
    VALUES ('delivery@test.com', '6665554444', 'password123', 'RESCUE_WORKER')
    ON CONFLICT DO NOTHING
    RETURNING auth_id
)
INSERT INTO technician_workers (
    worker_id, full_name, email, worker_type, kyc_status,
    phone_verified, vehicle_type, is_on_duty
)
SELECT
    auth_id,
    'Priya Delivery',
    'delivery@test.com',
    'DELIVERY_COURIER',
    'VERIFIED',
    true,
    'BIKE',
    false
FROM new_auth
ON CONFLICT DO NOTHING;

-- Verify existing test couriers created by verify_flows.js (optional cleanup)
UPDATE technician_workers
SET kyc_status = 'VERIFIED', phone_verified = true, worker_type = 'DELIVERY_COURIER'
WHERE worker_id IN (
    SELECT auth_id FROM auth_credentials
    WHERE email IN (
        'courier_978015@test.com',
        'courier_738353@test.com',
        'courier_513116@test.com'
    )
);

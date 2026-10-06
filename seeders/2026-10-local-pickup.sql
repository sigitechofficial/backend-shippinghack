-- Local orders: drop-off at FedEx or FedEx pickup, switched in Admin > Pricing & charges.
-- Run ONCE on each database BEFORE deploying the backend that uses it (Sequelize selects
-- every model column, so a missing column breaks every query on bookings). Safe to re-run.

-- 1. The order's pickup method, pickup fee and FedEx pickup booking
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'pickupMethod');
SET @sql := IF(@has = 0,
  'ALTER TABLE bookings ADD COLUMN pickupMethod VARCHAR(10) NULL, ADD COLUMN pickupFee DECIMAL(10,2) NULL, ADD COLUMN pickupConfirmation VARCHAR(50) NULL, ADD COLUMN pickupLocation VARCHAR(20) NULL, ADD COLUMN pickupError VARCHAR(500) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. The admin's settings: method 0 = the customer drops the box off at FedEx (starts
-- here), 1 = FedEx picks it up; and the pickup fee in $ added to the customer's price
INSERT INTO generalCharges (title, `key`, value, information, createdAt, updatedAt)
SELECT 'Local pickup', 'localPickupMode', 0, 'Local orders: 0 = drop-off at FedEx, 1 = FedEx pickup', NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM generalCharges WHERE `key` = 'localPickupMode');
INSERT INTO generalCharges (title, `key`, value, information, createdAt, updatedAt)
SELECT 'Local pickup', 'localPickupFee', 0, 'Local orders: FedEx pickup fee ($)', NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM generalCharges WHERE `key` = 'localPickupFee');

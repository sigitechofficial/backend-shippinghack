-- Business level prices on orders (2026-10). Run ONCE on each database BEFORE deploying
-- the backend that uses it (every order query reads these columns). Safe to re-run.

-- 1. Processing fee charged on a business order (all its packages together)
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'processingFee');
SET @sql := IF(@has = 0, 'ALTER TABLE bookings ADD COLUMN processingFee DECIMAL(10,2) NULL DEFAULT 0.00 AFTER discount', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. The business level that set the order's discount and processing fee
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'businessLevel');
SET @sql := IF(@has = 0, 'ALTER TABLE bookings ADD COLUMN businessLevel VARCHAR(50) NULL AFTER processingFee', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- What is there now
SHOW COLUMNS FROM bookings WHERE Field IN ('discount', 'processingFee', 'businessLevel');

-- Promo codes on customer orders (2026-10). Run ONCE on each database BEFORE deploying the
-- backend that uses it (every order query reads the new columns). Safe to re-run.
-- Coupons are created in Admin > Coupons.

-- 1. The coupon on the order (the booking -> coupon association's column)
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'couponId');
SET @sql := IF(@has = 0, 'ALTER TABLE bookings ADD COLUMN couponId INT NULL DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. The code as typed, shown on the summary and receipt
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'couponCode');
SET @sql := IF(@has = 0, 'ALTER TABLE bookings ADD COLUMN couponCode VARCHAR(50) NULL DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. The amount the code took off the total (separate from the business-level discount)
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'couponDiscount');
SET @sql := IF(@has = 0, 'ALTER TABLE bookings ADD COLUMN couponDiscount DECIMAL(10,2) NOT NULL DEFAULT 0.00', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- What is there now
SHOW COLUMNS FROM bookings WHERE Field IN ('couponId', 'couponCode', 'couponDiscount');

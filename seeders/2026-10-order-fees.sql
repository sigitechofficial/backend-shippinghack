-- Order fees, Shipito style (2026-10). Run ONCE on each database BEFORE deploying the
-- backend that uses it (every order query reads the new column). Safe to re-run.
-- Edit the amounts and switches in Admin > Pricing & charges > General > Order fees.

-- 1. The consolidation fee charged on a consolidated order (all its packages together)
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'consolidationFee');
SET @sql := IF(@has = 0, 'ALTER TABLE bookings ADD COLUMN consolidationFee DECIMAL(10,2) NULL DEFAULT 0.00', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. The admin's settings (Shipito's free-account numbers to start)
INSERT INTO generalCharges (title, `key`, value, information, createdAt, updatedAt)
SELECT 'Order fees', 'orderProcessingFee', 3.25, 'Orders: processing fee per package for normal customers ($)', NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM generalCharges WHERE `key` = 'orderProcessingFee');
INSERT INTO generalCharges (title, `key`, value, information, createdAt, updatedAt)
SELECT 'Order fees', 'orderConsolidationFee', 5.50, 'Orders: consolidation fee per package for normal customers ($)', NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM generalCharges WHERE `key` = 'orderConsolidationFee');
INSERT INTO generalCharges (title, `key`, value, information, createdAt, updatedAt)
SELECT 'Order fees', 'businessConsolidationFee', 3.25, 'Orders: consolidation fee per package for business users ($)', NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM generalCharges WHERE `key` = 'businessConsolidationFee');
INSERT INTO generalCharges (title, `key`, value, information, createdAt, updatedAt)
SELECT 'Order fees', 'orderFeesInternational', 1, 'Order fees on International orders: 0 = off, 1 = on', NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM generalCharges WHERE `key` = 'orderFeesInternational');
INSERT INTO generalCharges (title, `key`, value, information, createdAt, updatedAt)
SELECT 'Order fees', 'orderFeesLocal', 0, 'Order fees on Local orders: 0 = off, 1 = on', NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM generalCharges WHERE `key` = 'orderFeesLocal');

-- What is there now
SHOW COLUMNS FROM bookings WHERE Field IN ('processingFee', 'consolidationFee', 'businessLevel');
SELECT `key`, value FROM generalCharges WHERE `key` IN ('orderProcessingFee', 'orderConsolidationFee', 'businessConsolidationFee', 'orderFeesInternational', 'orderFeesLocal');

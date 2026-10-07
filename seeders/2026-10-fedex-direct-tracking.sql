-- International direct delivery by FedEx: FedEx's latest tracking status on the order.
-- Run ONCE on each database BEFORE deploying the backend that uses it (Sequelize selects
-- every model column, so a missing column breaks every query on bookings). Safe to re-run.
SET @has := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'carrierTracking');
SET @sql := IF(@has = 0, 'ALTER TABLE bookings ADD COLUMN carrierTracking JSON NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

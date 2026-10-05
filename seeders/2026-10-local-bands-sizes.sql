-- Local orders priced by the admin (2026-10). Run ONCE on each database BEFORE deploying
-- the backend that uses it. Safe to re-run: every step checks before it changes anything.
--
-- Local orders are now priced from the admin's Local rate bands of the Local company
-- (FedEx, logisticCompanies.id = 1): a flat price per band of charged weight, From < w <= To
-- in lb. The customer picks a weight band and a box size (Admin > Package sizes); the
-- charged weight is the larger of the band's To and the box's size weight
-- (L × W × H ÷ the company's divisor).

-- 1. The box size a Local package was sent in
SET @hadSizeId := (SELECT COUNT(*) FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'packages' AND COLUMN_NAME = 'sizeId');
SET @sql := IF(@hadSizeId = 0, 'ALTER TABLE packages ADD COLUMN sizeId INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Local bands of the Local company. The old ones held a price per lb, which now means
-- nothing, so on the first run they are switched off and replaced by starter flat prices.
-- Starter prices = FedEx's 2026 list price (Puerto Rico -> Puerto Rico, fuel included,
-- checked on fedex.com on 2026-10-05) for the band's top weight, plus about $8.
-- REVIEW THEM in Admin > Logistic companies > FedEx > Rates > Local.
-- The bands are round kg (2, 9, 22, 32, 45 kg and FedEx's 150 lb = 68.04 kg limit), stored in lb.
UPDATE logisticCompanyCharges
SET deleted = 1, status = 0
WHERE @hadSizeId = 0 AND logisticCompanyId = 1 AND bookingType = 'Local' AND deleted = 0;

SET @seedBands := (SELECT COUNT(*) FROM logisticCompanyCharges
                   WHERE logisticCompanyId = 1 AND bookingType = 'Local' AND deleted = 0) = 0;

INSERT INTO logisticCompanyCharges (startValue, endValue, ETA, bookingType, charges, status, deleted, flash, createdAt, updatedAt, logisticCompanyId)
SELECT 0.0000, 4.4092, '1-3', 'Local', 43.0000, 1, 0, 0, NOW(), NOW(), 1 FROM DUAL WHERE @seedBands
UNION ALL SELECT 4.4092, 19.8414, '1-3', 'Local', 46.0000, 1, 0, 0, NOW(), NOW(), 1 FROM DUAL WHERE @seedBands
UNION ALL SELECT 19.8414, 48.5012, '1-3', 'Local', 65.0000, 1, 0, 0, NOW(), NOW(), 1 FROM DUAL WHERE @seedBands
UNION ALL SELECT 48.5012, 70.5472, '1-3', 'Local', 178.0000, 1, 0, 0, NOW(), NOW(), 1 FROM DUAL WHERE @seedBands
UNION ALL SELECT 70.5472, 99.2070, '1-3', 'Local', 210.0000, 1, 0, 0, NOW(), NOW(), 1 FROM DUAL WHERE @seedBands
UNION ALL SELECT 99.2070, 150.0000, '1-3', 'Local', 267.0000, 1, 0, 0, NOW(), NOW(), 1 FROM DUAL WHERE @seedBands;

-- 3. A Metric unit system for package sizes (cm / kg), next to the existing Imperial one
INSERT INTO unitClasses (title, status, createdAt, updatedAt)
SELECT 'Metric', 1, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unitClasses WHERE title = 'Metric');

SET @metric := (SELECT id FROM unitClasses WHERE title = 'Metric' ORDER BY id LIMIT 1);

INSERT INTO systemUnits (type, name, symbol, conversionRate, status, unitClassId, createdAt, updatedAt)
SELECT 'weight', 'Kilograms', 'kg', 1, 1, @metric, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM systemUnits WHERE unitClassId = @metric AND type = 'weight');

INSERT INTO systemUnits (type, name, symbol, conversionRate, status, unitClassId, createdAt, updatedAt)
SELECT 'length', 'Centimetres', 'cm', 1, 1, @metric, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM systemUnits WHERE unitClassId = @metric AND type = 'length');

-- 4. Starter box sizes (only when there are no active sizes yet). Upload a picture for
-- each in Admin > Package sizes.
SET @seedSizes := (SELECT COUNT(*) FROM sizes WHERE status = 1) = 0;
SET @kg := (SELECT id FROM systemUnits WHERE unitClassId = @metric AND type = 'weight' ORDER BY id LIMIT 1);
SET @cm := (SELECT id FROM systemUnits WHERE unitClassId = @metric AND type = 'length' ORDER BY id LIMIT 1);

INSERT INTO sizes (title, weight, length, width, height, volume, image, status, createdAt, updatedAt, weightUnitId, lengthUnitId)
SELECT 'Extra small', 0, 20, 15, 10, 3000, '', 1, NOW(), NOW(), @kg, @cm FROM DUAL WHERE @seedSizes
UNION ALL SELECT 'Small', 0, 30, 30, 30, 27000, '', 1, NOW(), NOW(), @kg, @cm FROM DUAL WHERE @seedSizes
UNION ALL SELECT 'Medium', 0, 45, 35, 30, 47250, '', 1, NOW(), NOW(), @kg, @cm FROM DUAL WHERE @seedSizes
UNION ALL SELECT 'Large', 0, 60, 45, 45, 121500, '', 1, NOW(), NOW(), @kg, @cm FROM DUAL WHERE @seedSizes
UNION ALL SELECT 'Extra large', 0, 60, 60, 60, 216000, '', 1, NOW(), NOW(), @kg, @cm FROM DUAL WHERE @seedSizes;

-- Units and company rates (2026-10). Run ONCE on each database BEFORE deploying the
-- backend that uses it. Safe to re-run: the column changes are idempotent and the
-- inserts skip rows that already exist.
--
-- The database stores weight in lb, sizes in in (volume in³) and distance in km. A
-- unit's conversionRate is how many base units one of it is. Existing orders keep the
-- units row they were created with, so their numbers do not change.

-- 1. More decimals, so a value typed in kg / cm and stored in lb / in reads back exactly
ALTER TABLE packages
  MODIFY weight DECIMAL(14,4),
  MODIFY length DECIMAL(14,4),
  MODIFY width DECIMAL(14,4),
  MODIFY height DECIMAL(14,4),
  MODIFY actualWeight DECIMAL(14,4),
  MODIFY actualLength DECIMAL(14,4),
  MODIFY actualWidth DECIMAL(14,4),
  MODIFY actualHeight DECIMAL(14,4);

ALTER TABLE bookings
  MODIFY weight DECIMAL(10,4),
  MODIFY length DECIMAL(10,4),
  MODIFY width DECIMAL(10,4),
  MODIFY height DECIMAL(10,4);

-- Company rate bands: charged weight From < w <= To in lb, price per lb
ALTER TABLE logisticCompanyCharges
  MODIFY startValue DECIMAL(12,4) DEFAULT 0,
  MODIFY endValue DECIMAL(12,4) DEFAULT 0,
  MODIFY charges DECIMAL(12,4) DEFAULT 0;

-- Size-weight divisor in in³ per lb (139); can be typed as cm³ per kg (about 5022)
ALTER TABLE logisticCompanies
  MODIFY divisor DECIMAL(12,4) NULL;

-- 2. The four weight / size units with correct rates (1 kg = 2.2046 lb, 1 cm = 0.3937 in).
-- Older weight / size rows with other rates (e.g. kg = 1) are hidden (deleted = 1) but
-- kept, so the orders created with them still show their numbers.
UPDATE units SET deleted = 1
WHERE type = 'weight' AND deleted = 0
  AND NOT ((symbol = 'lb' AND conversionRate = 1.0000) OR (symbol = 'kg' AND conversionRate = 2.2046));

UPDATE units SET deleted = 1
WHERE type = 'length' AND deleted = 0
  AND NOT ((symbol = 'in' AND conversionRate = 1.0000) OR (symbol = 'cm' AND conversionRate = 0.3937));

INSERT INTO units (type, name, symbol, `desc`, status, conversionRate, deleted, createdAt, updatedAt)
SELECT 'weight', 'pound', 'lb', 'Base weight unit', 1, 1.0000, 0, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM units WHERE type = 'weight' AND symbol = 'lb' AND conversionRate = 1.0000 AND deleted = 0);

INSERT INTO units (type, name, symbol, `desc`, status, conversionRate, deleted, createdAt, updatedAt)
SELECT 'weight', 'kilogram', 'kg', '1 kg = 2.2046 lb', 1, 2.2046, 0, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM units WHERE type = 'weight' AND symbol = 'kg' AND conversionRate = 2.2046 AND deleted = 0);

INSERT INTO units (type, name, symbol, `desc`, status, conversionRate, deleted, createdAt, updatedAt)
SELECT 'length', 'inch', 'in', 'Base size unit', 1, 1.0000, 0, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM units WHERE type = 'length' AND symbol = 'in' AND conversionRate = 1.0000 AND deleted = 0);

INSERT INTO units (type, name, symbol, `desc`, status, conversionRate, deleted, createdAt, updatedAt)
SELECT 'length', 'centimetre', 'cm', '1 cm = 0.3937 in', 1, 0.3937, 0, NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM units WHERE type = 'length' AND symbol = 'cm' AND conversionRate = 0.3937 AND deleted = 0);

-- 3. If the active setting points at a hidden row, switch it to the correct row with the
-- same symbol (kg stays kg, cm stays cm; lb / in when the symbol is unknown). Distance
-- and currency stay as they are.
INSERT INTO appUnits (status, deleted, weightUnitId, lengthUnitId, distanceUnitId, currencyUnitId, createdAt, updatedAt)
SELECT 1, 0,
  COALESCE(
    (SELECT c.id FROM units c WHERE c.type = 'weight' AND c.deleted = 0 AND c.symbol = w.symbol ORDER BY c.id DESC LIMIT 1),
    (SELECT c.id FROM units c WHERE c.type = 'weight' AND c.deleted = 0 AND c.symbol = 'lb' ORDER BY c.id DESC LIMIT 1)),
  COALESCE(
    (SELECT c.id FROM units c WHERE c.type = 'length' AND c.deleted = 0 AND c.symbol = l.symbol ORDER BY c.id DESC LIMIT 1),
    (SELECT c.id FROM units c WHERE c.type = 'length' AND c.deleted = 0 AND c.symbol = 'in' ORDER BY c.id DESC LIMIT 1)),
  a.distanceUnitId, a.currencyUnitId, NOW(), NOW()
FROM appUnits a
JOIN units w ON w.id = a.weightUnitId
JOIN units l ON l.id = a.lengthUnitId
WHERE a.id = (SELECT id FROM (SELECT MAX(id) AS id FROM appUnits WHERE status = 1 AND deleted = 0) latest)
  AND (w.deleted = 1 OR l.deleted = 1);

-- keep only the newest setting active
UPDATE appUnits SET status = 0
WHERE status = 1
  AND id <> (SELECT id FROM (SELECT MAX(id) AS id FROM appUnits WHERE status = 1 AND deleted = 0) latest);

-- The base units, for reference (not read by the code)
UPDATE baseUnits SET
  weightUnitId = (SELECT id FROM units WHERE type = 'weight' AND symbol = 'lb' AND deleted = 0 ORDER BY id DESC LIMIT 1),
  lengthUnitId = (SELECT id FROM units WHERE type = 'length' AND symbol = 'in' AND deleted = 0 ORDER BY id DESC LIMIT 1);

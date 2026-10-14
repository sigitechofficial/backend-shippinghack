-- Business membership, Shipito style (2026-10). Run ONCE on each database BEFORE deploying
-- the backend that uses it. Safe to re-run: tables are only created when missing and the
-- starting rows are only added when the tables are empty.
--
-- A business user's level is earned from shipments in a calendar month (not bought).
-- Starting values copy Shipito for Business; edit them in Admin > Business plan.

-- 1. The four levels
CREATE TABLE IF NOT EXISTS businessLevels (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(50) NOT NULL,
  minShipments INT NOT NULL DEFAULT 0,
  processingFee DECIMAL(10,2) NOT NULL DEFAULT 0,
  discountPercent DECIMAL(5,2) NOT NULL DEFAULT 0,
  freeStorageDays INT NOT NULL DEFAULT 0,
  sortOrder INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO businessLevels (title, minShipments, processingFee, discountPercent, freeStorageDays, sortOrder, createdAt, updatedAt)
SELECT * FROM (
  SELECT 'Basic'   AS title,  0 AS minShipments, 2.25 AS processingFee,  0 AS discountPercent, 45 AS freeStorageDays, 1 AS sortOrder, NOW() AS createdAt, NOW() AS updatedAt
  UNION ALL SELECT 'Plus',    10, 1.25,  5, 45, 2, NOW(), NOW()
  UNION ALL SELECT 'Premium', 30, 0.75,  7, 60, 3, NOW(), NOW()
  UNION ALL SELECT 'Pro',     50, 0.00, 10, 90, 4, NOW(), NOW()
) seed
WHERE NOT EXISTS (SELECT 1 FROM businessLevels);

-- 2. Membership prices, level reset month, storage extension rules (one row)
CREATE TABLE IF NOT EXISTS businessSettings (
  id INT NOT NULL AUTO_INCREMENT,
  monthlyPrice DECIMAL(10,2) NOT NULL DEFAULT 12,
  yearlyPrice DECIMAL(10,2) NOT NULL DEFAULT 99,
  levelResetMonth INT NOT NULL DEFAULT 2,
  storageExtensionDays INT NOT NULL DEFAULT 7,
  storageExtensionFee DECIMAL(10,2) NOT NULL DEFAULT 7,
  storageExpiredDayFee DECIMAL(10,2) NOT NULL DEFAULT 1,
  storageMaxExtensions INT NOT NULL DEFAULT 4,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO businessSettings (createdAt, updatedAt)
SELECT NOW(), NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM businessSettings);

-- What is there now
SELECT id, title, minShipments, processingFee, discountPercent, freeStorageDays, sortOrder FROM businessLevels ORDER BY sortOrder;
SELECT * FROM businessSettings;

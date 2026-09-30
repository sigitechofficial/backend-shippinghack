-- Money-flow changes (2026-10). Run ONCE on each database BEFORE deploying the
-- backend that uses these columns (Sequelize selects every model column, so a
-- missing column breaks every query on that table).
-- MySQL 8 has no "ADD COLUMN IF NOT EXISTS": re-running the ALTERs fails with
-- "Duplicate column name", which is harmless.

-- T4: driver payouts recorded manually (bank transfer or cash)
ALTER TABLE paymentRequests
  ADD COLUMN method VARCHAR(20) NULL,
  ADD COLUMN reference VARCHAR(255) NULL,
  ADD COLUMN note TEXT NULL;

-- T6: FedEx shipping cost per booking (information only; filled when FedEx returns it)
ALTER TABLE bookings
  ADD COLUMN shippingCost DECIMAL(10,2) NULL;

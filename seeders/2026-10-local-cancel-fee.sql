-- Local orders: the cancellation fee each order was made with (admin: Pricing & charges).
-- Run before deploying the backend that reads bookings.cancelFee.
ALTER TABLE bookings ADD COLUMN cancelFee DECIMAL(10,2) NULL DEFAULT NULL;
SHOW COLUMNS FROM bookings LIKE 'cancelFee';

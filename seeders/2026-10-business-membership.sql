-- Business membership on Stripe (2026-10). Run ONCE on each database; safe to re-run.
-- The membership price can have cents (e.g. 12.50), so userPlans.price holds decimals.
ALTER TABLE userPlans MODIFY price DECIMAL(10,2) NULL;

-- What is there now
SHOW COLUMNS FROM userPlans LIKE 'price';

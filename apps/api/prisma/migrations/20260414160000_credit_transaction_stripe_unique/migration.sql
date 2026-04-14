-- Adds a unique index on credit_transactions.stripeId to prevent double-crediting
-- from duplicate Stripe webhook deliveries. NULL values remain non-unique
-- (PostgreSQL treats each NULL as distinct in unique indexes).
CREATE UNIQUE INDEX "credit_transactions_stripe_id_key"
  ON "credit_transactions"("stripeId")
  WHERE "stripeId" IS NOT NULL;

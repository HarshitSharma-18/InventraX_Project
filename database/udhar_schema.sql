DROP TABLE IF EXISTS udhar_transactions CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    user_id UUID,
    full_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    alternate_number TEXT,
    address TEXT,
    shop_name TEXT,
    notes TEXT,
    total_due NUMERIC DEFAULT 0,
    total_paid NUMERIC DEFAULT 0,
    trust_score INTEGER DEFAULT 100,
    last_transaction_date TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_customers_mobile ON customers(mobile_number);
CREATE INDEX idx_customers_full_name ON customers(full_name);


ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own customers" ON customers;
CREATE POLICY "Users can only access their own customers" 
ON customers FOR ALL 
USING ((user_id::text = auth.uid()::text OR user_id IS NULL) AND deleted_at IS NULL) 
WITH CHECK (user_id::text = auth.uid()::text OR user_id IS NULL);

CREATE TABLE IF NOT EXISTS udhar_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'CREDIT' or 'PAYMENT'
    amount NUMERIC NOT NULL,
    remarks TEXT
);

ALTER TABLE udhar_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own udhar_transactions" ON udhar_transactions;
CREATE POLICY "Users can only access their own udhar_transactions" 
ON udhar_transactions FOR ALL 
USING (user_id::text = auth.uid()::text OR user_id IS NULL) 
WITH CHECK (user_id::text = auth.uid()::text OR user_id IS NULL);

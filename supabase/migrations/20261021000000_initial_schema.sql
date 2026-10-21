-- ==============================================================================
-- FirstOption Solar Energy Company - Database Schema & Row Level Security
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Import Batches Table
CREATE TABLE IF NOT EXISTS import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    imported_count INTEGER NOT NULL DEFAULT 0,
    rejected_count INTEGER NOT NULL DEFAULT 0,
    duplicate_count INTEGER NOT NULL DEFAULT 0,
    total_rows INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Sales Transactions Table
CREATE TABLE IF NOT EXISTS sales_transactions (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    customer TEXT NOT NULL,
    sales_order_id TEXT DEFAULT '',
    contact TEXT DEFAULT '',
    status TEXT DEFAULT 'Returning' CHECK (status IN ('New', 'Returning', 'NEW', 'EXISTING')),
    customer_category TEXT DEFAULT 'End User',
    invoice_number TEXT NOT NULL DEFAULT '',
    item TEXT NOT NULL,
    part_number TEXT DEFAULT '',
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity >= 0),
    rate NUMERIC(14, 2) NOT NULL CHECK (rate >= 0),
    remark TEXT DEFAULT '',
    total NUMERIC(14, 2) NOT NULL CHECK (total >= 0),
    batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Roles / Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast query and filtering performance
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_transactions(date);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales_transactions(customer);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales_transactions(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_order ON sales_transactions(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_category ON sales_transactions(customer_category);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales_transactions(status);
CREATE INDEX IF NOT EXISTS idx_sales_item ON sales_transactions(item);
CREATE INDEX IF NOT EXISTS idx_sales_part_number ON sales_transactions(part_number);

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sales_transactions_updated_at
    BEFORE UPDATE ON sales_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Role check helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM user_profiles WHERE id = auth.uid();
    RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (is_admin());

CREATE POLICY "Admins can update profiles"
    ON user_profiles FOR UPDATE
    TO authenticated
    USING (is_admin());

-- Sales transactions read access: Any authenticated staff member (viewer or admin)
CREATE POLICY "Authenticated users can read sales transactions"
    ON sales_transactions FOR SELECT
    TO authenticated
    USING (true);

-- Sales transactions write access: Admins only
CREATE POLICY "Only admins can insert sales transactions"
    ON sales_transactions FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Only admins can update sales transactions"
    ON sales_transactions FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete sales transactions"
    ON sales_transactions FOR DELETE
    TO authenticated
    USING (is_admin());

-- Import batches policies
CREATE POLICY "Authenticated users can read import batches"
    ON import_batches FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can create import batches"
    ON import_batches FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- Automatic profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_count INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.user_profiles;
    -- Automatically make the very first registered user an administrator
    INSERT INTO public.user_profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        CASE WHEN user_count = 0 THEN 'admin' ELSE 'viewer' END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create test_otps table to store verification codes intercepted from Supabase email hooks
CREATE TABLE IF NOT EXISTS public.test_otps (
    email TEXT PRIMARY KEY,
    otp TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.test_otps ENABLE ROW LEVEL SECURITY;

-- Allow public read access to test_otps (so the frontend can query it)
DROP POLICY IF EXISTS "Allow public read access to test_otps" ON public.test_otps;
CREATE POLICY "Allow public read access to test_otps" 
ON public.test_otps FOR SELECT 
USING (true);

-- Allow service role / admin to write to test_otps (handled via the webhook route)
DROP POLICY IF EXISTS "Allow service role write access to test_otps" ON public.test_otps;
CREATE POLICY "Allow service role write access to test_otps" 
ON public.test_otps FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

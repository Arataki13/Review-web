-- 1. Add user_id column referencing auth.users table
ALTER TABLE public.entries 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Enable Row Level Security (just in case it's not already enabled)
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing public access policies
DROP POLICY IF EXISTS "Allow public read" ON public.entries;
DROP POLICY IF EXISTS "Allow public insert" ON public.entries;
DROP POLICY IF EXISTS "Allow public update" ON public.entries;
DROP POLICY IF EXISTS "Allow public delete" ON public.entries;

-- 3. Create strict RLS policies to restrict read/write access to the authenticated owner only
CREATE POLICY "Allow authenticated read" 
ON public.entries 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated insert" 
ON public.entries 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated update" 
ON public.entries 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated delete" 
ON public.entries 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

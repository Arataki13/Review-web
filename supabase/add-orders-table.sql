-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    game_title TEXT NOT NULL,
    game_poster TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'LKR' NOT NULL,
    status TEXT CHECK (status IN ('pending', 'paid', 'failed')) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated read own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated update own orders" ON public.orders;

-- Create policies for authenticated user owner
CREATE POLICY "Allow authenticated read own orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated insert own orders" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated update own orders" 
ON public.orders FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_game_id_idx ON public.orders (game_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);

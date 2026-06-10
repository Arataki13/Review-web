-- Create entries table
CREATE TABLE IF NOT EXISTS public.entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('movie', 'tvshow', 'game')) NOT NULL,
    status TEXT CHECK (status IN ('finished', 'wishlist', 'current', 'dropped')) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
-- Note: In a real-world app with logins, you would restrict this. 
-- For this single-user local app, we allow public read, insert, update, and delete access.
CREATE POLICY "Allow public read" ON public.entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.entries FOR DELETE USING (true);

-- Create index for faster querying by category and status
CREATE INDEX IF NOT EXISTS entries_category_idx ON public.entries (category);
CREATE INDEX IF NOT EXISTS entries_status_idx ON public.entries (status);

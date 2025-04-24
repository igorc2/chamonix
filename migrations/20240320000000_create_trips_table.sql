-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own trips
CREATE POLICY "Users can view their own trips"
    ON public.trips
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own trips
CREATE POLICY "Users can insert their own trips"
    ON public.trips
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own trips
CREATE POLICY "Users can update their own trips"
    ON public.trips
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own trips
CREATE POLICY "Users can delete their own trips"
    ON public.trips
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.trips
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 
-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('hotel', 'transport', 'activity', 'other')),
    title TEXT NOT NULL,
    confirmation_number TEXT,
    date DATE NOT NULL,
    time TEXT,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('hotel', 'activity', 'restaurant', 'other')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for activities table
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own activities
CREATE POLICY "Users can view their own activities"
    ON public.activities
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = activities.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Policy to allow users to insert their own activities
CREATE POLICY "Users can insert their own activities"
    ON public.activities
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = activities.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Policy to allow users to update their own activities
CREATE POLICY "Users can update their own activities"
    ON public.activities
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = activities.trip_id
        AND trips.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = activities.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Policy to allow users to delete their own activities
CREATE POLICY "Users can delete their own activities"
    ON public.activities
    FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = activities.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Enable RLS for bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own bookings
CREATE POLICY "Users can view their own bookings"
    ON public.bookings
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = bookings.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Policy to allow users to insert their own bookings
CREATE POLICY "Users can insert their own bookings"
    ON public.bookings
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = bookings.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Policy to allow users to update their own bookings
CREATE POLICY "Users can update their own bookings"
    ON public.bookings
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = bookings.trip_id
        AND trips.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = bookings.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Policy to allow users to delete their own bookings
CREATE POLICY "Users can delete their own bookings"
    ON public.bookings
    FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = bookings.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Enable RLS for locations table
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own locations
CREATE POLICY "Users can view their own locations"
    ON public.locations
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = locations.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Policy to allow users to insert their own locations
CREATE POLICY "Users can insert their own locations"
    ON public.locations
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = locations.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Policy to allow users to update their own locations
CREATE POLICY "Users can update their own locations"
    ON public.locations
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = locations.trip_id
        AND trips.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = locations.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Policy to allow users to delete their own locations
CREATE POLICY "Users can delete their own locations"
    ON public.locations
    FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = locations.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 
-- Drop existing policies first
DROP POLICY IF EXISTS "Shared users can view trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view their own or shared trips" ON public.trips;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.can_access_trip(UUID);

-- Drop existing trip shares table
DROP TABLE IF EXISTS public.trip_shares CASCADE;

-- Create a function to check trip access
CREATE OR REPLACE FUNCTION public.can_access_trip(check_trip_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.trips t
        WHERE t.id = check_trip_id
        AND (
            t.user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.trip_shares ts
                WHERE ts.trip_id = check_trip_id
                AND ts.shared_with_email = auth.jwt()->>'email'
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trip shares table
CREATE TABLE IF NOT EXISTS public.trip_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    shared_with_email TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trip_id, shared_with_email)
);

-- Create RLS policies for trip shares
ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;

-- Policy to allow trip owners to view shares
CREATE POLICY "Trip owners can view shares"
    ON public.trip_shares
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trips t
            WHERE t.id = trip_shares.trip_id
            AND t.user_id = auth.uid()
        )
    );

-- Policy to allow trip owners to create shares
CREATE POLICY "Trip owners can create shares"
    ON public.trip_shares
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trips t
            WHERE t.id = trip_shares.trip_id
            AND t.user_id = auth.uid()
        )
    );

-- Policy to allow trip owners to delete shares
CREATE POLICY "Trip owners can delete shares"
    ON public.trip_shares
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.trips t
            WHERE t.id = trip_shares.trip_id
            AND t.user_id = auth.uid()
        )
    );

-- Create a new policy for viewing trips using the function
CREATE POLICY "Users can view their own or shared trips"
    ON public.trips
    FOR SELECT
    USING (public.can_access_trip(id)); 
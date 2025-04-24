-- Add file_name and file_url columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT; 
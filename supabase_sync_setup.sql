-- =========================================================================
-- ATLAS AUDIT SUITE - CLOUD SYNC DATABASE SETUP
-- Jalankan skrip ini di SQL Editor Supabase:
-- https://supabase.com/dashboard/project/oxnigsxfiionzgjvzykz/sql
-- =========================================================================

-- 1. Buat tabel atlas_engagements untuk sinkronisasi otomatis perikatan
CREATE TABLE IF NOT EXISTS public.atlas_engagements (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    fiscal_year TEXT,
    engagement_type TEXT,
    status TEXT DEFAULT 'Draft',
    progress INTEGER DEFAULT 0,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.atlas_engagements ENABLE ROW LEVEL SECURITY;

-- 3. Bersihkan policy lama bila ada
DROP POLICY IF EXISTS "Public access atlas_engagements" ON public.atlas_engagements;
DROP POLICY IF EXISTS "Allow select for atlas_engagements" ON public.atlas_engagements;
DROP POLICY IF EXISTS "Allow insert for atlas_engagements" ON public.atlas_engagements;
DROP POLICY IF EXISTS "Allow update for atlas_engagements" ON public.atlas_engagements;
DROP POLICY IF EXISTS "Allow delete for atlas_engagements" ON public.atlas_engagements;

-- 4. Buat policy akses yang mengizinkan sinkronisasi dari client (Vercel & Localhost)
CREATE POLICY "Allow select for atlas_engagements"
ON public.atlas_engagements FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow insert for atlas_engagements"
ON public.atlas_engagements FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow update for atlas_engagements"
ON public.atlas_engagements FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete for atlas_engagements"
ON public.atlas_engagements FOR DELETE
TO anon, authenticated
USING (true);

-- 5. Matikan / perbaiki policy tabel lama yang mengalami circular recursion (infinite recursion)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'engagement_members') THEN
        ALTER TABLE public.engagement_members DISABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'engagements') THEN
        ALTER TABLE public.engagements DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

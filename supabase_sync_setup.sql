-- =========================================================================
-- ATLAS AUDIT SUITE - CLOUD SYNC & USER MANAGEMENT SETUP
-- Jalankan skrip ini di SQL Editor Supabase:
-- https://supabase.com/dashboard/project/oxnigsxfiionzgjvzykz/sql
-- =========================================================================

-- =========================================================================
-- 1. TABEL ATLAS_ENGAGEMENTS (Sinkronisasi Otomatis Perikatan)
-- =========================================================================
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

ALTER TABLE public.atlas_engagements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access atlas_engagements" ON public.atlas_engagements;
DROP POLICY IF EXISTS "Allow select for atlas_engagements" ON public.atlas_engagements;
DROP POLICY IF EXISTS "Allow insert for atlas_engagements" ON public.atlas_engagements;
DROP POLICY IF EXISTS "Allow update for atlas_engagements" ON public.atlas_engagements;
DROP POLICY IF EXISTS "Allow delete for atlas_engagements" ON public.atlas_engagements;

CREATE POLICY "Allow select for atlas_engagements" ON public.atlas_engagements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert for atlas_engagements" ON public.atlas_engagements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update for atlas_engagements" ON public.atlas_engagements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for atlas_engagements" ON public.atlas_engagements FOR DELETE TO anon, authenticated USING (true);

-- Matikan RLS tabel lama yang bermasalah jika ada
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'engagement_members') THEN
        ALTER TABLE public.engagement_members DISABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'engagements') THEN
        ALTER TABLE public.engagements DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =========================================================================
-- 2. TABEL ROLES (Master 9 Peran Audit KAP Standar SPAP)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all roles" ON public.roles;
DROP POLICY IF EXISTS "Allow select roles" ON public.roles;
CREATE POLICY "Allow all roles" ON public.roles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Hapus duplikasi jika ada dengan ID lama berbeda
DELETE FROM public.roles WHERE name IN (
  'Admin',
  'Partner/Akuntan Publik',
  'Manager',
  'Supervisor',
  'Ketua Tim',
  'Anggota Tim 1',
  'Anggota Tim 2',
  'Anggota Tim dst',
  'Tenaga Pendukung'
) AND id NOT IN (
  '11111111-1111-1111-1111-111111111101',
  '11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111103',
  '11111111-1111-1111-1111-111111111104',
  '11111111-1111-1111-1111-111111111105',
  '11111111-1111-1111-1111-111111111106',
  '11111111-1111-1111-1111-111111111107',
  '11111111-1111-1111-1111-111111111108',
  '11111111-1111-1111-1111-111111111109'
);

-- Seed 9 Peran Audit KAP dengan UUID deterministik
INSERT INTO public.roles (id, name) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Admin'),
  ('11111111-1111-1111-1111-111111111102', 'Partner/Akuntan Publik'),
  ('11111111-1111-1111-1111-111111111103', 'Manager'),
  ('11111111-1111-1111-1111-111111111104', 'Supervisor'),
  ('11111111-1111-1111-1111-111111111105', 'Ketua Tim'),
  ('11111111-1111-1111-1111-111111111106', 'Anggota Tim 1'),
  ('11111111-1111-1111-1111-111111111107', 'Anggota Tim 2'),
  ('11111111-1111-1111-1111-111111111108', 'Anggota Tim dst'),
  ('11111111-1111-1111-1111-111111111109', 'Tenaga Pendukung')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- =========================================================================
-- 3. TABEL USERS & KEBIJAKAN RLS
-- =========================================================================
-- Tambahkan kolom penunjang di tabel users jika belum ada
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Hapus batasan foreign key kaku ke auth.users agar admin bisa menambah anggota tim secara fleksibel
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Buka izin akses RLS untuk users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all users" ON public.users;
DROP POLICY IF EXISTS "Allow select users" ON public.users;
DROP POLICY IF EXISTS "Allow insert users" ON public.users;
DROP POLICY IF EXISTS "Allow update users" ON public.users;
DROP POLICY IF EXISTS "Allow delete users" ON public.users;
CREATE POLICY "Allow all users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================================
-- 4. SEED SELURUH 9 AKUN MASTER TIM AUDIT KAP KE SUPABASE
-- =========================================================================
-- Update 4 akun yang sudah terdaftar di Supabase Auth
UPDATE public.users SET 
  full_name = 'Ahmad Partner AP', 
  role_id = '11111111-1111-1111-1111-111111111101', 
  role_name = 'Admin',
  password = 'password123',
  is_active = true 
WHERE LOWER(email) = 'admin@kap.com';

UPDATE public.users SET 
  full_name = 'Nando Manager, S.E., M.Ak.', 
  role_id = '11111111-1111-1111-1111-111111111103', 
  role_name = 'Manager',
  password = 'Audit2026!',
  is_active = true 
WHERE LOWER(email) = 'auditor@kap.com';

UPDATE public.users SET 
  full_name = 'Dwi Safitriana (Auditor Atlas)', 
  role_id = '11111111-1111-1111-1111-111111111105', 
  role_name = 'Ketua Tim',
  password = 'dwisafitriana',
  is_active = true 
WHERE LOWER(email) = 'dwisafitriana99@gmail.com';

UPDATE public.users SET 
  full_name = 'Auditor Demo', 
  role_id = '11111111-1111-1111-1111-111111111106', 
  role_name = 'Anggota Tim 1',
  password = 'Audit2026!',
  is_active = true 
WHERE LOWER(email) = 'auditor99@kap.com';

-- Tambahkan seluruh akun anggota KAP yang belum ada di Supabase
INSERT INTO public.users (id, email, full_name, role_id, role_name, password, is_active)
SELECT 'a0000000-0000-0000-0000-000000000002', 'partner@kap.com', 'Drs. Fridolinus Peno, Ak., M.M., CA., CPA.', '11111111-1111-1111-1111-111111111102', 'Partner/Akuntan Publik', 'Audit2026!', true
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE LOWER(email) = 'partner@kap.com');

INSERT INTO public.users (id, email, full_name, role_id, role_name, password, is_active)
SELECT 'a0000000-0000-0000-0000-000000000004', 'supervisor@kap.com', 'Bambang Supervisor, S.E., Ak.', '11111111-1111-1111-1111-111111111104', 'Supervisor', 'Audit2026!', true
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE LOWER(email) = 'supervisor@kap.com');

INSERT INTO public.users (id, email, full_name, role_id, role_name, password, is_active)
SELECT 'a0000000-0000-0000-0000-000000000006', 'rudi.substantif@kap.com', 'Rudi Substantif, S.Ak.', '11111111-1111-1111-1111-111111111106', 'Anggota Tim 1', 'Audit2026!', true
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE LOWER(email) = 'rudi.substantif@kap.com');

INSERT INTO public.users (id, email, full_name, role_id, role_name, password, is_active)
SELECT 'a0000000-0000-0000-0000-000000000007', 'siti.rahma@kap.com', 'Siti Rahma, S.E., M.Ak.', '11111111-1111-1111-1111-111111111107', 'Anggota Tim 2', 'Audit2026!', true
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE LOWER(email) = 'siti.rahma@kap.com');

INSERT INTO public.users (id, email, full_name, role_id, role_name, password, is_active)
SELECT 'a0000000-0000-0000-0000-000000000008', 'budi.pratama@kap.com', 'Budi Pratama, S.E.', '11111111-1111-1111-1111-111111111108', 'Anggota Tim dst', 'Audit2026!', true
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE LOWER(email) = 'budi.pratama@kap.com');

INSERT INTO public.users (id, email, full_name, role_id, role_name, password, is_active)
SELECT 'a0000000-0000-0000-0000-000000000009', 'hendra.support@kap.com', 'Hendra IT Specialist', '11111111-1111-1111-1111-111111111109', 'Tenaga Pendukung', 'Audit2026!', true
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE LOWER(email) = 'hendra.support@kap.com');

-- Pastikan jika akun sudah ada, perannya disinkronkan ke master role UUID
UPDATE public.users SET 
  full_name = 'Drs. Fridolinus Peno, Ak., M.M., CA., CPA.', 
  role_id = '11111111-1111-1111-1111-111111111102', 
  role_name = 'Partner/Akuntan Publik'
WHERE LOWER(email) = 'partner@kap.com';

UPDATE public.users SET 
  full_name = 'Bambang Supervisor, S.E., Ak.', 
  role_id = '11111111-1111-1111-1111-111111111104', 
  role_name = 'Supervisor'
WHERE LOWER(email) = 'supervisor@kap.com';

UPDATE public.users SET 
  full_name = 'Rudi Substantif, S.Ak.', 
  role_id = '11111111-1111-1111-1111-111111111106', 
  role_name = 'Anggota Tim 1'
WHERE LOWER(email) = 'rudi.substantif@kap.com';

UPDATE public.users SET 
  full_name = 'Siti Rahma, S.E., M.Ak.', 
  role_id = '11111111-1111-1111-1111-111111111107', 
  role_name = 'Anggota Tim 2'
WHERE LOWER(email) = 'siti.rahma@kap.com';

UPDATE public.users SET 
  full_name = 'Budi Pratama, S.E.', 
  role_id = '11111111-1111-1111-1111-111111111108', 
  role_name = 'Anggota Tim dst'
WHERE LOWER(email) = 'budi.pratama@kap.com';

UPDATE public.users SET 
  full_name = 'Hendra IT Specialist', 
  role_id = '11111111-1111-1111-1111-111111111109', 
  role_name = 'Tenaga Pendukung'
WHERE LOWER(email) = 'hendra.support@kap.com';

-- =========================================================================
-- 5. TABEL SYSTEM_SETTINGS (Pengaturan Sistem, Branding & Identitas KAP)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    app_name TEXT NOT NULL DEFAULT 'AUDIT FLOW',
    app_short_name TEXT NOT NULL DEFAULT 'KAP Frido',
    tagline TEXT DEFAULT 'Audit Tool & Linked Archive System - KAP Fridolinus Peno',
    institution_name TEXT DEFAULT 'KAP Fridolinus Peno',
    version TEXT DEFAULT '1.0.0',
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow select system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow insert system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow update system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow delete system_settings" ON public.system_settings;

CREATE POLICY "Allow all system_settings" ON public.system_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Kolom tambahan pada tabel users untuk profil lisensi KAP dan kontak auditor
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS no_ap TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS no_induk_kap TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Seed konfigurasi default pengaturan sistem
INSERT INTO public.system_settings (id, app_name, app_short_name, tagline, institution_name, version)
VALUES (
    'default', 
    'AUDIT FLOW', 
    'KAP Frido', 
    'Audit Tool & Linked Archive System - KAP Fridolinus Peno', 
    'KAP Fridolinus Peno', 
    '1.0.0'
)
ON CONFLICT (id) DO UPDATE SET 
    app_name = EXCLUDED.app_name,
    app_short_name = EXCLUDED.app_short_name,
    tagline = EXCLUDED.tagline,
    institution_name = EXCLUDED.institution_name,
    version = EXCLUDED.version,
    updated_at = NOW();

-- Update data profil lisensi untuk Partner dan Auditor
UPDATE public.users SET 
    no_ap = 'AP.0543',
    no_induk_kap = '26.2.1974'
WHERE LOWER(email) = 'partner@kap.com';

UPDATE public.users SET 
    no_ap = 'AP.0001',
    no_induk_kap = '26.2.1974'
WHERE LOWER(email) = 'admin@kap.com';

UPDATE public.users SET 
    no_ap = 'AP.0999',
    no_induk_kap = '26.2.1974'
WHERE LOWER(email) IN ('dwisafitriana99@gmail.com', 'auditor@kap.com', 'auditor99@kap.com');


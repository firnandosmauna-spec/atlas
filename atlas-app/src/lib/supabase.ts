import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://oxnigsxfiionzgjvzykz.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bmlnc3hmaWlvbnpnanZ6eWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NDY1MzMsImV4cCI6MjEwNjQyMjUzM30.IJ-deUI2lID2ccKhXFdkRRULNwTzkblSVnMekS2WwnA';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

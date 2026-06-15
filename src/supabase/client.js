import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jdtfgkyxgurvjqaewshg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkdGZna3l4Z3VydmpxYWV3c2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDcyNDksImV4cCI6MjA5NzAyMzI0OX0.5VxZ8K7Q9hL3wP6mR2nT8yJ4fX1kZ9vC7qW3pD8yN4k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

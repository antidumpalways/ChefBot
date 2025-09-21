import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bvjqvlpxccfxxsammsoo.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase


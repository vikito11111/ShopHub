import { supabase } from './supabase.js'

export async function loginWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function registerWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

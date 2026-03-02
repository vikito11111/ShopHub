import { supabase } from './supabase.js'

export async function getLatestProducts(limit = 8) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, price, image_url, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { data: data ?? [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

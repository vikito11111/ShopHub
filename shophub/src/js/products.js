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

export async function getCategories() {
  try {
    const { data, error } = await supabase.from('categories').select('id, name').order('name')

    if (error) throw error

    return { data: data ?? [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

export async function getActiveProducts({ search = '', categoryId = '' } = {}) {
  try {
    let query = supabase
      .from('products')
      .select('id, title, description, price, image_url, created_at, category_id')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    if (categoryId) {
      query = query.eq('category_id', Number(categoryId))
    }

    const { data, error } = await query
    if (error) throw error

    return { data: data ?? [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

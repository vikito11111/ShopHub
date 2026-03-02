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

export async function getProductById(productId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, seller_id, category_id, title, description, price, image_url, status, created_at')
      .eq('id', productId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getProfileById(profileId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', profileId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function createOrder({ buyerId, productId }) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({ buyer_id: buyerId, product_id: productId })
      .select('id')
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function deleteOwnProduct(productId, sellerId) {
  try {
    const { error } = await supabase
      .from('products')
      .update({ status: 'deleted' })
      .eq('id', productId)
      .eq('seller_id', sellerId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    return { error }
  }
}

export async function createProduct(productInput) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productInput)
      .select('id')
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function updateOwnProduct(productId, sellerId, updateInput) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updateInput)
      .eq('id', productId)
      .eq('seller_id', sellerId)
      .select('id')
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getProductsBySeller(sellerId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, price, image_url, status, created_at')
      .eq('seller_id', sellerId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data ?? [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

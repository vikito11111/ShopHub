import { supabase } from './supabase.js'

export async function getProfileRole(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getAdminUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, role, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data ?? [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

export async function updateUserRole(userId, role) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select('id, role')
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getAdminProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, seller_id, title, price, status, image_url, created_at')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data ?? [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

export async function deleteProductAsAdmin(productId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ status: 'deleted' })
      .eq('id', productId)
      .select('id')
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

async function countRows(tableName, filters = []) {
  let query = supabase.from(tableName).select('*', { count: 'exact', head: true })

  filters.forEach((filter) => {
    query = query[filter.type](filter.column, filter.value)
  })

  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

export async function getAdminStats() {
  try {
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      countRows('profiles'),
      countRows('products', [{ type: 'neq', column: 'status', value: 'deleted' }]),
      countRows('orders')
    ])

    return {
      data: { totalUsers, totalProducts, totalOrders },
      error: null
    }
  } catch (error) {
    return { data: null, error }
  }
}

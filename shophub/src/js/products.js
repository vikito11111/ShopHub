import { supabase } from './supabase.js'

export async function getLatestProducts(limit = 8) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, price, quantity, image_url, status, created_at, categories(name)')
      .in('status', ['active', 'sold'])
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
      .select('id, title, description, price, quantity, image_url, status, created_at, category_id')
      .in('status', ['active', 'sold'])
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
      .select('id, seller_id, category_id, title, description, price, quantity, image_url, status, created_at')
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
      .select('id, title, description, price, quantity, image_url, status, created_at')
      .eq('seller_id', sellerId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data ?? [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

export async function markOwnProductAsSold(productId, sellerId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ status: 'sold', quantity: 0 })
      .eq('id', productId)
      .eq('seller_id', sellerId)
      .neq('status', 'deleted')
      .select('id')
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function hasUserPurchasedProduct(userId, productId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('buyer_id', userId)
      .eq('product_id', productId)
      .limit(1)

    if (error) throw error

    return { data: Boolean(data?.length), error: null }
  } catch (error) {
    return { data: false, error }
  }
}

export async function hasUserReviewedProduct(userId, productId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', userId)
      .eq('product_id', productId)
      .limit(1)

    if (error) throw error

    return { data: Boolean(data?.length), error: null }
  } catch (error) {
    return { data: false, error }
  }
}

export async function getProductReviews(productId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, profiles!reviews_reviewer_id_fkey(username)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data ?? [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

export async function createProductReview({ productId, reviewerId, rating, comment }) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        reviewer_id: reviewerId,
        rating,
        comment
      })
      .select('id')
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getRelatedProducts({ productId, categoryId, limit = 4 }) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, price, image_url, created_at')
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .neq('id', productId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { data: data ?? [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

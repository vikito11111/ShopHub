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

export async function getActiveProducts({
  search = '',
  categoryId = '',
  sort = 'most_recent',
  page = 1,
  pageSize = 24
} = {}) {
  try {
    const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const safePageSize = Number.isFinite(Number(pageSize)) && Number(pageSize) > 0 ? Number(pageSize) : 24
    const rangeStart = (safePage - 1) * safePageSize
    const rangeEnd = rangeStart + safePageSize - 1

    let query = supabase
      .from('products')
      .select('id, title, description, price, quantity, image_url, status, created_at, category_id', {
        count: 'exact'
      })
      .in('status', ['active', 'sold'])

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    if (categoryId) {
      query = query.eq('category_id', Number(categoryId))
    }

    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true })
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query.range(rangeStart, rangeEnd)
    if (error) throw error

    return { data: data ?? [], total: count ?? 0, error: null }
  } catch (error) {
    return { data: [], total: 0, error }
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
      .select('id, username, avatar_url, created_at')
      .eq('id', profileId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getActiveProductsBySeller(sellerId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, price, quantity, image_url, status, created_at, categories(name)')
      .eq('seller_id', sellerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data ?? [], error: null }
  } catch (error) {
    return { data: [], error }
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

export async function getAverageRatingsByProductIds(productIds = []) {
  try {
    if (!Array.isArray(productIds) || !productIds.length) {
      return { data: {}, error: null }
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('product_id, rating')
      .in('product_id', productIds)

    if (error) throw error

    const totals = {}

    for (const row of data ?? []) {
      const productId = row.product_id
      if (!productId) continue

      if (!totals[productId]) {
        totals[productId] = { sum: 0, count: 0 }
      }

      totals[productId].sum += Number(row.rating ?? 0)
      totals[productId].count += 1
    }

    const averages = {}

    Object.keys(totals).forEach((productId) => {
      const entry = totals[productId]
      if (entry.count > 0) {
        averages[productId] = entry.sum / entry.count
      }
    })

    return { data: averages, error: null }
  } catch (error) {
    return { data: {}, error }
  }
}

export async function getPurchaseCountsByProductIds(productIds = []) {
  try {
    if (!Array.isArray(productIds) || !productIds.length) {
      return { data: {}, error: null }
    }

    const { data, error } = await supabase
      .from('orders')
      .select('product_id')
      .in('product_id', productIds)

    if (error) throw error

    const counts = {}

    for (const row of data ?? []) {
      const productId = row.product_id
      if (!productId) continue
      counts[productId] = (counts[productId] ?? 0) + 1
    }

    return { data: counts, error: null }
  } catch (error) {
    return { data: {}, error }
  }
}

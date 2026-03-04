import { supabase } from './supabase.js'

async function getCurrentUser() {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    return user ?? null
  } catch (error) {
    return null
  }
}

export async function isWishlisted(productId) {
  try {
    const user = await getCurrentUser()

    if (!user || !productId) {
      return { data: false, error: null }
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .limit(1)

    if (error) throw error

    return { data: Boolean(data?.length), error: null }
  } catch (error) {
    return { data: false, error }
  }
}

export async function toggleWishlist(productId) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { data: null, error: null, requiresAuth: true }
    }

    const { data: existingRows, error: existingError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .limit(1)

    if (existingError) throw existingError

    const existing = existingRows?.[0]

    if (existing) {
      const { error: deleteError } = await supabase.from('wishlists').delete().eq('id', existing.id)
      if (deleteError) throw deleteError

      return {
        data: {
          wishlisted: false,
          productId
        },
        error: null,
        requiresAuth: false
      }
    }

    const { error: insertError } = await supabase.from('wishlists').insert({
      user_id: user.id,
      product_id: productId
    })

    if (insertError) throw insertError

    return {
      data: {
        wishlisted: true,
        productId
      },
      error: null,
      requiresAuth: false
    }
  } catch (error) {
    return { data: null, error, requiresAuth: false }
  }
}

export async function getUserWishlist() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { data: [], error: null, requiresAuth: true }
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select(
        `
        id,
        product_id,
        created_at,
        products:products!wishlists_product_id_fkey(
          id,
          seller_id,
          category_id,
          title,
          description,
          price,
          quantity,
          image_url,
          status,
          created_at
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const entries = (data ?? [])
      .filter((row) => row.products && row.products.status !== 'deleted')
      .map((row) => ({
        id: row.id,
        product_id: row.product_id,
        created_at: row.created_at,
        product: row.products
      }))

    return { data: entries, error: null, requiresAuth: false }
  } catch (error) {
    return { data: [], error, requiresAuth: false }
  }
}

export async function removeFromWishlist(productId) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { data: { removed: false, productId }, error: null, requiresAuth: true }
    }

    if (!productId) {
      return { data: { removed: false, productId: null }, error: null, requiresAuth: false }
    }

    const { data: existingRows, error: existingError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .limit(1)

    if (existingError) throw existingError

    const existing = existingRows?.[0]

    if (!existing) {
      return { data: { removed: false, productId }, error: null, requiresAuth: false }
    }

    const { error: deleteError } = await supabase.from('wishlists').delete().eq('id', existing.id)

    if (deleteError) throw deleteError

    return { data: { removed: true, productId }, error: null, requiresAuth: false }
  } catch (error) {
    return { data: { removed: false, productId }, error, requiresAuth: false }
  }
}

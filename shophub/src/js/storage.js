import { supabase } from './supabase.js'

export async function uploadProductImage(file) {
  try {
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) throw error

    const {
      data: { publicUrl }
    } = supabase.storage.from('product-images').getPublicUrl(fileName)

    return { data: { publicUrl }, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

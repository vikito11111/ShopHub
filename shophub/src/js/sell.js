import { supabase } from './supabase.js'
import { createProduct, getCategories, getProductById, updateOwnProduct } from './products.js'
import { uploadProductImage } from './storage.js'
import { showToast } from './utils.js'

const params = new URLSearchParams(window.location.search)
const editProductId = params.get('id')

const pageTitle = document.getElementById('sell-page-title')
const pageSubtitle = document.getElementById('sell-page-subtitle')
const form = document.getElementById('sell-form')
const titleInput = document.getElementById('sell-title')
const descriptionInput = document.getElementById('sell-description')
const priceInput = document.getElementById('sell-price')
const categoryInput = document.getElementById('sell-category')
const quantityInput = document.getElementById('sell-quantity')
const imageInput = document.getElementById('sell-image')
const imagePreviewWrap = document.getElementById('sell-image-preview-wrap')
const imagePreview = document.getElementById('sell-image-preview')
const currentImageWrap = document.getElementById('current-image-wrap')
const currentImage = document.getElementById('current-image')
const submitButton = document.getElementById('sell-submit-btn')
const submitButtonText = document.getElementById('sell-submit-text')
const submitSpinner = document.getElementById('sell-submit-spinner')

let currentUser = null
let existingImageUrl = ''

function setSubmitting(submitting) {
  submitButton.disabled = submitting
  submitSpinner.classList.toggle('d-none', !submitting)
  submitButtonText.textContent = submitting
    ? editProductId
      ? 'Updating...'
      : 'Publishing...'
    : editProductId
      ? 'Update Listing'
      : 'Publish Listing'
}

async function requireAuthUser() {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = './login.html'
    return null
  }

  return user
}

async function loadCategories() {
  const { data, error } = await getCategories()
  if (error) {
    showToast('Could not load categories. Please refresh the page.', 'error')
    return
  }

  categoryInput.innerHTML = [
    '<option value="" selected disabled>Select a category</option>',
    ...data.map((category) => `<option value="${category.id}">${category.name}</option>`)
  ].join('')
}

async function loadEditModeData() {
  if (!editProductId) return

  pageTitle.textContent = 'Edit Listing'
  pageSubtitle.textContent = 'Update your listing details and save your changes.'

  const { data: product, error } = await getProductById(editProductId)
  if (error || !product) {
    showToast('Listing not found.', 'error')
    window.location.href = './profile.html'
    return
  }

  if (product.seller_id !== currentUser.id) {
    showToast('You can only edit your own listings.', 'error')
    window.location.href = './profile.html'
    return
  }

  titleInput.value = product.title || ''
  descriptionInput.value = product.description || ''
  priceInput.value = product.price ?? ''
  categoryInput.value = product.category_id ? String(product.category_id) : ''
  quantityInput.value = product.quantity ? String(product.quantity) : '1'

  existingImageUrl = product.image_url || ''
  if (existingImageUrl) {
    currentImage.src = existingImageUrl
    currentImageWrap.classList.remove('d-none')
  }
}

async function resolveImageUrl() {
  const file = imageInput.files?.[0]
  if (!file) return existingImageUrl || null

  const { data, error } = await uploadProductImage(file)
  if (error || !data?.publicUrl) {
    throw new Error('image_upload_failed')
  }

  return data.publicUrl
}

function bindImagePreview() {
  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0]

    if (!file) {
      imagePreviewWrap.classList.add('d-none')
      imagePreview.removeAttribute('src')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    imagePreview.src = previewUrl
    imagePreviewWrap.classList.remove('d-none')
  })
}

async function handleSubmit(event) {
  event.preventDefault()

  const title = titleInput.value.trim()
  const description = descriptionInput.value.trim()
  const price = Number(priceInput.value)
  const categoryId = Number(categoryInput.value)
  const quantity = Number(quantityInput.value)

  if (
    !title ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isFinite(categoryId) ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    showToast('Please fill in all required fields with valid values.', 'error')
    return
  }

  setSubmitting(true)

  try {
    const imageUrl = await resolveImageUrl()

    const payload = {
      title,
      description,
      price,
      quantity,
      category_id: categoryId,
      image_url: imageUrl,
      status: 'active'
    }

    if (editProductId) {
      const { error } = await updateOwnProduct(editProductId, currentUser.id, payload)
      if (error) throw error
    } else {
      const { error } = await createProduct({
        ...payload,
        seller_id: currentUser.id
      })
      if (error) throw error
    }

    window.location.href = './profile.html'
  } catch (error) {
    showToast('Could not save listing. Please try again.', 'error')
  } finally {
    setSubmitting(false)
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await requireAuthUser()
  if (!currentUser) return

  await loadCategories()
  await loadEditModeData()

  bindImagePreview()
  form.addEventListener('submit', handleSubmit)
})

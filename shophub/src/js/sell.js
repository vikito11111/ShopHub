import { supabase } from './supabase.js'
import { createProduct, getCategories, getProductById, updateOwnProduct } from './products.js'
import { uploadProductImage } from './storage.js'

const params = new URLSearchParams(window.location.search)
const editProductId = params.get('id')

const pageTitle = document.getElementById('sell-page-title')
const pageSubtitle = document.getElementById('sell-page-subtitle')
const form = document.getElementById('sell-form')
const titleInput = document.getElementById('sell-title')
const descriptionInput = document.getElementById('sell-description')
const priceInput = document.getElementById('sell-price')
const categoryInput = document.getElementById('sell-category')
const imageInput = document.getElementById('sell-image')
const imagePreviewWrap = document.getElementById('sell-image-preview-wrap')
const imagePreview = document.getElementById('sell-image-preview')
const currentImageWrap = document.getElementById('current-image-wrap')
const currentImage = document.getElementById('current-image')
const alertBox = document.getElementById('sell-alert')
const submitButton = document.getElementById('sell-submit-btn')
const submitButtonText = document.getElementById('sell-submit-text')
const submitSpinner = document.getElementById('sell-submit-spinner')

let currentUser = null
let existingImageUrl = ''

function showAlert(type, message) {
  alertBox.className = `alert alert-${type}`
  alertBox.textContent = message
  alertBox.classList.remove('d-none')

  window.setTimeout(() => {
    alertBox.classList.add('d-none')
  }, 3000)
}

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
    showAlert('danger', 'Could not load categories. Please refresh the page.')
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
    showAlert('danger', 'Listing not found.')
    window.location.href = './profile.html'
    return
  }

  if (product.seller_id !== currentUser.id) {
    showAlert('danger', 'You can only edit your own listings.')
    window.location.href = './profile.html'
    return
  }

  titleInput.value = product.title || ''
  descriptionInput.value = product.description || ''
  priceInput.value = product.price ?? ''
  categoryInput.value = product.category_id ? String(product.category_id) : ''

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

  if (!title || !Number.isFinite(price) || price <= 0 || !Number.isFinite(categoryId)) {
    showAlert('danger', 'Please fill in all required fields with valid values.')
    return
  }

  setSubmitting(true)

  try {
    const imageUrl = await resolveImageUrl()

    const payload = {
      title,
      description,
      price,
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
    showAlert('danger', 'Could not save listing. Please try again.')
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

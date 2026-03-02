import { supabase } from './supabase.js'
import { createOrder, deleteOwnProduct, getProductById, getProfileById } from './products.js'
import { formatPrice } from './utils.js'

const params = new URLSearchParams(window.location.search)
const productId = params.get('id')

const loadingState = document.getElementById('product-loading')
const errorState = document.getElementById('product-error')
const detailsCard = document.getElementById('product-details-card')
const productImage = document.getElementById('product-image')
const productTitle = document.getElementById('product-title')
const productDescription = document.getElementById('product-description')
const productPrice = document.getElementById('product-price')
const productSeller = document.getElementById('product-seller')
const buyNowBtn = document.getElementById('buy-now-btn')
const sellerActions = document.getElementById('seller-actions')
const editBtn = document.getElementById('edit-product-btn')
const deleteBtn = document.getElementById('delete-product-btn')
const productAlert = document.getElementById('product-alert')

function showAlert(type, message) {
  productAlert.className = `alert alert-${type}`
  productAlert.textContent = message
  productAlert.classList.remove('d-none')

  window.setTimeout(() => {
    productAlert.classList.add('d-none')
  }, 3000)
}

function setVisibility(element, visible) {
  if (!element) return
  element.classList.toggle('d-none', !visible)
}

function showError(message) {
  setVisibility(loadingState, false)
  setVisibility(detailsCard, false)
  setVisibility(errorState, true)
  errorState.textContent = message
}

async function getCurrentUser() {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    return null
  }
}

function renderProduct(product, sellerUsername) {
  productImage.src = product.image_url || 'https://placehold.co/1200x900?text=ShopHub+Product'
  productImage.alt = product.title
  productTitle.textContent = product.title
  productDescription.textContent = product.description || 'No description provided.'
  productPrice.textContent = formatPrice(product.price)
  productSeller.textContent = sellerUsername || 'Unknown seller'
}

async function setupBuyerActions(currentUser, product) {
  const isSeller = currentUser?.id === product.seller_id

  if (editBtn) {
    editBtn.href = `./sell.html?id=${encodeURIComponent(product.id)}`
  }

  setVisibility(sellerActions, Boolean(currentUser && isSeller))
  setVisibility(buyNowBtn, Boolean(currentUser && !isSeller && product.status === 'active'))

  if (!buyNowBtn || !currentUser || isSeller || product.status !== 'active') return

  buyNowBtn.addEventListener('click', async () => {
    buyNowBtn.disabled = true

    const { error } = await createOrder({
      buyerId: currentUser.id,
      productId: product.id
    })

    if (error) {
      showAlert('danger', 'Could not complete purchase. Please try again.')
      buyNowBtn.disabled = false
      return
    }

    showAlert('success', 'Order created successfully!')
    buyNowBtn.textContent = 'Purchased'
  })
}

async function setupSellerActions(currentUser, product) {
  if (!deleteBtn || !currentUser || currentUser.id !== product.seller_id) return

  deleteBtn.addEventListener('click', async () => {
    const confirmed = window.confirm('Are you sure you want to delete this listing?')
    if (!confirmed) return

    const { error } = await deleteOwnProduct(product.id, currentUser.id)
    if (error) {
      showAlert('danger', 'Could not delete product. Please try again.')
      return
    }

    window.location.href = './profile.html'
  })
}

async function initializeProductPage() {
  if (!productId) {
    showError('Product ID is missing. Please open a valid product link.')
    return
  }

  const { data: product, error: productError } = await getProductById(productId)
  if (productError || !product) {
    showError('We could not find this product.')
    return
  }

  const [{ data: seller }, currentUser] = await Promise.all([
    getProfileById(product.seller_id),
    getCurrentUser()
  ])

  renderProduct(product, seller?.username)
  await setupBuyerActions(currentUser, product)
  await setupSellerActions(currentUser, product)

  setVisibility(loadingState, false)
  setVisibility(errorState, false)
  setVisibility(detailsCard, true)
}

document.addEventListener('DOMContentLoaded', async () => {
  await initializeProductPage()
})

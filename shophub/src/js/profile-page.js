import { supabase } from './supabase.js'
import { deleteOwnProduct, getProductsBySeller } from './products.js'
import { getProfileByUserId, updateOwnProfileAvatar } from './profiles.js'
import { uploadAvatarImage } from './storage.js'
import { formatPrice, truncate } from './utils.js'

const avatarImage = document.getElementById('profile-avatar')
const usernameLabel = document.getElementById('profile-username')
const avatarInput = document.getElementById('profile-avatar-input')
const avatarButton = document.getElementById('profile-avatar-btn')
const avatarSpinner = document.getElementById('profile-avatar-spinner')
const profileAlert = document.getElementById('profile-alert')

const productsLoading = document.getElementById('profile-products-loading')
const productsError = document.getElementById('profile-products-error')
const productsEmpty = document.getElementById('profile-products-empty')
const productsGrid = document.getElementById('profile-products-grid')

const salesLoading = document.getElementById('profile-sales-loading')
const salesError = document.getElementById('profile-sales-error')
const salesEmpty = document.getElementById('profile-sales-empty')
const salesTableWrap = document.getElementById('profile-sales-table-wrap')
const salesTableBody = document.getElementById('profile-sales-body')

const purchasesLoading = document.getElementById('profile-purchases-loading')
const purchasesError = document.getElementById('profile-purchases-error')
const purchasesEmpty = document.getElementById('profile-purchases-empty')
const purchasesTableWrap = document.getElementById('profile-purchases-table-wrap')
const purchasesTableBody = document.getElementById('profile-purchases-body')

const listingsStat = document.getElementById('profile-stat-listings')
const salesStat = document.getElementById('profile-stat-sales')
const memberSinceStat = document.getElementById('profile-stat-member-since')

let currentUser = null

function showAlert(type, message) {
  profileAlert.className = `alert alert-${type}`
  profileAlert.textContent = message
  profileAlert.classList.remove('d-none')
  window.setTimeout(() => profileAlert.classList.add('d-none'), 3000)
}

function setVisible(element, visible) {
  if (!element) return
  element.classList.toggle('d-none', !visible)
}

function formatDate(value) {
  if (!value) return '—'

  const dateValue = new Date(value)
  if (Number.isNaN(dateValue.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateValue)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function cardTemplate(product) {
  const image = product.image_url || 'https://placehold.co/800x600?text=ShopHub+Product'
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <article class="card h-100 border-0 shadow-sm home-product-card profile-product-card">
        <img src="${escapeHtml(image)}" class="card-img-top" alt="${escapeHtml(product.title)}" loading="lazy" />
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h3 class="h6 card-title mb-0">${escapeHtml(truncate(product.title, 52))}</h3>
            <span class="badge text-bg-secondary">${escapeHtml(product.status)}</span>
          </div>
          <p class="text-muted small mb-3">${escapeHtml(truncate(product.description || 'No description provided.', 100))}</p>
          <div class="mt-auto">
            <p class="fw-semibold mb-3"><i class="bi bi-tag-fill me-1 text-primary"></i>${formatPrice(product.price)}</p>
            <div class="d-flex gap-2">
              <a href="./sell.html?id=${encodeURIComponent(product.id)}" class="btn btn-sm btn-outline-primary">Edit</a>
              <button type="button" class="btn btn-sm btn-outline-danger js-delete-product" data-product-id="${escapeHtml(product.id)}">Delete</button>
            </div>
          </div>
        </div>
      </article>
    </div>
  `
}

async function requireUser() {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = './login.html'
    return null
  }

  return user
}

async function loadProfile() {
  const { data, error } = await getProfileByUserId(currentUser.id)
  if (error || !data) {
    showAlert('danger', 'Could not load profile details.')
    return
  }

  usernameLabel.textContent = data.username || 'User'
  avatarImage.src = data.avatar_url || 'https://placehold.co/240x240?text=Avatar'
  memberSinceStat.textContent = formatDate(data.created_at)
}

async function loadProducts() {
  setVisible(productsLoading, true)
  setVisible(productsError, false)
  setVisible(productsEmpty, false)

  const { data, error } = await getProductsBySeller(currentUser.id)

  setVisible(productsLoading, false)

  if (error) {
    setVisible(productsError, true)
    productsGrid.innerHTML = ''
    listingsStat.textContent = '0'
    return
  }

  if (!data.length) {
    setVisible(productsEmpty, true)
    productsGrid.innerHTML = ''
    listingsStat.textContent = '0'
    return
  }

  listingsStat.textContent = String(data.length)
  productsGrid.innerHTML = data.map(cardTemplate).join('')
}

function salesRowTemplate(order) {
  const buyerUsername = order.profiles?.username || 'Unknown buyer'
  const productTitle = order.products?.title || 'Unknown product'
  const productPrice = order.products?.price ?? 0

  return `
    <tr>
      <td class="text-start">${escapeHtml(buyerUsername)}</td>
      <td class="text-start">${escapeHtml(productTitle)}</td>
      <td class="text-start"><span class="badge text-bg-primary-subtle profile-price-badge"><i class="bi bi-cash me-1"></i>${escapeHtml(formatPrice(productPrice))}</span></td>
      <td class="text-start">${escapeHtml(formatDate(order.created_at))}</td>
    </tr>
  `
}

function purchaseRowTemplate(order) {
  const productTitle = order.products?.title || 'Unknown product'
  const productPrice = order.products?.price ?? 0
  const sellerUsername = order.products?.seller?.username || 'Unknown seller'

  return `
    <tr>
      <td class="text-start">${escapeHtml(productTitle)}</td>
      <td class="text-start">${escapeHtml(sellerUsername)}</td>
      <td class="text-start"><span class="badge text-bg-primary-subtle profile-price-badge"><i class="bi bi-cash me-1"></i>${escapeHtml(formatPrice(productPrice))}</span></td>
      <td class="text-start">${escapeHtml(formatDate(order.created_at))}</td>
    </tr>
  `
}

function isValidHistoryOrder(order) {
  const productTitle = order?.products?.title
  const productPrice = Number(order?.products?.price)

  if (!productTitle) return false
  if (!Number.isFinite(productPrice)) return false

  return productPrice > 0
}

async function loadSalesHistory() {
  setVisible(salesLoading, true)
  setVisible(salesError, false)
  setVisible(salesEmpty, false)
  setVisible(salesTableWrap, false)

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      created_at,
      profiles!orders_buyer_id_fkey(username),
      products!orders_product_id_fkey(title, price, seller_id)
    `
    )
    .eq('products.seller_id', currentUser.id)
    .order('created_at', { ascending: false })

  setVisible(salesLoading, false)

  if (error) {
    setVisible(salesError, true)
    salesTableBody.innerHTML = ''
    salesStat.textContent = '0'
    return
  }

  const validSales = (data ?? []).filter(isValidHistoryOrder)

  if (!validSales.length) {
    setVisible(salesEmpty, true)
    salesTableBody.innerHTML = ''
    salesStat.textContent = '0'
    return
  }

  salesStat.textContent = String(validSales.length)
  salesTableBody.innerHTML = validSales.map(salesRowTemplate).join('')
  setVisible(salesTableWrap, true)
}

async function loadPurchaseHistory() {
  setVisible(purchasesLoading, true)
  setVisible(purchasesError, false)
  setVisible(purchasesEmpty, false)
  setVisible(purchasesTableWrap, false)

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      created_at,
      products!orders_product_id_fkey(
        title,
        price,
        seller:profiles!products_seller_id_fkey(username)
      )
    `
    )
    .eq('buyer_id', currentUser.id)
    .order('created_at', { ascending: false })

  setVisible(purchasesLoading, false)

  if (error) {
    setVisible(purchasesError, true)
    purchasesTableBody.innerHTML = ''
    return
  }

  const validPurchases = (data ?? []).filter(isValidHistoryOrder)

  if (!validPurchases.length) {
    setVisible(purchasesEmpty, true)
    purchasesTableBody.innerHTML = ''
    return
  }

  purchasesTableBody.innerHTML = validPurchases.map(purchaseRowTemplate).join('')
  setVisible(purchasesTableWrap, true)
}

function bindDeleteEvents() {
  productsGrid.querySelectorAll('.js-delete-product').forEach((button) => {
    button.addEventListener('click', async () => {
      const productId = button.getAttribute('data-product-id')
      if (!productId) return

      const confirmed = window.confirm('Delete this listing?')
      if (!confirmed) return

      const { error } = await deleteOwnProduct(productId, currentUser.id)
      if (error) {
        showAlert('danger', 'Could not delete listing. Please try again.')
        return
      }

      showAlert('success', 'Listing deleted.')
      await loadProducts()
      bindDeleteEvents()
    })
  })
}

function bindAvatarUpload() {
  avatarButton.addEventListener('click', async () => {
    const file = avatarInput.files?.[0]
    if (!file) {
      showAlert('warning', 'Please choose an image first.')
      return
    }

    avatarButton.disabled = true
    avatarSpinner.classList.remove('d-none')

    const { data: uploadData, error: uploadError } = await uploadAvatarImage(file)
    if (uploadError || !uploadData?.publicUrl) {
      avatarButton.disabled = false
      avatarSpinner.classList.add('d-none')
      showAlert('danger', 'Could not upload avatar. Please try again.')
      return
    }

    const { data: profileData, error: profileError } = await updateOwnProfileAvatar(
      currentUser.id,
      uploadData.publicUrl
    )

    avatarButton.disabled = false
    avatarSpinner.classList.add('d-none')

    if (profileError || !profileData) {
      showAlert('danger', 'Could not save avatar. Please try again.')
      return
    }

    avatarImage.src = profileData.avatar_url || uploadData.publicUrl
    showAlert('success', 'Avatar updated successfully.')
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await requireUser()
  if (!currentUser) return

  await loadProfile()
  await Promise.all([loadProducts(), loadSalesHistory(), loadPurchaseHistory()])
  bindDeleteEvents()
  bindAvatarUpload()
})

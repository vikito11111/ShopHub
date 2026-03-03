import { getActiveProductsBySeller, getProfileById } from './products.js'
import { formatPrice, initBackToTopButton, truncate } from './utils.js'

const params = new URLSearchParams(window.location.search)
const sellerId = params.get('id')

const loadingState = document.getElementById('seller-loading')
const errorState = document.getElementById('seller-error')
const contentState = document.getElementById('seller-content')

const sellerAvatar = document.getElementById('seller-avatar')
const sellerUsername = document.getElementById('seller-username')
const sellerMemberSince = document.getElementById('seller-member-since')
const sellerListingsCountBadge = document.getElementById('seller-listings-count-badge')

const listingsGrid = document.getElementById('seller-listings-grid')
const listingsEmpty = document.getElementById('seller-listings-empty')

function setVisibility(element, visible) {
  if (!element) return
  element.classList.toggle('d-none', !visible)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatMemberSince(value) {
  if (!value) return 'Member since —'

  const dateValue = new Date(value)
  if (Number.isNaN(dateValue.getTime())) return 'Member since —'

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short'
  }).format(dateValue)

  return `Member since ${formattedDate}`
}

function sellerProductCardTemplate(product) {
  const imageUrl = product.image_url || 'https://placehold.co/800x600?text=ShopHub+Product'
  const categoryName = product.categories?.name || 'Uncategorized'
  const quantity = Number(product.quantity ?? 0)
  const isLowStock = quantity > 0 && quantity <= 5

  return `
    <div class="col-12 col-md-6 col-lg-3">
      <article class="card h-100 border-0 shadow-sm home-product-card">
        <div class="product-image-wrap">
          <img
            src="${escapeHtml(imageUrl)}"
            class="card-img-top"
            alt="${escapeHtml(product.title)}"
            loading="lazy"
          />
        </div>
        <div class="card-body d-flex flex-column">
          <p class="mb-2"><span class="badge rounded-pill text-bg-light border home-category-badge">${escapeHtml(categoryName)}</span></p>
          ${isLowStock ? `<p class="mb-2"><span class="badge text-bg-warning low-stock-badge">Only ${quantity} left</span></p>` : ''}
          <h2 class="h6 card-title mb-2">${escapeHtml(product.title)}</h2>
          <p class="text-muted small mb-3">${escapeHtml(truncate(product.description || 'No description provided.', 90))}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <span class="home-price-chip"><i class="bi bi-tag-fill me-1"></i>${formatPrice(product.price)}</span>
            <a href="./product.html?id=${encodeURIComponent(product.id)}" class="btn btn-sm btn-outline-primary">View</a>
          </div>
        </div>
      </article>
    </div>
  `
}

function showError(message) {
  if (errorState) {
    errorState.textContent = message
  }

  setVisibility(loadingState, false)
  setVisibility(contentState, false)
  setVisibility(errorState, true)
}

function renderSellerHeader(profile, listingsCount) {
  const username = profile?.username || 'Seller'
  const avatarUrl = profile?.avatar_url || 'https://placehold.co/160x160?text=Seller'

  sellerAvatar.src = avatarUrl
  sellerAvatar.alt = `${username} avatar`
  sellerUsername.textContent = username
  sellerMemberSince.textContent = formatMemberSince(profile?.created_at)
  sellerListingsCountBadge.textContent = `${listingsCount} active listing${listingsCount === 1 ? '' : 's'}`
}

function renderListings(listings) {
  listingsGrid.innerHTML = ''
  setVisibility(listingsEmpty, false)

  if (!listings.length) {
    setVisibility(listingsEmpty, true)
    return
  }

  listingsGrid.innerHTML = listings.map(sellerProductCardTemplate).join('')
}

async function initializeSellerPage() {
  if (!sellerId) {
    showError('Seller ID is missing. Please open a valid seller link.')
    return
  }

  setVisibility(errorState, false)
  setVisibility(contentState, false)
  setVisibility(loadingState, true)

  const [{ data: profile, error: profileError }, { data: listings, error: listingsError }] =
    await Promise.all([getProfileById(sellerId), getActiveProductsBySeller(sellerId)])

  if (profileError || !profile) {
    showError('We could not load this seller profile right now.')
    return
  }

  if (listingsError) {
    showError('We could not load this seller listings right now.')
    return
  }

  renderSellerHeader(profile, listings.length)
  renderListings(listings)

  setVisibility(loadingState, false)
  setVisibility(errorState, false)
  setVisibility(contentState, true)
}

document.addEventListener('DOMContentLoaded', async () => {
  initBackToTopButton()
  await initializeSellerPage()
})

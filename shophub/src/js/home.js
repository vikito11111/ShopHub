import { getLatestProducts } from './products.js'
import { supabase } from './supabase.js'
import { getUserWishlist, toggleWishlist } from './wishlist.js'
import { formatPrice, initBackToTopButton, isNewProduct, showToast, truncate } from './utils.js'

const productGrid = document.getElementById('latest-products-grid')
const loadingState = document.getElementById('latest-products-loading')
const emptyState = document.getElementById('latest-products-empty')
const errorState = document.getElementById('latest-products-error')
const searchForm = document.getElementById('home-search-form')
const searchInput = document.getElementById('home-search-input')
let currentUser = null
let wishlistedProductIds = new Set()

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function productCardTemplate(product) {
  const imageUrl = product.image_url || 'https://placehold.co/800x600?text=ShopHub+Product'
  const categoryName = product.categories?.name || 'Uncategorized'
  const quantity = Number(product.quantity ?? 0)
  const isSoldOut = product.status === 'sold' || quantity <= 0
  const isLowStock = quantity > 0 && quantity <= 5
  const isWishlisted = wishlistedProductIds.has(product.id)
  const isNew = isNewProduct(product.created_at)

  return `
    <div class="col-12 col-md-6 col-lg-3">
      <article class="card h-100 border-0 shadow-sm home-product-card ${isSoldOut ? 'sold-card' : ''}">
        <div class="product-image-wrap">
        <button
          type="button"
          class="btn btn-light btn-sm rounded-circle wishlist-toggle-btn ${isWishlisted ? 'is-active' : ''}"
          data-product-id="${escapeHtml(product.id)}"
          aria-label="${isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}"
        >
          <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>
        <div class="product-badge-stack">
          ${isNew ? '<span class="badge text-bg-success">New</span>' : ''}
          ${isLowStock ? `<span class="badge text-bg-warning low-stock-badge">Only ${quantity} left</span>` : ''}
          ${isSoldOut ? '<span class="sold-banner">Sold Out</span>' : ''}
        </div>
        <img
          src="${escapeHtml(imageUrl)}"
          class="card-img-top"
          alt="${escapeHtml(product.title)}"
          loading="lazy"
        />
        </div>
        <div class="card-body d-flex flex-column">
          <p class="mb-2"><span class="badge rounded-pill text-bg-light border home-category-badge">${escapeHtml(categoryName)}</span></p>
          <h3 class="h6 card-title mb-2">${escapeHtml(product.title)}</h3>
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

function setVisibility(element, visible) {
  if (!element) return
  element.classList.toggle('d-none', !visible)
}

function renderWishlistButtonState(button, wishlisted) {
  const icon = button.querySelector('i')
  if (!icon) return

  button.classList.toggle('is-active', wishlisted)
  button.setAttribute('aria-label', wishlisted ? 'Remove from wishlist' : 'Save to wishlist')
  icon.className = `bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`
}

function bindWishlistEvents() {
  productGrid.querySelectorAll('.wishlist-toggle-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const productId = button.getAttribute('data-product-id')
      if (!productId) return

      if (!currentUser) {
        window.location.href = './login.html'
        return
      }

      button.disabled = true

      const { data, error, requiresAuth } = await toggleWishlist(productId)

      if (requiresAuth) {
        window.location.href = './login.html'
        return
      }

      if (error || !data) {
        button.disabled = false
        showToast('Could not update wishlist right now.', 'error')
        return
      }

      if (data.wishlisted) {
        wishlistedProductIds.add(productId)
      } else {
        wishlistedProductIds.delete(productId)
      }

      renderWishlistButtonState(button, data.wishlisted)
      button.disabled = false
    })
  })
}

async function loadWishlistState() {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  currentUser = user ?? null

  if (!currentUser) {
    wishlistedProductIds = new Set()
    return
  }

  const { data } = await getUserWishlist()
  wishlistedProductIds = new Set((data ?? []).map((item) => item.product_id))
}

async function loadLatestProducts() {
  await loadWishlistState()

  setVisibility(loadingState, true)
  setVisibility(emptyState, false)
  setVisibility(errorState, false)

  const { data, error } = await getLatestProducts(8)

  setVisibility(loadingState, false)

  if (error) {
    setVisibility(errorState, true)
    return
  }

  if (!data.length) {
    setVisibility(emptyState, true)
    return
  }

  productGrid.innerHTML = data.map(productCardTemplate).join('')
  bindWishlistEvents()
}

function initSearch() {
  if (!searchForm || !searchInput) return

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const query = searchInput.value.trim()
    const destination = query ? `./browse.html?search=${encodeURIComponent(query)}` : './browse.html'
    window.location.href = destination
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  initBackToTopButton()
  initSearch()
  await loadLatestProducts()
})

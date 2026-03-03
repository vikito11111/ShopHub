import { getLatestProducts } from './products.js'
import { formatPrice, initBackToTopButton, truncate } from './utils.js'

const productGrid = document.getElementById('latest-products-grid')
const loadingState = document.getElementById('latest-products-loading')
const emptyState = document.getElementById('latest-products-empty')
const errorState = document.getElementById('latest-products-error')
const searchForm = document.getElementById('home-search-form')
const searchInput = document.getElementById('home-search-input')

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

  return `
    <div class="col-12 col-md-6 col-lg-3">
      <article class="card h-100 border-0 shadow-sm home-product-card ${isSoldOut ? 'sold-card' : ''}">
        <div class="product-image-wrap">
        <img
          src="${escapeHtml(imageUrl)}"
          class="card-img-top"
          alt="${escapeHtml(product.title)}"
          loading="lazy"
        />
          ${isSoldOut ? '<span class="sold-banner">Sold Out</span>' : ''}
        </div>
        <div class="card-body d-flex flex-column">
          <p class="mb-2"><span class="badge rounded-pill text-bg-light border home-category-badge">${escapeHtml(categoryName)}</span></p>
          ${isLowStock ? `<p class="mb-2"><span class="badge text-bg-warning low-stock-badge">Only ${quantity} left</span></p>` : ''}
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

async function loadLatestProducts() {
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

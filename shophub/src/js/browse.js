import { getActiveProducts, getCategories } from './products.js'
import { formatPrice, truncate } from './utils.js'

const searchParams = new URLSearchParams(window.location.search)

const searchForm = document.getElementById('browse-search-form')
const searchInput = document.getElementById('browse-search-input')
const categorySelect = document.getElementById('browse-category-select')
const productGrid = document.getElementById('browse-products-grid')
const loadingState = document.getElementById('browse-products-loading')
const emptyState = document.getElementById('browse-products-empty')
const errorState = document.getElementById('browse-products-error')

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function setVisibility(element, visible) {
  if (!element) return
  element.classList.toggle('d-none', !visible)
}

function productCardTemplate(product) {
  const imageUrl = product.image_url || 'https://placehold.co/800x600?text=ShopHub+Product'

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <article class="card h-100 border-0 shadow-sm browse-product-card">
        <img src="${escapeHtml(imageUrl)}" class="card-img-top" alt="${escapeHtml(product.title)}" loading="lazy" />
        <div class="card-body d-flex flex-column">
          <h3 class="h6 card-title mb-2">${escapeHtml(product.title)}</h3>
          <p class="text-muted small mb-3">${escapeHtml(truncate(product.description || 'No description provided.', 110))}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <span class="fw-semibold">${formatPrice(product.price)}</span>
            <a href="./product.html?id=${encodeURIComponent(product.id)}" class="btn btn-sm btn-outline-primary">View</a>
          </div>
        </div>
      </article>
    </div>
  `
}

function updateUrl(search, category) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)

  const queryString = params.toString()
  const targetUrl = queryString ? `./browse.html?${queryString}` : './browse.html'
  window.history.replaceState({}, '', targetUrl)
}

async function loadCategories() {
  const { data, error } = await getCategories()
  if (error) return

  const options = ['<option value="">All categories</option>']
  options.push(
    ...data.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
  )

  categorySelect.innerHTML = options.join('')

  const selectedCategory = searchParams.get('category')
  if (selectedCategory) {
    categorySelect.value = selectedCategory
  }
}

async function loadProducts() {
  const searchValue = searchInput.value.trim()
  const categoryValue = categorySelect.value

  setVisibility(loadingState, true)
  setVisibility(emptyState, false)
  setVisibility(errorState, false)

  const { data, error } = await getActiveProducts({
    search: searchValue,
    categoryId: categoryValue
  })

  setVisibility(loadingState, false)

  if (error) {
    setVisibility(errorState, true)
    productGrid.innerHTML = ''
    return
  }

  if (!data.length) {
    setVisibility(emptyState, true)
    productGrid.innerHTML = ''
    return
  }

  productGrid.innerHTML = data.map(productCardTemplate).join('')
}

function initializeFilters() {
  const searchFromUrl = searchParams.get('search') || ''
  searchInput.value = searchFromUrl

  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    updateUrl(searchInput.value.trim(), categorySelect.value)
    await loadProducts()
  })

  categorySelect.addEventListener('change', async () => {
    updateUrl(searchInput.value.trim(), categorySelect.value)
    await loadProducts()
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  initializeFilters()
  await loadCategories()
  await loadProducts()
})

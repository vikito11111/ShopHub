import { getActiveProducts, getCategories } from './products.js'
import { formatPrice, truncate } from './utils.js'

const searchParams = new URLSearchParams(window.location.search)

const searchForm = document.getElementById('browse-search-form')
const searchInput = document.getElementById('browse-search-input')
const categorySearchInput = document.getElementById('browse-category-search')
const categorySelect = document.getElementById('browse-category-select')
const categoryPills = document.getElementById('browse-category-pills')
const productGrid = document.getElementById('browse-products-grid')
const loadingState = document.getElementById('browse-products-loading')
const emptyState = document.getElementById('browse-products-empty')
const errorState = document.getElementById('browse-products-error')
const resultsCount = document.getElementById('browse-results-count')

let allCategories = []

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

function updateResultsCount(count) {
  if (!resultsCount) return
  const label = count === 1 ? 'result' : 'results'
  resultsCount.textContent = `${count} ${label}`
}

function setActiveCategoryPill(categoryId) {
  if (!categoryPills) return

  categoryPills.querySelectorAll('[data-category]').forEach((button) => {
    const isActive = button.getAttribute('data-category') === categoryId
    button.classList.toggle('active', isActive)
    button.classList.toggle('btn-primary', isActive)
    button.classList.toggle('btn-outline-secondary', !isActive)
  })
}

function renderCategoryPills(filterValue = '') {
  if (!categoryPills) return

  const normalizedFilter = filterValue.trim().toLowerCase()

  const filteredCategories = allCategories.filter((category) =>
    category.name.toLowerCase().includes(normalizedFilter)
  )

  const pills = [
    '<button type="button" class="btn btn-sm rounded-pill btn-outline-secondary" data-category="">All categories</button>',
    ...filteredCategories.map(
      (category) =>
        `<button type="button" class="btn btn-sm rounded-pill btn-outline-secondary" data-category="${category.id}">${escapeHtml(category.name)}</button>`
    )
  ]

  categoryPills.innerHTML = pills.join('')
  setActiveCategoryPill(categorySelect.value)
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

  allCategories = data ?? []

  const options = ['<option value="">All categories</option>']
  options.push(
    ...allCategories.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
  )

  categorySelect.innerHTML = options.join('')

  const selectedCategory = searchParams.get('category')
  if (selectedCategory) {
    categorySelect.value = selectedCategory
  }

  renderCategoryPills()
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
    updateResultsCount(0)
    return
  }

  if (!data.length) {
    setVisibility(emptyState, true)
    productGrid.innerHTML = ''
    updateResultsCount(0)
    return
  }

  updateResultsCount(data.length)
  productGrid.innerHTML = data.map(productCardTemplate).join('')
}

function initializeFilters() {
  const searchFromUrl = searchParams.get('search') || ''
  searchInput.value = searchFromUrl

  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    updateUrl(searchInput.value.trim(), categorySelect.value)
    setActiveCategoryPill(categorySelect.value)
    await loadProducts()
  })

  categoryPills?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-category]')
    if (!button) return

    const value = button.getAttribute('data-category') || ''
    categorySelect.value = value
    setActiveCategoryPill(value)
    updateUrl(searchInput.value.trim(), value)
    await loadProducts()
  })

  categorySearchInput?.addEventListener('input', () => {
    renderCategoryPills(categorySearchInput.value)
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  initializeFilters()
  await loadCategories()
  await loadProducts()
})

import {
  getActiveProducts,
  getAverageRatingsByProductIds,
  getCategories,
  getPurchaseCountsByProductIds
} from './products.js'
import { formatPrice, initBackToTopButton, truncate } from './utils.js'

const searchParams = new URLSearchParams(window.location.search)

const searchForm = document.getElementById('browse-search-form')
const searchInput = document.getElementById('browse-search-input')
const categorySearchInput = document.getElementById('browse-category-search')
const categorySelect = document.getElementById('browse-category-select')
const sortSelect = document.getElementById('browse-sort-select')
const categoryPills = document.getElementById('browse-category-pills')
const productGrid = document.getElementById('browse-products-grid')
const loadingState = document.getElementById('browse-products-loading')
const emptyState = document.getElementById('browse-products-empty')
const errorState = document.getElementById('browse-products-error')
const resultsCount = document.getElementById('browse-results-count')

let allCategories = []
let currentProducts = []
let productAverageRatings = {}
let productPurchaseCounts = {}

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
  const quantity = Number(product.quantity ?? 0)
  const isSoldOut = product.status === 'sold' || quantity <= 0
  const isLowStock = quantity > 0 && quantity <= 5

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <article class="card h-100 border-0 shadow-sm browse-product-card ${isSoldOut ? 'sold-card' : ''}">
        <div class="product-image-wrap">
          <img src="${escapeHtml(imageUrl)}" class="card-img-top" alt="${escapeHtml(product.title)}" loading="lazy" />
          ${isSoldOut ? '<span class="sold-banner">Sold Out</span>' : ''}
        </div>
        <div class="card-body d-flex flex-column">
          ${isLowStock ? `<p class="mb-2"><span class="badge text-bg-warning low-stock-badge">Only ${quantity} left</span></p>` : ''}
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

function sortProducts(products, sortValue) {
  const list = [...products]
  const recentComparator =
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

  switch (sortValue) {
    case 'price_asc':
      return list.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0))
    case 'price_desc':
      return list.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0))
    case 'highest_rated':
      return list.sort((a, b) => {
        const ratingA = Number(productAverageRatings[a.id])
        const ratingB = Number(productAverageRatings[b.id])
        const hasRatingA = Number.isFinite(ratingA)
        const hasRatingB = Number.isFinite(ratingB)

        if (hasRatingA && !hasRatingB) return -1
        if (!hasRatingA && hasRatingB) return 1
        if (!hasRatingA && !hasRatingB) return recentComparator(a, b)

        if (ratingB !== ratingA) return ratingB - ratingA
        return recentComparator(a, b)
      })
    case 'most_purchased':
      return list.sort((a, b) => {
        const purchasesA = Number(productPurchaseCounts[a.id] ?? 0)
        const purchasesB = Number(productPurchaseCounts[b.id] ?? 0)

        if (purchasesB !== purchasesA) return purchasesB - purchasesA
        return recentComparator(a, b)
      })
    case 'most_recent':
    default:
      return list.sort(recentComparator)
  }
}

function renderProducts(products) {
  const sortedProducts = sortProducts(products, sortSelect?.value || 'most_recent')

  if (!sortedProducts.length) {
    setVisibility(emptyState, true)
    productGrid.innerHTML = ''
    updateResultsCount(0)
    return
  }

  setVisibility(emptyState, false)
  updateResultsCount(sortedProducts.length)
  productGrid.innerHTML = sortedProducts.map(productCardTemplate).join('')
}

function updateUrl(search, category, sort) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (sort && sort !== 'most_recent') params.set('sort', sort)

  const queryString = params.toString()
  const targetUrl = queryString ? `./browse.html?${queryString}` : './browse.html'
  window.history.replaceState({}, '', targetUrl)
}

function resetSortMetrics() {
  productAverageRatings = {}
  productPurchaseCounts = {}
}

async function loadSortMetrics(products) {
  const productIds = products.map((product) => product.id).filter(Boolean)

  if (!productIds.length) {
    resetSortMetrics()
    return
  }

  const [{ data: ratingMap }, { data: purchaseMap }] = await Promise.all([
    getAverageRatingsByProductIds(productIds),
    getPurchaseCountsByProductIds(productIds)
  ])

  productAverageRatings = ratingMap ?? {}
  productPurchaseCounts = purchaseMap ?? {}
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
    currentProducts = []
    resetSortMetrics()
    productGrid.innerHTML = ''
    updateResultsCount(0)
    return
  }

  currentProducts = data ?? []
  await loadSortMetrics(currentProducts)
  renderProducts(currentProducts)
}

function initializeFilters() {
  const searchFromUrl = searchParams.get('search') || ''
  const sortFromUrl = searchParams.get('sort') || 'most_recent'

  searchInput.value = searchFromUrl

  if (sortSelect) {
    sortSelect.value = ['most_recent', 'price_asc', 'price_desc', 'highest_rated', 'most_purchased'].includes(
      sortFromUrl
    )
      ? sortFromUrl
      : 'most_recent'
  }

  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    updateUrl(searchInput.value.trim(), categorySelect.value, sortSelect?.value || 'most_recent')
    setActiveCategoryPill(categorySelect.value)
    await loadProducts()
  })

  categoryPills?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-category]')
    if (!button) return

    const value = button.getAttribute('data-category') || ''
    categorySelect.value = value
    setActiveCategoryPill(value)
    updateUrl(searchInput.value.trim(), value, sortSelect?.value || 'most_recent')
    await loadProducts()
  })

  sortSelect?.addEventListener('change', () => {
    updateUrl(searchInput.value.trim(), categorySelect.value, sortSelect.value)
    renderProducts(currentProducts)
  })

  categorySearchInput?.addEventListener('input', () => {
    renderCategoryPills(categorySearchInput.value)
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  initBackToTopButton()
  initializeFilters()
  await loadCategories()
  await loadProducts()
})

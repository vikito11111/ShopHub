import {
  getActiveProducts,
  getAverageRatingsByProductIds,
  getCategories,
  getPurchaseCountsByProductIds
} from './products.js'
import { supabase } from './supabase.js'
import { getUserWishlist, toggleWishlist } from './wishlist.js'
import { formatPrice, initBackToTopButton, isNewProduct, showToast, truncate } from './utils.js'

const searchParams = new URLSearchParams(window.location.search)
const PAGE_SIZE = 24
const MAX_VISIBLE_PAGES = 5

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
const resultsRange = document.getElementById('browse-results-range')
const paginationWrap = document.getElementById('browse-pagination-wrap')
const paginationList = document.getElementById('browse-pagination')

let allCategories = []
let currentProducts = []
let productAverageRatings = {}
let productPurchaseCounts = {}
let currentUser = null
let wishlistedProductIds = new Set()
let currentPage = 1
let totalResults = 0

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
  const isWishlisted = wishlistedProductIds.has(product.id)
  const isNew = isNewProduct(product.created_at)

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <article class="card h-100 border-0 shadow-sm browse-product-card ${isSoldOut ? 'sold-card' : ''}">
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
          <img src="${escapeHtml(imageUrl)}" class="card-img-top browse-product-image" alt="${escapeHtml(product.title)}" loading="lazy" />
        </div>
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

function buildImageFallback() {
  return `
    <div class="browse-image-fallback" role="img" aria-label="Image unavailable">
      <i class="bi bi-image" aria-hidden="true"></i>
    </div>
  `
}

function bindCardImageFallbacks() {
  productGrid.querySelectorAll('.browse-product-image').forEach((image) => {
    image.addEventListener(
      'error',
      () => {
        const wrapper = image.closest('.product-image-wrap')
        if (!wrapper) return

        image.remove()
        wrapper.insertAdjacentHTML('afterbegin', buildImageFallback())
      },
      { once: true }
    )
  })
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

function updateResultsCount(count) {
  if (!resultsCount) return
  const label = count === 1 ? 'result' : 'results'
  resultsCount.textContent = `${count} ${label}`
}

function getTotalPages() {
  if (totalResults <= 0) return 1
  return Math.ceil(totalResults / PAGE_SIZE)
}

function updateResultsRange(itemsOnPage) {
  if (!resultsRange) return

  if (totalResults <= 0) {
    resultsRange.textContent = 'Showing 0 results'
    setVisibility(resultsRange, true)
    return
  }

  const start = (currentPage - 1) * PAGE_SIZE + 1
  const end = start + Math.max(itemsOnPage - 1, 0)

  resultsRange.textContent = `Showing ${start}-${end} of ${totalResults} results`
  setVisibility(resultsRange, true)
}

function paginationItemTemplate({ label, page, disabled = false, active = false, ariaLabel = '' }) {
  const disabledClass = disabled ? ' disabled' : ''
  const activeClass = active ? ' active' : ''
  const ariaCurrent = active ? ' aria-current="page"' : ''
  const dataPage = !disabled && !active ? ` data-page="${page}"` : ''
  const labelAria = ariaLabel ? ` aria-label="${ariaLabel}"` : ''

  return `
    <li class="page-item${disabledClass}${activeClass}">
      <button type="button" class="page-link"${dataPage}${ariaCurrent}${labelAria}>${label}</button>
    </li>
  `
}

function renderPagination() {
  if (!paginationWrap || !paginationList) return

  if (totalResults <= PAGE_SIZE) {
    paginationList.innerHTML = ''
    setVisibility(paginationWrap, false)
    return
  }

  const totalPages = getTotalPages()
  const halfWindow = Math.floor(MAX_VISIBLE_PAGES / 2)

  let startPage = Math.max(1, currentPage - halfWindow)
  let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1)

  if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
    startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1)
  }

  const items = []

  items.push(
    paginationItemTemplate({
      label: 'Previous',
      page: currentPage - 1,
      disabled: currentPage <= 1,
      ariaLabel: 'Previous page'
    })
  )

  for (let page = startPage; page <= endPage; page += 1) {
    items.push(
      paginationItemTemplate({
        label: String(page),
        page,
        active: page === currentPage
      })
    )
  }

  items.push(
    paginationItemTemplate({
      label: 'Next',
      page: currentPage + 1,
      disabled: currentPage >= totalPages,
      ariaLabel: 'Next page'
    })
  )

  paginationList.innerHTML = items.join('')
  setVisibility(paginationWrap, true)
}

function scrollToProductsStart() {
  const target = resultsRange || productGrid
  if (!target) return

  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    return
  }

  setVisibility(emptyState, false)
  productGrid.innerHTML = sortedProducts.map(productCardTemplate).join('')
  bindCardImageFallbacks()
  bindWishlistEvents()
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

function updateUrl(search, category, sort, page = 1) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (sort && sort !== 'most_recent') params.set('sort', sort)
  if (page > 1) params.set('page', String(page))

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
  const sortValue = sortSelect?.value || 'most_recent'

  setVisibility(loadingState, true)
  setVisibility(emptyState, false)
  setVisibility(errorState, false)

  const { data, total, error } = await getActiveProducts({
    search: searchValue,
    categoryId: categoryValue,
    sort: sortValue,
    page: currentPage,
    pageSize: PAGE_SIZE
  })

  setVisibility(loadingState, false)

  if (error) {
    setVisibility(errorState, true)
    currentProducts = []
    totalResults = 0
    resetSortMetrics()
    productGrid.innerHTML = ''
    updateResultsCount(0)
    setVisibility(resultsRange, false)
    setVisibility(paginationWrap, false)
    return
  }

  totalResults = Number(total ?? 0)
  updateResultsCount(totalResults)

  const totalPages = getTotalPages()
  if (totalResults > 0 && currentPage > totalPages) {
    currentPage = totalPages
    updateUrl(searchValue, categoryValue, sortValue, currentPage)
    await loadProducts()
    return
  }

  currentProducts = data ?? []
  await loadSortMetrics(currentProducts)
  renderProducts(currentProducts)
  updateResultsRange(currentProducts.length)
  renderPagination()
}

function initializeFilters() {
  const searchFromUrl = searchParams.get('search') || ''
  const sortFromUrl = searchParams.get('sort') || 'most_recent'
  const pageFromUrl = Number(searchParams.get('page') || 1)

  currentPage = Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1

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
    currentPage = 1
    updateUrl(searchInput.value.trim(), categorySelect.value, sortSelect?.value || 'most_recent', currentPage)
    setActiveCategoryPill(categorySelect.value)
    await loadProducts()
  })

  categoryPills?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-category]')
    if (!button) return

    const value = button.getAttribute('data-category') || ''
    categorySelect.value = value
    setActiveCategoryPill(value)
    currentPage = 1
    updateUrl(searchInput.value.trim(), value, sortSelect?.value || 'most_recent', currentPage)
    await loadProducts()
  })

  sortSelect?.addEventListener('change', async () => {
    currentPage = 1
    updateUrl(searchInput.value.trim(), categorySelect.value, sortSelect.value, currentPage)
    await loadProducts()
  })

  categorySearchInput?.addEventListener('input', () => {
    renderCategoryPills(categorySearchInput.value)
  })

  paginationList?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-page]')
    if (!button) return

    const nextPage = Number(button.getAttribute('data-page'))
    const totalPages = getTotalPages()

    if (!Number.isFinite(nextPage)) return
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return

    currentPage = nextPage
    updateUrl(searchInput.value.trim(), categorySelect.value, sortSelect?.value || 'most_recent', currentPage)
    await loadProducts()
    scrollToProductsStart()
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  initBackToTopButton()
  await loadWishlistState()
  initializeFilters()
  await loadCategories()
  await loadProducts()
})

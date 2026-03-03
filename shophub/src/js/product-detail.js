import { supabase } from './supabase.js'
import {
  createOrder,
  createProductReview,
  deleteOwnProduct,
  getProductById,
  getRelatedProducts,
  getProductReviews,
  getProfileById,
  hasUserPurchasedProduct,
  hasUserReviewedProduct
} from './products.js'
import { formatPrice, showToast, truncate } from './utils.js'

const params = new URLSearchParams(window.location.search)
const productId = params.get('id')

const loadingState = document.getElementById('product-loading')
const errorState = document.getElementById('product-error')
const detailsCard = document.getElementById('product-details-card')
const productImage = document.getElementById('product-image')
const productImageModal = document.getElementById('productImageModal')
const productImageModalSrc = document.getElementById('product-image-modal-src')
const productTitle = document.getElementById('product-title')
const productAverageRating = document.getElementById('product-average-rating')
const productDescription = document.getElementById('product-description')
const productPrice = document.getElementById('product-price')
const productQuantity = document.getElementById('product-quantity')
const productSeller = document.getElementById('product-seller')
const buyNowBtn = document.getElementById('buy-now-btn')
const soldMessage = document.getElementById('sold-message')
const sellerActions = document.getElementById('seller-actions')
const editBtn = document.getElementById('edit-product-btn')
const deleteBtn = document.getElementById('delete-product-btn')

const reviewsSection = document.getElementById('product-reviews-section')
const reviewFormWrap = document.getElementById('review-form-wrap')
const reviewForm = document.getElementById('review-form')
const reviewRatingStars = Array.from(document.querySelectorAll('.review-star'))
const reviewRatingInput = document.getElementById('review-rating-input')
const reviewComment = document.getElementById('review-comment')
const reviewSubmitBtn = document.getElementById('review-submit-btn')
const reviewSubmitSpinner = document.getElementById('review-submit-spinner')
const reviewEligibilityMessage = document.getElementById('review-eligibility-message')
const reviewsLoading = document.getElementById('reviews-loading')
const reviewsEmpty = document.getElementById('reviews-empty')
const reviewsList = document.getElementById('reviews-list')
const relatedProductsSection = document.getElementById('related-products-section')
const relatedProductsGrid = document.getElementById('related-products-grid')

let pageProduct = null
let currentUser = null
let imageLightbox = null

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

function relatedProductCardTemplate(product) {
  const imageUrl = product.image_url || 'https://placehold.co/800x600?text=ShopHub+Product'

  return `
    <div class="col-12 col-md-6 col-lg-3">
      <article class="card h-100 border-0 shadow-sm home-product-card">
        <img src="${escapeHtml(imageUrl)}" class="card-img-top" alt="${escapeHtml(product.title)}" loading="lazy" />
        <div class="card-body d-flex flex-column">
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

async function loadRelatedProducts() {
  if (!pageProduct || !relatedProductsSection || !relatedProductsGrid) return

  if (!pageProduct.category_id) {
    setVisibility(relatedProductsSection, false)
    return
  }

  const { data, error } = await getRelatedProducts({
    productId: pageProduct.id,
    categoryId: pageProduct.category_id,
    limit: 4
  })

  if (error || !data.length) {
    relatedProductsGrid.innerHTML = ''
    setVisibility(relatedProductsSection, false)
    return
  }

  relatedProductsGrid.innerHTML = data.map(relatedProductCardTemplate).join('')
  setVisibility(relatedProductsSection, true)
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

function renderStars(rating) {
  const safeRating = Number(rating) || 0
  let icons = ''

  for (let index = 1; index <= 5; index += 1) {
    icons += `<i class="bi ${index <= safeRating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}"></i>`
  }

  return icons
}

function setReviewSubmitting(submitting) {
  if (!reviewSubmitBtn || !reviewSubmitSpinner) return

  reviewSubmitBtn.disabled = submitting
  reviewSubmitSpinner.classList.toggle('d-none', !submitting)
}

function setSelectedRating(rating) {
  const safeRating = Number(rating)
  if (!reviewRatingInput) return

  reviewRatingInput.value = String(safeRating)

  reviewRatingStars.forEach((button) => {
    const value = Number(button.getAttribute('data-value'))
    const isSelected = value <= safeRating

    button.classList.toggle('btn-warning', isSelected)
    button.classList.toggle('btn-outline-warning', !isSelected)
  })
}

function reviewItemTemplate(review) {
  const username = review.profiles?.username || 'Unknown user'
  const comment = escapeHtml(review.comment || '').replaceAll('\n', '<br />')

  return `
    <article class="border rounded-3 p-3 review-card">
      <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
        <div>
          <p class="fw-semibold mb-1">${escapeHtml(username)}</p>
          <div class="d-inline-flex align-items-center gap-1 review-stars">${renderStars(review.rating)}</div>
        </div>
        <span class="text-secondary small">${escapeHtml(formatDate(review.created_at))}</span>
      </div>
      <p class="mb-0 text-secondary">${comment}</p>
    </article>
  `
}

function renderAverageRating(reviews) {
  if (!productAverageRating) return

  if (!reviews.length) {
    setVisibility(productAverageRating, false)
    return
  }

  const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0)
  const average = totalRating / reviews.length
  const averageText = average.toFixed(1)

  productAverageRating.innerHTML = `<i class="bi bi-star-fill text-warning me-1"></i>${averageText} (${reviews.length})`
  setVisibility(productAverageRating, true)
}

async function loadAndRenderReviews() {
  if (!pageProduct) return

  setVisibility(reviewsLoading, true)
  setVisibility(reviewsEmpty, false)
  reviewsList.innerHTML = ''

  const { data, error } = await getProductReviews(pageProduct.id)

  setVisibility(reviewsLoading, false)

  if (error) {
    showToast('Could not load reviews right now.', 'error')
    renderAverageRating([])
    return
  }

  renderAverageRating(data)

  if (!data.length) {
    setVisibility(reviewsEmpty, true)
    return
  }

  reviewsList.innerHTML = data.map(reviewItemTemplate).join('')
}

async function setupReviewEligibility() {
  if (!pageProduct) return

  setVisibility(reviewsSection, true)
  setVisibility(reviewFormWrap, false)
  setVisibility(reviewEligibilityMessage, false)

  if (!currentUser) {
    reviewEligibilityMessage.textContent = 'Log in and purchase this product to leave a review.'
    setVisibility(reviewEligibilityMessage, true)
    return
  }

  if (currentUser.id === pageProduct.seller_id) {
    reviewEligibilityMessage.textContent = 'Sellers cannot review their own product.'
    setVisibility(reviewEligibilityMessage, true)
    return
  }

  const [{ data: hasPurchased, error: purchaseError }, { data: hasReviewed, error: reviewError }] =
    await Promise.all([
      hasUserPurchasedProduct(currentUser.id, pageProduct.id),
      hasUserReviewedProduct(currentUser.id, pageProduct.id)
    ])

  if (purchaseError || reviewError) {
    reviewEligibilityMessage.textContent = 'Could not verify review eligibility right now.'
    setVisibility(reviewEligibilityMessage, true)
    return
  }

  if (!hasPurchased) {
    reviewEligibilityMessage.textContent = 'You can leave a review after purchasing this product.'
    setVisibility(reviewEligibilityMessage, true)
    return
  }

  if (hasReviewed) {
    reviewEligibilityMessage.textContent = 'You have already reviewed this product.'
    setVisibility(reviewEligibilityMessage, true)
    return
  }

  setVisibility(reviewFormWrap, true)
}

function bindReviewStars() {
  reviewRatingStars.forEach((button) => {
    button.addEventListener('click', () => {
      const rating = Number(button.getAttribute('data-value'))
      if (!Number.isFinite(rating)) return
      setSelectedRating(rating)
    })
  })
}

function bindReviewSubmit() {
  if (!reviewForm) return

  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (!pageProduct || !currentUser) return

    const rating = Number(reviewRatingInput?.value || 0)
    const comment = reviewComment?.value.trim() || ''

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      showToast('Please choose a rating from 1 to 5 stars.', 'info')
      return
    }

    if (!comment) {
      showToast('Please enter a review comment.', 'info')
      return
    }

    setReviewSubmitting(true)

    const { error } = await createProductReview({
      productId: pageProduct.id,
      reviewerId: currentUser.id,
      rating,
      comment
    })

    setReviewSubmitting(false)

    if (error) {
      showToast('Could not submit review. You may have already reviewed this product.', 'error')
      return
    }

    showToast('Review submitted successfully.', 'success')
    reviewForm.reset()
    setSelectedRating(0)

    await Promise.all([loadAndRenderReviews(), setupReviewEligibility()])
  })
}

function showError(message) {
  setVisibility(loadingState, false)
  setVisibility(detailsCard, false)
  setVisibility(errorState, false)
  showToast(message, 'error')
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

function renderProduct(product, seller) {
  const sellerName = seller?.username || 'Unknown seller'

  productImage.src = product.image_url || 'https://placehold.co/1200x900?text=ShopHub+Product'
  productImage.alt = product.title
  productTitle.textContent = product.title
  productDescription.textContent = product.description || 'No description provided.'
  productPrice.textContent = formatPrice(product.price)
  productQuantity.textContent = String(product.quantity ?? 0)
  productSeller.innerHTML = `<a href="./seller.html?id=${encodeURIComponent(product.seller_id)}" class="fw-semibold link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">${escapeHtml(sellerName)}</a>`
}

async function setupBuyerActions(currentUser, product) {
  const isSeller = currentUser?.id === product.seller_id
  const isSoldOut = product.status === 'sold' || Number(product.quantity ?? 0) <= 0

  if (editBtn) {
    editBtn.href = `./sell.html?id=${encodeURIComponent(product.id)}`
  }

  setVisibility(sellerActions, Boolean(currentUser && isSeller))
  setVisibility(buyNowBtn, Boolean(currentUser && !isSeller && !isSoldOut))
  setVisibility(soldMessage, Boolean(!isSeller && isSoldOut))

  if (!buyNowBtn || !currentUser || isSeller || isSoldOut) return

  buyNowBtn.addEventListener('click', async () => {
    buyNowBtn.disabled = true

    const { error } = await createOrder({
      buyerId: currentUser.id,
      productId: product.id
    })

    if (error) {
      showToast('Could not complete purchase. Please try again.', 'error')
      buyNowBtn.disabled = false
      return
    }

    showToast('Order created successfully!', 'success')
    const currentQuantity = Number(pageProduct.quantity ?? 0)
    pageProduct.quantity = Math.max(currentQuantity - 1, 0)

    if (pageProduct.quantity <= 0) {
      pageProduct.status = 'sold'
      setVisibility(buyNowBtn, false)
      setVisibility(soldMessage, true)
    } else {
      buyNowBtn.disabled = false
    }

    productQuantity.textContent = String(pageProduct.quantity)
  })
}

async function setupSellerActions(currentUser, product) {
  if (!deleteBtn || !currentUser || currentUser.id !== product.seller_id) return

  deleteBtn.addEventListener('click', async () => {
    const confirmed = window.confirm('Are you sure you want to delete this listing?')
    if (!confirmed) return

    const { error } = await deleteOwnProduct(product.id, currentUser.id)
    if (error) {
      showToast('Could not delete product. Please try again.', 'error')
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

  const [{ data: seller }, user] = await Promise.all([
    getProfileById(product.seller_id),
    getCurrentUser()
  ])

  pageProduct = product
  currentUser = user

  renderProduct(product, seller)
  await setupBuyerActions(currentUser, product)
  await setupSellerActions(currentUser, product)
  await Promise.all([loadAndRenderReviews(), setupReviewEligibility(), loadRelatedProducts()])

  setVisibility(loadingState, false)
  setVisibility(errorState, false)
  setVisibility(detailsCard, true)
}

function bindImageLightbox() {
  if (!productImage || !productImageModal || !productImageModalSrc || !window.bootstrap) return

  imageLightbox = imageLightbox || new window.bootstrap.Modal(productImageModal)

  productImage.addEventListener('click', () => {
    if (!productImage.src) return
    productImageModalSrc.src = productImage.src
    productImageModalSrc.alt = productImage.alt || 'Full product image'
    imageLightbox.show()
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  bindImageLightbox()
  bindReviewStars()
  bindReviewSubmit()
  setSelectedRating(0)
  await initializeProductPage()
})

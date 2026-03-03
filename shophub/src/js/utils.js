export function formatPrice(value) {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function truncate(text, maxLength = 120) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}

let backToTopInitialized = false

export function initBackToTopButton() {
  if (backToTopInitialized) return
  if (!document.body) return

  backToTopInitialized = true

  let button = document.getElementById('global-back-to-top-btn')

  if (!button) {
    button = document.createElement('button')
    button.id = 'global-back-to-top-btn'
    button.type = 'button'
    button.className = 'btn btn-primary rounded-circle back-to-top-btn'
    button.setAttribute('aria-label', 'Back to top')
    button.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>'
    document.body.appendChild(button)
  }

  const toggleButton = () => {
    const shouldShow = window.scrollY > 300
    button.classList.toggle('show', shouldShow)
  }

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  window.addEventListener('scroll', toggleButton, { passive: true })
  toggleButton()
}

function getToastContainer() {
  let container = document.getElementById('global-toast-container')
  if (container) return container

  container = document.createElement('div')
  container.id = 'global-toast-container'
  container.className = 'toast-container position-fixed bottom-0 end-0 p-3'
  container.style.zIndex = '1085'
  document.body.appendChild(container)

  return container
}

function getToastClass(type) {
  if (type === 'success') return 'text-bg-success'
  if (type === 'error') return 'text-bg-danger'
  return 'text-bg-primary'
}

export function showToast(message, type = 'info') {
  if (!message) return

  const container = getToastContainer()
  const toastEl = document.createElement('div')
  toastEl.className = `toast align-items-center border-0 ${getToastClass(type)}`
  toastEl.setAttribute('role', 'alert')
  toastEl.setAttribute('aria-live', 'assertive')
  toastEl.setAttribute('aria-atomic', 'true')

  const content = document.createElement('div')
  content.className = 'd-flex'

  const body = document.createElement('div')
  body.className = 'toast-body'
  body.textContent = message

  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'btn-close btn-close-white me-2 m-auto'
  closeButton.setAttribute('data-bs-dismiss', 'toast')
  closeButton.setAttribute('aria-label', 'Close')

  content.append(body, closeButton)
  toastEl.appendChild(content)
  container.appendChild(toastEl)

  if (window.bootstrap?.Toast) {
    const instance = new window.bootstrap.Toast(toastEl, {
      delay: 3000,
      autohide: true
    })
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove(), { once: true })
    instance.show()
    return
  }

  toastEl.classList.add('show')
  window.setTimeout(() => toastEl.remove(), 3000)
}

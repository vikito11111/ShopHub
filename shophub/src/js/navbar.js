import { supabase } from './supabase.js'

const navItems = [
  { label: 'Home', href: './index.html' },
  { label: 'Browse', href: './browse.html' },
  { label: 'Product', href: './product.html' },
  { label: 'Sell', href: './sell.html' },
  { label: 'Profile', href: './profile.html' },
  { label: 'Admin', href: './admin.html' }
]

const currentPage = window.location.pathname.split('/').pop() || 'index.html'

function renderNavLinks() {
  return navItems
    .map((item) => {
      const isActive = currentPage === item.href.replace('./', '')
      return `<li class="nav-item"><a class="nav-link${isActive ? ' active' : ''}" href="${item.href}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a></li>`
    })
    .join('')
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

async function renderNavbar() {
  const root = document.getElementById('navbar-root')
  if (!root) return

  const user = await getCurrentUser()

  const authLinks = user
    ? `<button id="logout-btn" type="button" class="btn btn-outline-light btn-sm">Logout</button>`
    : '<a href="./login.html" class="btn btn-outline-light btn-sm">Login</a> <a href="./register.html" class="btn btn-light btn-sm">Register</a>'

  root.innerHTML = `
    <header class="sticky-top">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div class="container">
          <a class="navbar-brand fw-semibold" href="./index.html">ShopHub</a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">${renderNavLinks()}</ul>
            <div class="d-flex gap-2">${authLinks}</div>
          </div>
        </div>
      </nav>
    </header>
  `

  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut()
      window.location.href = './index.html'
    })
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderNavbar()

  supabase.auth.onAuthStateChange(async () => {
    await renderNavbar()
  })
})

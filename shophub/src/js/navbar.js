import { supabase } from './supabase.js'

const baseNavItems = [
  { label: 'Home', href: './index.html' },
  { label: 'Browse', href: './browse.html' },
  { label: 'Sell', href: './sell.html' },
  { label: 'Profile', href: './profile.html' }
]

const currentPage = window.location.pathname.split('/').pop() || 'index.html'

async function performLocalSignOut() {
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith('sb-') && key.includes('auth-token'))
    .forEach((key) => window.localStorage.removeItem(key))

  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch (error) {
    return
  }
}

async function processLogoutQueryFlag() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('logout')) return

  await performLocalSignOut()

  url.searchParams.delete('logout')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

function renderNavLinks(navItems) {
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
  let isAdmin = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    isAdmin = profile?.role === 'admin'
  }

  const navItems = isAdmin
    ? [...baseNavItems, { label: 'Admin', href: './admin.html' }]
    : baseNavItems

  const logoutHref = `${window.location.pathname}?logout=1`

  const authLinks = user
    ? `<a id="logout-btn" href="${logoutHref}" class="btn btn-outline-light btn-sm">Logout</a>`
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
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">${renderNavLinks(navItems)}</ul>
            <div class="d-flex gap-2">${authLinks}</div>
          </div>
        </div>
      </nav>
    </header>
  `

}

document.addEventListener('DOMContentLoaded', async () => {
  await processLogoutQueryFlag()
  await renderNavbar()

  supabase.auth.onAuthStateChange(async () => {
    await renderNavbar()
  })
})

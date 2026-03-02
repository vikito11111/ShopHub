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
      return `<a href="${item.href}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a>`
    })
    .join(' ')
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
    ? `<button id="logout-btn" type="button">Logout</button>`
    : '<a href="./login.html">Login</a> <a href="./register.html">Register</a>'

  root.innerHTML = `
    <header>
      <nav>
        <a href="./index.html">ShopHub</a>
        <div>${renderNavLinks()}</div>
        <div>${authLinks}</div>
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

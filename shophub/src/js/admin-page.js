import { supabase } from './supabase.js'
import {
  deleteProductAsAdmin,
  getAdminProducts,
  getAdminStats,
  getAdminUsers,
  getProfileRole,
  updateUserRole
} from './admin.js'
import { formatPrice } from './utils.js'

const alertBox = document.getElementById('admin-alert')
const loadingState = document.getElementById('admin-loading')
const contentWrap = document.getElementById('admin-content')

const statUsers = document.getElementById('admin-stat-users')
const statProducts = document.getElementById('admin-stat-products')
const statOrders = document.getElementById('admin-stat-orders')

const usersTableBody = document.getElementById('admin-users-table-body')
const productsTableBody = document.getElementById('admin-products-table-body')

let currentUserId = ''

function showAlert(type, message) {
  alertBox.className = `alert alert-${type}`
  alertBox.textContent = message
  alertBox.classList.remove('d-none')

  window.setTimeout(() => {
    alertBox.classList.add('d-none')
  }, 3000)
}

function setVisible(element, visible) {
  if (!element) return
  element.classList.toggle('d-none', !visible)
}

function shortId(value) {
  if (!value) return ''
  return `${value.slice(0, 8)}...`
}

function productRowTemplate(product) {
  const image = product.image_url || 'https://placehold.co/120x80?text=Product'

  return `
    <tr>
      <td>
        <img src="${image}" alt="${product.title}" class="admin-product-thumb rounded" />
      </td>
      <td>${product.title}</td>
      <td>${formatPrice(product.price)}</td>
      <td><span class="badge text-bg-secondary text-uppercase">${product.status}</span></td>
      <td><span class="text-muted">${shortId(product.seller_id)}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger js-admin-delete-product" data-product-id="${product.id}">
          Delete
        </button>
      </td>
    </tr>
  `
}

function userRowTemplate(user) {
  return `
    <tr>
      <td>${user.username}</td>
      <td><span class="text-muted">${shortId(user.id)}</span></td>
      <td>
        <select class="form-select form-select-sm js-admin-role" data-user-id="${user.id}">
          <option value="user"${user.role === 'user' ? ' selected' : ''}>user</option>
          <option value="admin"${user.role === 'admin' ? ' selected' : ''}>admin</option>
        </select>
      </td>
      <td class="text-end">
        <button
          class="btn btn-sm btn-outline-primary js-admin-save-role"
          data-user-id="${user.id}"
          ${user.id === currentUserId ? 'disabled' : ''}
        >
          Save
        </button>
      </td>
    </tr>
  `
}

function bindRoleEvents() {
  usersTableBody.querySelectorAll('.js-admin-save-role').forEach((button) => {
    button.addEventListener('click', async () => {
      const userId = button.getAttribute('data-user-id')
      if (!userId) return

      const roleSelect = usersTableBody.querySelector(`.js-admin-role[data-user-id="${userId}"]`)
      if (!roleSelect) return

      const role = roleSelect.value
      const { error } = await updateUserRole(userId, role)
      if (error) {
        showAlert('danger', 'Could not update user role.')
        return
      }

      showAlert('success', 'User role updated.')
      await loadUsers()
    })
  })
}

function bindProductEvents() {
  productsTableBody.querySelectorAll('.js-admin-delete-product').forEach((button) => {
    button.addEventListener('click', async () => {
      const productId = button.getAttribute('data-product-id')
      if (!productId) return

      const confirmed = window.confirm('Delete this listing as admin?')
      if (!confirmed) return

      const { error } = await deleteProductAsAdmin(productId)
      if (error) {
        showAlert('danger', 'Could not delete product.')
        return
      }

      showAlert('success', 'Product deleted.')
      await loadProducts()
      await loadStats()
    })
  })
}

async function loadStats() {
  const { data, error } = await getAdminStats()
  if (error || !data) {
    showAlert('danger', 'Could not load admin stats.')
    return
  }

  statUsers.textContent = String(data.totalUsers)
  statProducts.textContent = String(data.totalProducts)
  statOrders.textContent = String(data.totalOrders)
}

async function loadUsers() {
  const { data, error } = await getAdminUsers()
  if (error) {
    usersTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load users.</td></tr>'
    return
  }

  if (!data.length) {
    usersTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No users found.</td></tr>'
    return
  }

  usersTableBody.innerHTML = data.map(userRowTemplate).join('')
  bindRoleEvents()
}

async function loadProducts() {
  const { data, error } = await getAdminProducts()
  if (error) {
    productsTableBody.innerHTML =
      '<tr><td colspan="6" class="text-center text-danger">Failed to load products.</td></tr>'
    return
  }

  if (!data.length) {
    productsTableBody.innerHTML =
      '<tr><td colspan="6" class="text-center text-muted">No products found.</td></tr>'
    return
  }

  productsTableBody.innerHTML = data.map(productRowTemplate).join('')
  bindProductEvents()
}

async function requireAdminAccess() {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = './index.html'
    return false
  }

  currentUserId = user.id

  const { data: profile, error } = await getProfileRole(user.id)
  if (error || !profile || profile.role !== 'admin') {
    window.location.href = './index.html'
    return false
  }

  return true
}

document.addEventListener('DOMContentLoaded', async () => {
  const allowed = await requireAdminAccess()
  if (!allowed) return

  setVisible(loadingState, true)
  setVisible(contentWrap, false)

  await Promise.all([loadStats(), loadUsers(), loadProducts()])

  setVisible(loadingState, false)
  setVisible(contentWrap, true)
})

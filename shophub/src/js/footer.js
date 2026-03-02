function renderFooter() {
  const root = document.getElementById('footer-root')
  if (!root) return

  const year = new Date().getFullYear()

  root.innerHTML = `
    <footer class="border-top bg-white py-4 mt-5">
      <div class="container text-center text-secondary footer-text">
        <p class="mb-0">© ${year} ShopHub. All rights reserved.</p>
      </div>
    </footer>
  `
}

document.addEventListener('DOMContentLoaded', () => {
  renderFooter()
})

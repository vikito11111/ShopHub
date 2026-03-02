function renderFooter() {
  const root = document.getElementById('footer-root')
  if (!root) return

  const year = new Date().getFullYear()

  root.innerHTML = `
    <footer>
      <p>© ${year} ShopHub. All rights reserved.</p>
    </footer>
  `
}

document.addEventListener('DOMContentLoaded', () => {
  renderFooter()
})

function renderFooter() {
  const root = document.getElementById('footer-root')
  if (!root) return

  const year = new Date().getFullYear()

  root.innerHTML = `
    <footer class="footer-enhanced mt-5 border-top border-secondary-subtle">
      <div class="container py-4 py-lg-5">
        <div class="row g-4">
          <div class="col-12 col-lg-5">
            <h3 class="h5 mb-2 d-inline-flex align-items-center gap-2 text-white">
              <i class="bi bi-bag-check-fill"></i>
              <span>ShopHub</span>
            </h3>
            <p class="mb-0 footer-text text-light-emphasis">
              A modern community marketplace for discovering quality products at fair prices.
            </p>
          </div>

          <div class="col-6 col-lg-3">
            <h4 class="h6 text-uppercase text-white-50 mb-3">Quick Links</h4>
            <ul class="list-unstyled d-grid gap-2 mb-0">
              <li><a href="./index.html" class="footer-link">Home</a></li>
              <li><a href="./browse.html" class="footer-link">Browse</a></li>
              <li><a href="./sell.html" class="footer-link">Sell</a></li>
            </ul>
          </div>

          <div class="col-6 col-lg-4">
            <h4 class="h6 text-uppercase text-white-50 mb-3">Account</h4>
            <ul class="list-unstyled d-grid gap-2 mb-0">
              <li><a href="./login.html" class="footer-link">Login</a></li>
              <li><a href="./register.html" class="footer-link">Register</a></li>
              <li><a href="./profile.html" class="footer-link">Profile</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom border-top border-secondary-subtle py-3">
        <div class="container">
          <p class="mb-0 text-center text-secondary footer-text">© ${year} ShopHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `
}

document.addEventListener('DOMContentLoaded', () => {
  renderFooter()
})

import { loginWithEmail } from './auth.js'

const form = document.getElementById('login-form')
const emailInput = document.getElementById('login-email')
const passwordInput = document.getElementById('login-password')
const emailError = document.getElementById('login-email-error')
const passwordError = document.getElementById('login-password-error')
const formError = document.getElementById('login-form-error')
const submitButton = document.getElementById('login-submit-btn')
const submitText = document.getElementById('login-submit-text')
const submitSpinner = document.getElementById('login-submit-spinner')

function setFieldError(element, message) {
  element.textContent = message
}

function clearErrors() {
  setFieldError(emailError, '')
  setFieldError(passwordError, '')
  formError.classList.add('d-none')
  formError.textContent = ''
}

function setSubmitting(submitting) {
  submitButton.disabled = submitting
  submitSpinner.classList.toggle('d-none', !submitting)
  submitText.textContent = submitting ? 'Signing in...' : 'Sign In'
}

function validateForm() {
  clearErrors()

  const email = emailInput.value.trim()
  const password = passwordInput.value

  let hasError = false

  if (!email) {
    setFieldError(emailError, 'Email is required.')
    hasError = true
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    setFieldError(emailError, 'Please enter a valid email address.')
    hasError = true
  }

  if (!password) {
    setFieldError(passwordError, 'Password is required.')
    hasError = true
  }

  return { hasError, email, password }
}

async function handleSubmit(event) {
  event.preventDefault()

  const { hasError, email, password } = validateForm()
  if (hasError) return

  setSubmitting(true)

  const { error } = await loginWithEmail(email, password)

  if (error) {
    formError.textContent = error.message || 'Could not sign in. Please check your credentials.'
    formError.classList.remove('d-none')
    setSubmitting(false)
    return
  }

  window.location.href = './index.html'
}

document.addEventListener('DOMContentLoaded', () => {
  form.addEventListener('submit', handleSubmit)
})

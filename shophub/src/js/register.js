import { registerWithEmail } from './auth.js'

const form = document.getElementById('register-form')
const emailInput = document.getElementById('register-email')
const passwordInput = document.getElementById('register-password')
const confirmPasswordInput = document.getElementById('register-confirm-password')
const emailError = document.getElementById('register-email-error')
const passwordError = document.getElementById('register-password-error')
const confirmPasswordError = document.getElementById('register-confirm-password-error')
const formError = document.getElementById('register-form-error')
const submitButton = document.getElementById('register-submit-btn')
const submitText = document.getElementById('register-submit-text')
const submitSpinner = document.getElementById('register-submit-spinner')

function setFieldError(element, message) {
  element.textContent = message
}

function clearErrors() {
  setFieldError(emailError, '')
  setFieldError(passwordError, '')
  setFieldError(confirmPasswordError, '')
  formError.classList.add('d-none')
  formError.textContent = ''
}

function setSubmitting(submitting) {
  submitButton.disabled = submitting
  submitSpinner.classList.toggle('d-none', !submitting)
  submitText.textContent = submitting ? 'Creating account...' : 'Create Account'
}

function validateForm() {
  clearErrors()

  const email = emailInput.value.trim()
  const password = passwordInput.value
  const confirmPassword = confirmPasswordInput.value

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
  } else if (password.length < 6) {
    setFieldError(passwordError, 'Password must be at least 6 characters.')
    hasError = true
  }

  if (!confirmPassword) {
    setFieldError(confirmPasswordError, 'Please confirm your password.')
    hasError = true
  } else if (password !== confirmPassword) {
    setFieldError(confirmPasswordError, 'Passwords do not match.')
    hasError = true
  }

  return { hasError, email, password }
}

async function handleSubmit(event) {
  event.preventDefault()

  const { hasError, email, password } = validateForm()
  if (hasError) return

  setSubmitting(true)

  const { error } = await registerWithEmail(email, password)

  if (error) {
    formError.textContent = error.message || 'Could not create account. Please try again.'
    formError.classList.remove('d-none')
    setSubmitting(false)
    return
  }

  window.location.href = './login.html'
}

document.addEventListener('DOMContentLoaded', () => {
  form.addEventListener('submit', handleSubmit)
})

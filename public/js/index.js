/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { sendOtp, login, logout, forgotPassword, signup } from './login';
import { resetPassword } from './resetPassword';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { createReview } from './review';
import { showAlert } from './alert';

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const forgotPasswordForm = document.querySelector('.form--forgotPassword');
const resetPasswordForm = document.querySelector('.form--resetPassword');
const reviewForm = document.querySelector('.form--review');

const mapBox = document.getElementById('map');

const logOutBtn = document.querySelector('.nav__el--logout');

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const userPhotoInput = document.getElementById('photo');
const userPhotoPreview = document.getElementById('user-photo-preview');
const saveSettingsBtn = document.querySelector('.btn--save-settings');

const bookBtn = document.getElementById('book-tour');
const sendOtpBtn = document.getElementById('send-otp');
const pageUrl = new URL(window.location.href);
const isBookingSuccess = pageUrl.searchParams.get('alert') === 'booking';

const showBookingSuccessAnimation = () => {
  const markup = `
    <div class="booking-success" role="status" aria-live="polite">
      <div class="booking-success__panel">
        <span class="booking-success__burst booking-success__burst--left"></span>
        <span class="booking-success__burst booking-success__burst--right"></span>
        <div class="booking-success__check">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.3 6.7a1 1 0 0 1 0 1.4l-9.1 9.1a1 1 0 0 1-1.4 0L3.7 11a1 1 0 1 1 1.4-1.4l5.4 5.4 8.4-8.3a1 1 0 0 1 1.4 0z"></path>
          </svg>
        </div>
        <p class="booking-success__title">Tour booked successfully</p>
        <p class="booking-success__text">Your receipt is on the way to your email.</p>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', markup);
  const overlay = document.querySelector('.booking-success');
  window.requestAnimationFrame(() => {
    overlay.classList.add('booking-success--visible');
  });

  window.setTimeout(() => {
    overlay.classList.remove('booking-success--visible');
    window.setTimeout(() => {
      overlay.remove();
    }, 450);
  }, 2600);
};

const removeBookingAlertFromUrl = () => {
  if (!isBookingSuccess) return;
  pageUrl.searchParams.delete('alert');
  const query = pageUrl.searchParams.toString();
  const nextUrl = `${pageUrl.pathname}${query ? `?${query}` : ''}${pageUrl.hash}`;
  window.history.replaceState({}, document.title, nextUrl);
};

// DELEGATION
if (sendOtpBtn) {
  sendOtpBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    sendOtp(email, name);
  });
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const returnTo = document.getElementById('returnTo')?.value || '/';
    login(email, password, returnTo);
  });

if (signupForm)
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const returnTo = document.getElementById('returnTo')?.value || '/';
    signup(name, email, otp, password, passwordConfirm, returnTo);
  });

if (logOutBtn)
  logOutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

if (userPhotoInput && userPhotoPreview) {
  userPhotoInput.addEventListener('change', (e) => {
    const [file] = e.target.files;
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      userPhotoPreview.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

if (userDataForm)
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (saveSettingsBtn) {
      saveSettingsBtn.textContent = 'Saving...';
      saveSettingsBtn.disabled = true;
    }
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    const selectedPhoto = userPhotoInput?.files?.[0];
    if (selectedPhoto) form.append('photo', selectedPhoto);

    await updateSettings(form, 'data');
    if (saveSettingsBtn) {
      saveSettingsBtn.textContent = 'Save settings';
      saveSettingsBtn.disabled = false;
    }
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (forgotPasswordForm)
  forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    forgotPassword(email);
  });

if (resetPasswordForm)
  resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const { token } = document.querySelector('.btn--reset-password').dataset;
    resetPassword(password, passwordConfirm, token);
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

if (reviewForm)
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const reviewBtn = document.querySelector('.btn--save-review');
    reviewBtn.textContent = 'Submitting review...';
    reviewBtn.disabled = true;
    const { tourId: tour, tourSlug } = reviewBtn.dataset;
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;
    const submitted = await createReview(tour, rating, review);

    if (submitted) {
      showAlert('success', 'Review submitted successfully!');
      window.setTimeout(() => {
        location.assign(`/tour/${tourSlug}`);
      }, 1200);
      return;
    }

    reviewBtn.textContent = 'Submit Review';
    reviewBtn.disabled = false;
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (isBookingSuccess) showBookingSuccessAnimation();
if (alertMessage) showAlert('success', alertMessage, 10);
removeBookingAlertFromUrl();

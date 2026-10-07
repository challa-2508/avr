const THEME_STORAGE_KEY = "avrDabbaTheme";
const themeToggles = document.querySelectorAll(".theme-toggle");
let savedTheme = null;

try {
  savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
} catch (error) {
  console.error("The saved theme preference could not be read.", error);
}

const initialTheme = savedTheme === "light" || savedTheme === "dark"
  ? savedTheme
  : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggles.forEach((toggle) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
    toggle.setAttribute("title", `Switch to ${nextTheme} theme`);
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
    toggle.querySelector("span").textContent = theme === "dark" ? "☀" : "☾";
  });
}

applyTheme(initialTheme);

themeToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      console.error("The theme preference could not be saved.", error);
    }
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

if (menuToggle && mainNav) {
  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mainNav.classList.remove("is-open");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
    mainNav.classList.toggle("is-open", !isOpen);
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (mainNav.classList.contains("is-open") &&
        !mainNav.contains(event.target) &&
        !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });

  const desktopNavigation = window.matchMedia("(min-width: 961px)");
  const closeMenuOnDesktop = (event) => {
    if (event.matches) closeMenu();
  };
  if (desktopNavigation.addEventListener) {
    desktopNavigation.addEventListener("change", closeMenuOnDesktop);
  } else {
    desktopNavigation.addListener(closeMenuOnDesktop);
  }
}

const bookingForm = document.querySelector("#booking-form");
if (bookingForm) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;

    const message = [
      "Hi AVR DABBA, I'd like to check lunch delivery availability.",
      `Parent/guardian: ${bookingForm.querySelector("#booking-name").value.trim()}`,
      `Mobile: ${bookingForm.querySelector("#booking-phone").value.trim()}`,
      `School: ${bookingForm.querySelector("#booking-school").value.trim()}`,
      `Pickup area: ${bookingForm.querySelector("#booking-area").value.trim()}`,
    ].join("\n");

    bookingForm.querySelector("#booking-message").value = message;
    window.location.assign(`https://wa.me/919281271759?text=${encodeURIComponent(message)}`);
  });
}

const yearElement = document.querySelector("#year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const startDateCards = document.querySelector(".plans-page .start-date-cards");
if (startDateCards) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    startDateCards.classList.add("is-visible");
  } else {
    const startDateObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          startDateObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    startDateObserver.observe(startDateCards);
  }
}

const feedbackForm = document.querySelector("#feedback-form");
const ratingValue = document.querySelector("#rating-value");
const ratingError = document.querySelector("#rating-error");
const feedbackStatus = document.querySelector("#feedback-status");
const ratingStars = document.querySelectorAll(".rating-star");

const defaultReviews = [
  {
    name: "S. Radhika",
    context: "Parent of Master Rohan (Class 6, DPS Gachibowli)",
    rating: 5,
    date: "2025-08-28",
    quote: "AVR DABBA has been a complete lifesaver for our family! I cook peacefully at 10 AM, and my son receives hot homemade food ..."
  },
  {
    name: "K. Srinivas Rao",
    context: "Parent of Master Teja (Class 4, Oakridge)",
    rating: 5,
    date: "2025-08-25",
    quote: "No more 5 AM morning rush! The delivery is always punctual and safe. Receiving WhatsApp updates gives us peace of mind."
  },
  {
    name: "hema",
    context: "delhi",
    rating: 5,
    date: "2026-10-06",
    quote: "nice service"
  }
];

const STORAGE_KEY = "avrDabbaReviews";
const reviewList = document.querySelector("#reviews-list");
const scoreValue = document.querySelector("#score-value");
const reviewCount = document.querySelector("#review-count");
const avgRating = document.querySelector("#avg-rating");
const summaryCount = document.querySelector("#summary-count");
let reviews = [...defaultReviews];

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function setFeedbackStatus(message, isError = false) {
  if (!feedbackStatus) return;

  feedbackStatus.textContent = message;
  feedbackStatus.classList.toggle("is-error", isError);
}

function readReviews() {
  let saved;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    return {
      reviews: [...defaultReviews],
      error: "This browser couldn't access saved reviews. New feedback may not be saved.",
    };
  }

  if (saved === null) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultReviews));
      return { reviews: [...defaultReviews], error: "" };
    } catch {
      return {
        reviews: [...defaultReviews],
        error: "This browser couldn't save reviews. New feedback may not be saved.",
      };
    }
  }

  let parsed;
  try {
    parsed = JSON.parse(saved);
  } catch {
    return {
      reviews: [...defaultReviews],
      error: "Saved reviews couldn't be read because the browser data is invalid.",
    };
  }

  if (!Array.isArray(parsed) || !parsed.every((review) =>
    review &&
    typeof review.name === "string" &&
    typeof review.quote === "string" &&
    Number.isInteger(Number(review.rating)) &&
    Number(review.rating) >= 1 &&
    Number(review.rating) <= 5
  )) {
    return {
      reviews: [...defaultReviews],
      error: "Saved reviews couldn't be read because their data is invalid.",
    };
  }

  return { reviews: parsed, error: "" };
}

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return Array.from({ length: 5 }, (_, index) => index < safeRating ? "★" : "☆").join("");
}

function renderReviews() {
  if (!reviewList) return;

  const total = reviews.length;
  const average = total
    ? (reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total).toFixed(1)
    : "0.0";

  if (scoreValue) scoreValue.textContent = average;
  if (reviewCount) reviewCount.textContent = `(${total} review${total === 1 ? "" : "s"})`;
  if (summaryCount) summaryCount.textContent = `${total} review${total === 1 ? "" : "s"}`;
  if (avgRating) avgRating.textContent = average;

  if (!total) {
    reviewList.innerHTML = '<p class="reviews-empty">No reviews yet. Be the first parent to share your experience.</p>';
    return;
  }

  reviewList.innerHTML = reviews
    .map((review) => `
      <article class="review-card">
        <div class="review-card__side" aria-hidden="true"></div>
        <div class="review-card__body">
          <div class="review-card__header">
            <div>
              <h4>${escapeHtml(review.name)}</h4>
              <p>${escapeHtml(review.context || "Parent / guardian")}</p>
            </div>
            <div class="review-stars" aria-label="${Number(review.rating)} star rating">${renderStars(review.rating)}</div>
          </div>
          <div class="review-date">${formatDate(review.date || new Date().toISOString())}</div>
          <p class="review-text">"${escapeHtml(review.quote)}"</p>
        </div>
      </article>
    `)
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

if (ratingStars.length) {
  ratingStars.forEach((star) => {
    star.addEventListener("click", () => {
      const selectedRating = Number(star.dataset.rating);
      if (ratingValue) {
        ratingValue.value = String(selectedRating);
      }
      if (ratingError) {
        ratingError.textContent = "";
      }

      ratingStars.forEach((ratingStar) => {
        const isSelected = Number(ratingStar.dataset.rating) <= selectedRating;
        ratingStar.classList.toggle("is-selected", isSelected);
        ratingStar.setAttribute("aria-pressed", String(Number(ratingStar.dataset.rating) === selectedRating));
      });
    });
  });
}

if (feedbackForm) {
  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!ratingValue || !ratingValue.value) {
      if (ratingError) {
        ratingError.textContent = "Please choose a rating before continuing.";
      }
      if (ratingStars.length) {
        ratingStars[0].focus();
      }
      return;
    }

    if (!feedbackForm.reportValidity()) {
      return;
    }

    const formData = new FormData(feedbackForm);
    const name = String(formData.get("name") || "").trim();
    const context = String(formData.get("context") || "").trim();
    const review = String(formData.get("review") || "").trim();

    if (!name || !review) {
      setFeedbackStatus("Please enter your name and review before submitting.", true);
      if (!name) {
        feedbackForm.querySelector('[name="name"]').focus();
      } else {
        feedbackForm.querySelector('[name="review"]').focus();
      }
      return;
    }

    const updatedReviews = [{
      name,
      context,
      rating: Number(ratingValue.value),
      date: new Date().toISOString(),
      quote: review,
    }, ...reviews];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
    } catch {
      setFeedbackStatus("Your review couldn't be saved in this browser. Please try again or contact us on WhatsApp.", true);
      return;
    }

    reviews = updatedReviews;
    renderReviews();

    setFeedbackStatus("Thank you! Your review is now visible in this browser.");

    feedbackForm.reset();
    if (ratingValue) ratingValue.value = "";
    ratingStars.forEach((ratingStar) => {
      ratingStar.classList.remove("is-selected");
      ratingStar.setAttribute("aria-pressed", "false");
    });
    if (ratingError) ratingError.textContent = "";

    setTimeout(() => {
      setFeedbackStatus("");
    }, 2500);
  });
}

const storedReviews = readReviews();
reviews = storedReviews.reviews;
if (storedReviews.error) {
  setFeedbackStatus(storedReviews.error, true);
}
renderReviews();

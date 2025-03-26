// Get initial scroll position and important DOM elements
let scrollpos = window.scrollY;
let header = document.getElementById("header"); // Main header/navbar container
let navcontent = document.getElementById("nav-content"); // Navigation menu content
let navaction = document.getElementById("navAction"); // Action button in navbar
let brandname = document.getElementById("brandname"); // Brand/logo text
let toToggle = document.querySelectorAll(".toggleColour"); // Elements that change color on scroll

// Add scroll event listener to handle navbar appearance changes
document.addEventListener("scroll", function () {
  scrollpos = window.scrollY;

  if (scrollpos > 10) {
    // === SCROLLED STATE ===
    header.classList.add("bg-white");
    header.classList.remove("gradient");

    if (navaction) {
      navaction.classList.remove("bg-white");
      navaction.classList.add("gradient");
      navaction.classList.remove("text-gray-800");
      navaction.classList.add("text-white");
    }

    toToggle.forEach((element) => {
      element.classList.remove("text-white");
      element.classList.add("text-gray-800");
    });

    const dropdownBtn = document.getElementById("dropdown-btn");
    if (dropdownBtn) {
      dropdownBtn.classList.remove("text-white");
      dropdownBtn.classList.add("text-gray-800");
    }

    // Navigation content bg change only on scroll
    navcontent.classList.remove("bg-gradient");
    navcontent.classList.remove("bg-gray-100");
    navcontent.classList.add("bg-white");

    header.classList.add("shadow");
  } else {
    // === TOP OF PAGE STATE ===
    header.classList.remove("bg-white");
    header.classList.add("gradient");

    if (navaction) {
      navaction.classList.remove("gradient");
      navaction.classList.add("bg-white");
      navaction.classList.remove("text-white");
      navaction.classList.add("text-gray-800");
    }

    toToggle.forEach((element) => {
      element.classList.remove("text-gray-800");
      element.classList.add("text-white");
    });

    const dropdownBtn = document.getElementById("dropdown-btn");
    if (dropdownBtn && window.innerWidth >= 1024) {
      dropdownBtn.classList.remove("text-gray-800");
      dropdownBtn.classList.add("text-white");
    }

    // For mobile view - always keep text black
    if (window.innerWidth < 1024) {
      navcontent.querySelectorAll("a, button").forEach((element) => {
        element.classList.remove("text-white");
        element.classList.add("text-gray-800");
      });
    }

    header.classList.remove("shadow");
    navcontent.classList.remove("bg-white");
    navcontent.classList.remove("bg-gray-100");
    navcontent.classList.add("bg-gradient");
  }
});

// Add window resize listener to handle mobile/desktop transitions
window.addEventListener("resize", function () {
  if (window.innerWidth < 1024) {
    // Mobile view - force text dark
    navcontent.querySelectorAll("a, button").forEach((element) => {
      element.classList.remove("text-white");
      element.classList.add("text-gray-800");
    });
  } else {
    // Desktop view
    if (scrollpos <= 10) {
      navcontent
        .querySelectorAll(".toggleColour, #dropdown-btn")
        .forEach((element) => {
          element.classList.remove("text-gray-800");
          element.classList.add("text-white");
        });
    }
  }
});

// === MOBILE MENU FUNCTIONALITY ===
let navMenuDiv = document.getElementById("nav-content"); // Mobile menu container
let navMenu = document.getElementById("nav-toggle"); // Mobile menu toggle button

// Add click event listener to document
document.addEventListener("click", function (e) {
  const isClickInside =
    navMenuDiv.contains(e.target) || navMenu.contains(e.target);

  if (navMenu.contains(e.target)) {
    // Toggle menu when clicking the button
    navMenuDiv.classList.toggle("hidden");
    // Add rounded corners when menu is visible
    if (!navMenuDiv.classList.contains("hidden")) {
      navMenuDiv.classList.add("rounded-lg");
      navMenuDiv.classList.add("mt-2"); // Add a small margin top for better spacing
    }
  } else if (!isClickInside && !navMenuDiv.classList.contains("hidden")) {
    // Close menu when clicking outside
    navMenuDiv.classList.add("hidden");
    navMenuDiv.classList.remove("rounded-lg");
  }
});

// Add gradient class to header initially if at top of page
if (scrollpos <= 10) {
  header.classList.add("gradient");

  // Set initial white color for dropdown button on desktop
  const dropdownBtn = document.getElementById("dropdown-btn");
  if (dropdownBtn && window.innerWidth >= 1024) {
    dropdownBtn.classList.remove("text-gray-800");
    dropdownBtn.classList.add("text-white");
  }
}

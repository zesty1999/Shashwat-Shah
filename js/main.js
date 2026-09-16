document.getElementById("year").textContent = new Date().getFullYear();

const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${(i % 4) * 60}ms`;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

// Sidebar nav: highlight the link matching the section in view
const sideNavLinks = document.querySelectorAll(".side-nav a");
const sections = Array.from(sideNavLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`.side-nav a[href="#${entry.target.id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          sideNavLinks.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((section) => spy.observe(section));
}

// Case study cards: open full detail in a modal dialog
const csModal = document.getElementById("csModal");
const csModalBody = document.getElementById("csModalBody");
const csModalClose = document.getElementById("csModalClose");

if (csModal && csModalBody) {
  document.querySelectorAll(".cs-card").forEach((card) => {
    card.addEventListener("click", () => {
      const template = document.getElementById(card.getAttribute("data-cs-target"));
      if (!template) return;
      csModalBody.innerHTML = "";
      csModalBody.appendChild(template.content.cloneNode(true));
      csModal.showModal();
    });
  });

  if (csModalClose) {
    csModalClose.addEventListener("click", () => csModal.close());
  }

  csModal.addEventListener("click", (event) => {
    const rect = csModal.getBoundingClientRect();
    const inDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!inDialog) csModal.close();
  });
}

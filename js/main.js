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

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Hero prompt line: type out the existing text once on load (content is
// already in the DOM for no-JS/SEO/screen readers; this only re-types it).
const typedHook = document.getElementById("typedHook");
if (typedHook && !prefersReducedMotion) {
  const fullText = typedHook.textContent;
  typedHook.textContent = "";
  let i = 0;
  (function typeNext() {
    if (i <= fullText.length) {
      typedHook.textContent = fullText.slice(0, i);
      i++;
      setTimeout(typeNext, 28);
    }
  })();
}

// Scroll progress bar
const scrollProgress = document.getElementById("scrollProgress");
if (scrollProgress) {
  let ticking = false;
  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    ticking = false;
  }
  updateProgress();
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  });
  window.addEventListener("resize", updateProgress);
}

// Stats: count up from 0 when scrolled into view
const countEls = document.querySelectorAll("[data-count-to]");

function animateCount(el) {
  const target = parseInt(el.getAttribute("data-count-to"), 10);
  const suffix = el.getAttribute("data-suffix") || "";
  if (prefersReducedMotion || isNaN(target)) {
    el.textContent = target + suffix;
    return;
  }
  const duration = 900;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if ("IntersectionObserver" in window && countEls.length) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  countEls.forEach((el) => countObserver.observe(el));
} else {
  countEls.forEach((el) => animateCount(el));
}

// Sidebar nav: highlight the link matching the section in view
const sideNavLinks = document.querySelectorAll(".side-nav a");
const sections = Array.from(sideNavLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function setActiveSideNav(link) {
  if (!link) return;
  sideNavLinks.forEach((l) => l.classList.remove("is-active"));
  link.classList.add("is-active");
}

if ("IntersectionObserver" in window && sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      // Near the bottom of the page there may not be enough room below the
      // last section for it to ever cross a mid-viewport band, so once
      // we're effectively at the bottom, force the last link active.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActiveSideNav(sideNavLinks[sideNavLinks.length - 1]);
        return;
      }
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSideNav(document.querySelector(`.side-nav a[href="#${entry.target.id}"]`));
        }
      });
    },
    { rootMargin: "0px 0px -60% 0px" }
  );
  sections.forEach((section) => spy.observe(section));

  window.addEventListener("scroll", () => {
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) setActiveSideNav(sideNavLinks[sideNavLinks.length - 1]);
  });
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

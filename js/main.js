// IST Services — Məlumat Saytı
// Scroll reveal + expandable price panel. No external dependencies.

(function () {
  "use strict";

  /* ---------- Scroll reveal (GPU accelerated, IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Scroll cue click ---------- */
  var scrollCue = document.getElementById("scroll-cue");
  if (scrollCue) {
    scrollCue.addEventListener("click", function () {
      var target = document.getElementById("content-start");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- Expandable course price panel (no navigation) ---------- */
  var priceCta = document.getElementById("price-cta");
  var pricePanel = document.getElementById("price-panel");
  if (priceCta && pricePanel) {
    priceCta.addEventListener("click", function () {
      var isOpen = pricePanel.classList.toggle("is-open");
      priceCta.classList.toggle("is-open", isOpen);
      priceCta.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen) {
        setTimeout(function () {
          pricePanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 220);
      }
    });
  }
})();

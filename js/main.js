// IST Services — Production Scroll Engine
// Ultra-smooth 60/120fps scroll with GPU acceleration. Zero dependencies.

(function () {
  "use strict";

  /* ---------- Config ---------- */
  var REVEAL_THRESHOLD = 0.08;
  var REVEAL_ROOT_MARGIN = "0px 0px -40px 0px";
  var STAGGER_DELAY = 60;

  /* ---------- Utility: passive event support ---------- */
  var supportsPassive = false;
  try {
    var opts = Object.defineProperty({}, "passive", {
      get: function () { supportsPassive = true; }
    });
    window.addEventListener("testPassive", null, opts);
  } catch (e) { /* no passive support */ }

  var passiveOpt = supportsPassive ? { passive: true } : false;

  /* ---------- Scroll state (GPU layer) ---------- */
  var scrollY = 0;
  var ticking = false;

  function onScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (!ticking) {
      requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  }

  function updateScrollState() {
    ticking = false;
    // Scroll-based parallax or effects go here (currently minimal to avoid jank)
  }

  window.addEventListener("scroll", onScroll, passiveOpt);

  /* ---------- IntersectionObserver: reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  function staggerReveal(el, index) {
    el.style.transitionDelay = (index * STAGGER_DELAY) + "ms";
  }

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting) {
            var el = entry.target;
            // Calculate stagger index within sibling group
            var siblings = el.parentElement.querySelectorAll(".reveal");
            var idx = Array.prototype.indexOf.call(siblings, el);
            staggerReveal(el, idx);
            el.classList.add("is-visible");
            revealObserver.unobserve(el);
          }
        }
      },
      { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN }
    );

    for (var i = 0; i < revealEls.length; i++) {
      revealObserver.observe(revealEls[i]);
    }
  } else {
    // Fallback: show everything immediately
    for (var j = 0; j < revealEls.length; j++) {
      revealEls[j].classList.add("is-visible");
    }
  }

  /* ---------- Expandable price panel ---------- */
  var priceCta = document.getElementById("price-cta");
  var pricePanel = document.getElementById("price-panel");

  if (priceCta && pricePanel) {
    priceCta.addEventListener("click", function () {
      var isOpen = pricePanel.classList.toggle("is-open");
      priceCta.classList.toggle("is-open", isOpen);
      priceCta.setAttribute("aria-expanded", isOpen ? "true" : "false");

      if (isOpen) {
        // Smooth scroll to panel after animation starts
        requestAnimationFrame(function () {
          setTimeout(function () {
            pricePanel.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 180);
        });
      }
    }, passiveOpt);
  }

  /* ---------- Lazy load images (native + fallback) ---------- */
  if ("loading" in HTMLImageElement.prototype) {
    // Native lazy loading supported — images already have loading="lazy" in HTML
  } else {
    // Fallback: use IntersectionObserver for lazy images
    var lazyImages = document.querySelectorAll("img[loading='lazy']");
    if (lazyImages.length > 0 && "IntersectionObserver" in window) {
      var imgObserver = new IntersectionObserver(function (entries) {
        for (var k = 0; k < entries.length; k++) {
          if (entries[k].isIntersecting) {
            var img = entries[k].target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            imgObserver.unobserve(img);
          }
        }
      }, { rootMargin: "200px" });
      for (var m = 0; m < lazyImages.length; m++) {
        imgObserver.observe(lazyImages[m]);
      }
    }
  }

  /* ---------- Smooth anchor scroll (polyfill-style) ---------- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;
    var target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, passiveOpt);

})();

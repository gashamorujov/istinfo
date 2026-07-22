// IST Services — Production Scroll Engine
// Ultra-smooth 60/120fps scroll with GPU acceleration. Zero dependencies.
// Performance-optimized for butter-smooth scrolling on all devices.

(function () {
  "use strict";

  /* ---------- Config ---------- */
  var REVEAL_THRESHOLD = 0.15;
  var REVEAL_ROOT_MARGIN = "0px 0px -60px 0px";
  var STAGGER_DELAY = 40;
  var HERO_ANIMATION_DURATION = 2500;
  var BATCH_SIZE = 8;

  /* ---------- Utility: passive event support ---------- */
  var supportsPassive = false;
  try {
    var opts = Object.defineProperty({}, "passive", {
      get: function () { supportsPassive = true; }
    });
    window.addEventListener("testPassive", null, opts);
  } catch (e) { /* no passive support */ }

  var passiveOpt = supportsPassive ? { passive: true } : false;

  /* ---------- Scroll state ---------- */
  var scrollY = 0;
  var ticking = false;
  var heroAnimated = false;

  function onScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (!ticking) {
      requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  }

  function updateScrollState() {
    ticking = false;
    if (!heroAnimated && scrollY > 50) {
      pauseHeroAnimations();
      heroAnimated = true;
    }
  }

  /* ---------- Pause hero animations for performance ---------- */
  function pauseHeroAnimations() {
    var heroLogo = document.querySelector('.hero-logo');
    if (heroLogo) {
      heroLogo.style.animationPlayState = 'paused';
      heroLogo.style.willChange = 'auto';
    }
    var heroElements = document.querySelectorAll('.hero-eyebrow, .hero-title, .hero-rule');
    for (var i = 0; i < heroElements.length; i++) {
      heroElements[i].style.willChange = 'auto';
    }
  }

  /* ---------- Batch reveal with stagger ---------- */
  function processRevealBatch(elements, startIndex) {
    var endIndex = Math.min(startIndex + BATCH_SIZE, elements.length);
    for (var i = startIndex; i < endIndex; i++) {
      var el = elements[i];
      var siblings = el.parentElement.querySelectorAll('.reveal');
      var idx = Array.prototype.indexOf.call(siblings, el);
      el.style.transitionDelay = (idx * STAGGER_DELAY) + 'ms';
      el.classList.add('is-visible');
    }
  }

  /* ---------- IntersectionObserver: reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var revealQueue = [];
  var isProcessing = false;

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting) {
            revealQueue.push(entry.target);
            revealObserver.unobserve(entry.target);
          }
        }
        if (!isProcessing && revealQueue.length > 0) {
          isProcessing = true;
          requestAnimationFrame(function processBatch() {
            var batch = revealQueue.splice(0, BATCH_SIZE);
            for (var j = 0; j < batch.length; j++) {
              var el = batch[j];
              var siblings = el.parentElement.querySelectorAll('.reveal');
              var idx = Array.prototype.indexOf.call(siblings, el);
              el.style.transitionDelay = (idx * STAGGER_DELAY) + 'ms';
              el.classList.add('is-visible');
            }
            if (revealQueue.length > 0) {
              requestAnimationFrame(processBatch);
            } else {
              isProcessing = false;
            }
          });
        }
      },
      { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN }
    );

    for (var i = 0; i < revealEls.length; i++) {
      revealObserver.observe(revealEls[i]);
    }
  } else {
    for (var j = 0; j < revealEls.length; j++) {
      revealEls[j].classList.add('is-visible');
    }
  }

  /* ---------- Expandable price panel ---------- */
  var priceCta = document.getElementById('price-cta');
  var pricePanel = document.getElementById('price-panel');

  if (priceCta && pricePanel) {
    priceCta.addEventListener('click', function () {
      var isOpen = pricePanel.classList.toggle('is-open');
      priceCta.classList.toggle('is-open', isOpen);
      priceCta.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      if (isOpen) {
        requestAnimationFrame(function () {
          setTimeout(function () {
            pricePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 180);
        });
      }
    }, passiveOpt);
  }

  /* ---------- Lazy load images ---------- */
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
  } else {
    var lazyImages = document.querySelectorAll("img[loading='lazy']");
    if (lazyImages.length > 0 && 'IntersectionObserver' in window) {
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
      }, { rootMargin: '200px' });
      for (var m = 0; m < lazyImages.length; m++) {
        imgObserver.observe(lazyImages[m]);
      }
    }
  }

  /* ---------- Smooth anchor scroll ---------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    var target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, passiveOpt);

  /* ---------- Initialize: pause hero animations after load ---------- */
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (!heroAnimated) {
        pauseHeroAnimations();
        heroAnimated = true;
      }
    }, HERO_ANIMATION_DURATION);
  }, passiveOpt);

})();

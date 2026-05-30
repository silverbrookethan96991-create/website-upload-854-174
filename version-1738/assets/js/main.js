(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');
    var mobileCategories = document.querySelector('[data-mobile-categories]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
        if (mobileCategories) {
          mobileCategories.classList.toggle('is-open');
        }
      });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var prev = carousel.querySelector('[data-hero-prev]');
      var next = carousel.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function restartTimer() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
          restartTimer();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          restartTimer();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          restartTimer();
        });
      }

      showSlide(0);
      restartTimer();
    }

    var filterInput = document.querySelector('.card-filter-input');
    var cardList = document.querySelector('[data-card-list]');

    if (filterInput && cardList) {
      var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
      filterInput.addEventListener('input', function () {
        var keyword = filterInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-region') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          card.classList.toggle('hidden-by-filter', keyword && haystack.indexOf(keyword) === -1);
        });
      });
    }
  });
})();

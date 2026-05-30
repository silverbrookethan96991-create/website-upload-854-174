(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    });

    document.querySelectorAll(".js-search").forEach(function (input) {
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        var scope = input.closest("main") || document;
        var cards = scope.querySelectorAll(".search-item");

        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          card.classList.toggle("hidden-by-filter", keyword && text.indexOf(keyword) === -1);
        });
      });
    });

    document.querySelectorAll(".row-section").forEach(function (section) {
      var row = section.querySelector("[data-scroll-row]");
      var left = section.querySelector("[data-row-left]");
      var right = section.querySelector("[data-row-right]");

      if (!row) {
        return;
      }

      if (left) {
        left.addEventListener("click", function () {
          row.scrollBy({ left: -420, behavior: "smooth" });
        });
      }

      if (right) {
        right.addEventListener("click", function () {
          row.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });
  });
})();

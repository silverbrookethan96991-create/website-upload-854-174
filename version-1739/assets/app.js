(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterCards(root, query) {
    var cards = selectAll("[data-search-card]", root);
    var empty = root.querySelector("[data-empty-state]");
    var normalized = normalize(query);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search-text"));
      var matched = !normalized || haystack.indexOf(normalized) !== -1;
      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", cards.length > 0 && visible === 0);
    }
  }

  function setupFilters() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var pages = selectAll("[data-filter-page]");

    pages.forEach(function (page) {
      var inputs = selectAll("[data-search-input]", page);

      inputs.forEach(function (input) {
        if (query && !input.value) {
          input.value = query;
        }

        input.addEventListener("input", function () {
          filterCards(page, input.value);
        });
      });

      filterCards(page, inputs.length ? inputs[0].value : query);
    });
  }

  function setupStripButtons() {
    selectAll("[data-strip]").forEach(function (wrap) {
      var strip = wrap.querySelector(".movie-strip");
      var left = wrap.querySelector("[data-strip-left]");
      var right = wrap.querySelector("[data-strip-right]");

      if (!strip) {
        return;
      }

      function move(amount) {
        strip.scrollBy({
          left: amount,
          behavior: "smooth"
        });
      }

      if (left) {
        left.addEventListener("click", function () {
          move(-360);
        });
      }

      if (right) {
        right.addEventListener("click", function () {
          move(360);
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupStripButtons();
  });
})();

(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function normalizeText(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function updateCardFilters(scope) {
    var queryInput = scope.querySelector("[data-filter-query]");
    var regionSelect = scope.querySelector("[data-filter-region]");
    var typeSelect = scope.querySelector("[data-filter-type]");
    var yearSelect = scope.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

    function runFilter() {
      var query = normalizeText(queryInput ? queryInput.value : "");
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";

      cards.forEach(function(card) {
        var haystack = normalizeText(card.getAttribute("data-search"));
        var passQuery = !query || haystack.indexOf(query) !== -1;
        var passRegion = !region || card.getAttribute("data-region") === region;
        var passType = !type || card.getAttribute("data-type") === type;
        var passYear = !year || card.getAttribute("data-year") === year;
        card.classList.toggle("hidden-by-filter", !(passQuery && passRegion && passType && passYear));
      });
    }

    [queryInput, regionSelect, typeSelect, yearSelect].forEach(function(node) {
      if (node) {
        node.addEventListener("input", runFilter);
        node.addEventListener("change", runFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && queryInput) {
      queryInput.value = q;
    }

    runFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(updateCardFilters);

  function preparePlayer(box) {
    var video = box.querySelector("video");
    var layer = box.querySelector(".play-layer");
    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-stream") || "";
    var mounted = false;

    function mountStream() {
      if (mounted || !stream) {
        return;
      }
      mounted = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        box._hlsInstance = hls;
        return;
      }

      video.src = stream;
    }

    function startVideo() {
      mountStream();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function() {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener("click", startVideo);
    }

    video.addEventListener("play", function() {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function() {
      if (layer && video.currentTime === 0) {
        layer.classList.remove("is-hidden");
      }
    });

    video.addEventListener("click", function() {
      if (video.paused) {
        startVideo();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(preparePlayer);
})();

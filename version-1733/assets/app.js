(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function textOf(card) {
    return [
      card.dataset.title || '',
      card.dataset.region || '',
      card.dataset.type || '',
      card.dataset.year || '',
      card.dataset.genre || '',
      card.dataset.tags || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function applyFilter(input) {
    var scope = input.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));
    var query = (input.value || '').trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var matched = !query || textOf(card).indexOf(query) !== -1;
      card.classList.toggle('is-filtered-out', !matched);
      if (matched) {
        shown += 1;
      }
    });
    var existing = scope.querySelector('.no-results');
    if (!shown && cards.length) {
      if (!existing) {
        var note = document.createElement('div');
        note.className = 'no-results';
        note.textContent = '没有找到匹配的影片';
        var grid = scope.querySelector('.movie-grid') || scope.querySelector('.ranking-list');
        if (grid) {
          grid.appendChild(note);
        }
      }
    } else if (existing) {
      existing.remove();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var hidden = menu.hasAttribute('hidden');
      if (hidden) {
        menu.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.textContent = '×';
      } else {
        menu.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer;
    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function initFilters() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.page-filter'));
    inputs.forEach(function (input) {
      if (q && input.name === 'q') {
        input.value = q;
      }
      if (q && !input.value) {
        input.value = q;
      }
      input.addEventListener('input', function () {
        applyFilter(input);
      });
      if (input.value) {
        applyFilter(input);
      }
    });
  }

  window.setupMoviePlayer = function (stream) {
    var video = document.querySelector('.movie-video');
    var cover = document.querySelector('.player-cover');
    if (!video || !stream) {
      return;
    }
    var started = false;
    var hls;
    function bind() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }
    function play() {
      bind();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();

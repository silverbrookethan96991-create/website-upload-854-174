(function () {
  function select(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function selectAll(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function bindMenu() {
    var toggle = select('[data-menu-toggle]');
    var nav = select('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = select('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = select('[data-hero-prev]', hero);
    var next = select('[data-hero-next]', hero);
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        reset();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        reset();
      });
    });

    show(0);
    start();
  }

  function initRails() {
    selectAll('.section').forEach(function (section) {
      var rail = select('[data-rail]', section);
      var prev = select('[data-rail-prev]', section);
      var next = select('[data-rail-next]', section);
      if (!rail) {
        return;
      }
      if (prev) {
        prev.addEventListener('click', function () {
          rail.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          rail.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="movie-thumb" href="' + escapeHtml(movie.url) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="movie-score">★ ' + escapeHtml(movie.rating) + '</span>',
      '<span class="movie-duration">' + escapeHtml(movie.duration) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</p>',
      '<p class="movie-desc">' + escapeHtml(movie.description) + '</p>',
      '<div class="movie-tags">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function initSearch() {
    var results = select('#searchResults');
    var input = select('#searchInput');
    var category = select('#categoryFilter');
    var year = select('#yearFilter');
    var status = select('#searchStatus');
    if (!results || !input || typeof MovieIndex === 'undefined') {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var q = input.value.trim().toLowerCase();
      var selectedCategory = category ? category.value : '';
      var selectedYear = year ? year.value : '';
      var list = MovieIndex.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.genre, movie.category, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        var okQuery = !q || text.indexOf(q) !== -1;
        var okCategory = !selectedCategory || movie.category === selectedCategory;
        var okYear = !selectedYear || movie.year === selectedYear;
        return okQuery && okCategory && okYear;
      }).slice(0, 96);
      results.innerHTML = list.map(movieCard).join('');
      if (status) {
        status.textContent = list.length ? '已匹配到相关影片，点击卡片进入详情。' : '没有找到匹配影片。';
      }
    }

    input.addEventListener('input', render);
    if (category) {
      category.addEventListener('change', render);
    }
    if (year) {
      year.addEventListener('change', render);
    }
    render();
  }

  function setupPlayer(source) {
    var video = select('#movieVideo');
    var overlay = select('#playOverlay');
    if (!video || !overlay || !source) {
      return;
    }

    var hls = null;
    var ready = false;

    function load() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      ready = true;
    }

    function play() {
      load();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupPlayer = setupPlayer;

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    initHero();
    initRails();
    initSearch();
  });
})();

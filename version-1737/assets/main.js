(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function text(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMenu() {
    var button = one('[data-menu-toggle]');
    var menu = one('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = one('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = all('[data-hero-slide]', slider);
    var dots = all('[data-hero-dot]', slider);
    var prev = one('[data-hero-prev]', slider);
    var next = one('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function initRails() {
    all('[data-scroll-target]').forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-scroll-target');
        var rail = document.getElementById(id);
        if (!rail) {
          return;
        }
        var dir = button.getAttribute('data-scroll-dir') === 'left' ? -1 : 1;
        rail.scrollBy({ left: dir * 420, behavior: 'smooth' });
      });
    });
  }

  function initLocalFilter() {
    var input = one('[data-local-search]');
    var cards = all('[data-card]');
    var chips = all('[data-filter-value]');
    var channel = 'all';
    if (!input && chips.length === 0) {
      return;
    }

    function apply() {
      var q = text(input ? input.value : '');
      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' '));
        var cardChannel = card.getAttribute('data-channel') || '';
        var matchText = !q || haystack.indexOf(q) > -1;
        var matchChannel = channel === 'all' || cardChannel === channel;
        card.classList.toggle('is-hidden-card', !(matchText && matchChannel));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        channel = chip.getAttribute('data-filter-value') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });
  }

  function cardHtml(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card" data-card>' +
        '<a href="./' + escapeHtml(item.file) + '" aria-label="' + escapeHtml(item.title) + '">' +
          '<div class="card-cover">' +
            '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="score-badge">★ ' + escapeHtml(item.rating) + '</span>' +
            '<span class="duration-badge">' + escapeHtml(item.duration) + '</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<h3>' + escapeHtml(item.title) + '</h3>' +
            '<p>' + escapeHtml(item.oneLine) + '</p>' +
            '<div class="card-meta">' +
              '<span>' + escapeHtml(item.year) + '</span>' +
              '<span>' + escapeHtml(item.region) + '</span>' +
              '<span>' + escapeHtml(item.type) + '</span>' +
            '</div>' +
            '<div class="tag-row">' + tags + '</div>' +
          '</div>' +
        '</a>' +
      '</article>';
  }

  function initSearchPage() {
    var results = one('#search-results');
    var items = window.siteSearchItems || [];
    if (!results || !items.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = one('[data-search-page-input]');
    var form = one('[data-search-page-form]');
    var title = one('[data-search-title]');
    var summary = one('[data-search-summary]');
    if (input) {
      input.value = query;
    }

    function render(value) {
      var q = text(value);
      var list;
      if (q) {
        list = items.filter(function (item) {
          return text([item.title, item.oneLine, item.region, item.type, item.year, (item.tags || []).join(' ')].join(' ')).indexOf(q) > -1;
        }).slice(0, 80);
        if (title) {
          title.textContent = '搜索结果';
        }
        if (summary) {
          summary.textContent = list.length ? '为你找到相关影片。' : '没有找到匹配影片，可以换一个关键词。';
        }
      } else {
        list = items.slice(0, 32);
        if (title) {
          title.textContent = '精选影片';
        }
        if (summary) {
          summary.textContent = '输入关键词或直接浏览推荐内容。';
        }
      }
      results.innerHTML = list.length ? list.map(cardHtml).join('') : '<div class="empty-state">暂无匹配影片</div>';
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : '';
        var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
        window.history.replaceState(null, '', nextUrl);
        render(value);
      });
    }
    render(query);
  }

  function initPlayer() {
    var shell = one('[data-player]');
    if (!shell) {
      return;
    }
    var video = one('video', shell);
    var startButton = one('.player-start', shell);
    if (!video) {
      return;
    }
    var streamUrl = video.getAttribute('data-stream');
    var initialized = false;
    var hlsInstance = null;

    function playVideo() {
      if (video.play) {
        video.play().catch(function () {});
      }
    }

    function attachWithHls() {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = streamUrl;
        playVideo();
      }
    }

    function begin() {
      if (!streamUrl) {
        return;
      }
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
      if (initialized) {
        playVideo();
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        playVideo();
      } else {
        attachWithHls();
      }
    }

    if (startButton) {
      startButton.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
      if (!initialized) {
        begin();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initRails();
    initLocalFilter();
    initSearchPage();
    initPlayer();
  });
})();

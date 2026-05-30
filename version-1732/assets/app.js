(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-error');
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    var restart = function () {
      window.clearInterval(timer);
      start();
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      start();
    }
  }

  var filterArea = document.querySelector('[data-filter-area]');

  if (filterArea) {
    var searchInput = filterArea.querySelector('[data-card-search]');
    var yearFilter = filterArea.querySelector('[data-year-filter]');
    var typeFilter = filterArea.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));

    var applyCardFilters = function () {
      var term = (searchInput && searchInput.value || '').trim().toLowerCase();
      var year = yearFilter && yearFilter.value || '';
      var type = typeFilter && typeFilter.value || '';

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var matchedText = !term || haystack.indexOf(term) !== -1;
        var matchedYear = !year || card.dataset.year === year;
        var matchedType = !type || haystack.indexOf(type.toLowerCase()) !== -1;
        card.style.display = matchedText && matchedYear && matchedType ? '' : 'none';
      });
    };

    [searchInput, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyCardFilters);
        control.addEventListener('change', applyCardFilters);
      }
    });
  }
})();

function initMoviePlayer(source) {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var cover = shell.querySelector('[data-play-cover]');
  var playButtons = Array.prototype.slice.call(shell.querySelectorAll('[data-play-toggle]'));
  var muteButton = shell.querySelector('[data-mute-toggle]');
  var fullscreenButton = shell.querySelector('[data-fullscreen-toggle]');
  var loaded = false;
  var hlsInstance = null;

  var attachSource = function () {
    if (loaded || !video) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    video.controls = true;
    loaded = true;
  };

  var updateButtons = function () {
    playButtons.forEach(function (button) {
      button.textContent = video.paused ? '▶' : '暂停';
    });
  };

  var playVideo = function () {
    attachSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };

  var togglePlay = function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  };

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('click', togglePlay);
  video.addEventListener('play', updateButtons);
  video.addEventListener('pause', updateButtons);
  video.addEventListener('ended', updateButtons);
  video.addEventListener('error', function () {
    shell.classList.add('is-error');
  });

  playButtons.forEach(function (button) {
    button.addEventListener('click', togglePlay);
  });

  if (muteButton) {
    muteButton.addEventListener('click', function () {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? '取消静音' : '声音';
    });
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (shell.requestFullscreen) {
        shell.requestFullscreen();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

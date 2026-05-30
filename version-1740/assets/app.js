
(function () {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function htmlEscape(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initMobileMenu() {
        var button = qs('[data-menu-toggle]');
        var menu = qs('[data-nav-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
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

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

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
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        restart();
    }

    function initScrollRows() {
        qsa('.scroll-shell').forEach(function (shell) {
            var row = qs('[data-scroll-row]', shell);
            var left = qs('[data-scroll-left]', shell);
            var right = qs('[data-scroll-right]', shell);
            if (!row) {
                return;
            }
            if (left) {
                left.addEventListener('click', function () {
                    row.scrollBy({ left: -420, behavior: 'smooth' });
                });
            }
            if (right) {
                right.addEventListener('click', function () {
                    row.scrollBy({ left: 420, behavior: 'smooth' });
                });
            }
        });
    }

    function initSearchPage() {
        var form = qs('[data-search-form]');
        var results = qs('[data-search-results]');
        var summary = qs('[data-search-summary]');
        var data = window.MOVIE_SEARCH_DATA || [];
        if (!form || !results || !summary) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var qInput = form.elements.q;
        var regionInput = form.elements.regionGroup;
        var typeInput = form.elements.type;
        var yearInput = form.elements.year;
        qInput.value = params.get('q') || '';
        regionInput.value = params.get('regionGroup') || '';
        typeInput.value = params.get('type') || '';
        yearInput.value = params.get('year') || '';

        function matchMovie(movie, query, region, type, year) {
            var text = [
                movie.title,
                movie.region,
                movie.regionGroup,
                movie.type,
                movie.year,
                movie.genre,
                movie.oneLine,
                (movie.tags || []).join(' '),
                (movie.genres || []).join(' ')
            ].join(' ').toLowerCase();
            var okQuery = !query || text.indexOf(query.toLowerCase()) !== -1;
            var okRegion = !region || movie.regionGroup === region;
            var okType = !type || movie.type === type;
            var okYear = !year || movie.year === year;
            return okQuery && okRegion && okType && okYear;
        }

        function card(movie) {
            return [
                '<a class="movie-card" href="' + htmlEscape(movie.url) + '">',
                '  <span class="poster-wrap">',
                '    <img src="' + htmlEscape(movie.cover) + '" alt="' + htmlEscape(movie.title) + '" loading="lazy">',
                '    <span class="poster-gradient"></span>',
                '    <span class="rating-badge">★ ' + Number(movie.rating).toFixed(1) + '</span>',
                '    <span class="meta-badge">' + htmlEscape(movie.year) + '</span>',
                '  </span>',
                '  <span class="movie-info">',
                '    <strong>' + htmlEscape(movie.title) + '</strong>',
                '    <small>' + htmlEscape(movie.region) + ' · ' + htmlEscape(movie.type) + '</small>',
                '    <em>' + htmlEscape(movie.oneLine) + '</em>',
                '  </span>',
                '</a>'
            ].join('');
        }

        function render() {
            var query = qInput.value.trim();
            var region = regionInput.value;
            var type = typeInput.value;
            var year = yearInput.value;
            var list = data.filter(function (movie) {
                return matchMovie(movie, query, region, type, year);
            });
            var capped = list.slice(0, 240);
            summary.textContent = '找到 ' + list.length + ' 部影片' + (list.length > capped.length ? '，当前显示前 ' + capped.length + ' 部' : '');
            results.innerHTML = capped.map(card).join('');

            var nextParams = new URLSearchParams();
            if (query) {
                nextParams.set('q', query);
            }
            if (region) {
                nextParams.set('regionGroup', region);
            }
            if (type) {
                nextParams.set('type', type);
            }
            if (year) {
                nextParams.set('year', year);
            }
            var nextUrl = window.location.pathname + (nextParams.toString() ? '?' + nextParams.toString() : '');
            window.history.replaceState(null, '', nextUrl);
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });
        [qInput, regionInput, typeInput, yearInput].forEach(function (field) {
            field.addEventListener('input', render);
            field.addEventListener('change', render);
        });
        render();
    }

    function initMoviePlayer() {
        var video = qs('#movie-video');
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-src');
        var overlay = qs('[data-play-overlay]');

        function attachSource() {
            if (!src) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                window.__movieHls = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else {
                video.src = src;
            }
        }

        function playVideo() {
            attachSourceOnce();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        var attached = false;
        function attachSourceOnce() {
            if (!attached) {
                attached = true;
                attachSource();
            }
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });
        video.addEventListener('click', function () {
            attachSourceOnce();
        });
        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }
        attachSourceOnce();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initScrollRows();
        initSearchPage();
        initMoviePlayer();
    });
}());

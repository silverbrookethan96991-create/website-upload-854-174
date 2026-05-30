(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-menu-panel]");
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
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
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
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var list = document.querySelector("[data-filter-list]");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
        function apply() {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
            });
        }
        input.addEventListener("input", apply);
        apply();
    }

    function setupSearchPage() {
        var input = document.querySelector("[data-search-page-input]");
        var list = document.querySelector("[data-filter-list]");
        var status = document.querySelector("[data-result-status]");
        if (!input || !list) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var count = 0;
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    count += 1;
                }
            });
            if (status) {
                status.textContent = keyword ? "找到 " + count + " 部相关影片" : "全部影片 " + count + " 部";
            }
        }
        input.addEventListener("input", apply);
        apply();
    }

    window.initMoviePlayer = function (source) {
        var wrap = document.querySelector("[data-player-wrap]");
        if (!wrap) {
            return;
        }
        var video = wrap.querySelector("video");
        var overlay = wrap.querySelector("[data-play-overlay]");
        var hls = null;
        var loaded = false;

        function loadSource() {
            if (loaded || !video) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hls) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        }
                    }
                });
            } else {
                video.src = source;
            }
            video.controls = true;
        }

        function begin() {
            loadSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", begin);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    begin();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();

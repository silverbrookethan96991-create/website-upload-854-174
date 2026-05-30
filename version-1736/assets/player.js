(function () {
  var attached = false;

  function attachSource(video, sourceUrl) {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.querySelector("[data-player-video]");
    var layer = document.querySelector("[data-player-layer]");

    if (!video || !layer || !sourceUrl) {
      return;
    }

    function play() {
      attachSource(video, sourceUrl);
      layer.classList.add("is-hidden");
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    layer.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };
})();

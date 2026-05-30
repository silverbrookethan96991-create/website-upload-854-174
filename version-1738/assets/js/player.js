(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function loadScript(src, callback) {
    var existing = document.querySelector('script[data-hls-loader="true"]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      existing.addEventListener('error', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    script.addEventListener('error', callback, { once: true });
    document.head.appendChild(script);
  }

  function attachSource(shell) {
    if (shell.classList.contains('is-loaded')) {
      var loadedVideo = shell.querySelector('video');
      if (loadedVideo) {
        loadedVideo.play().catch(function () {});
      }
      return;
    }

    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-video-url');

    if (!video || !source) {
      return;
    }

    function playVideo() {
      shell.classList.add('is-loaded');
      video.play().catch(function () {});
    }

    function useNative() {
      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
    }

    function useHls() {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            try {
              hls.destroy();
            } catch (error) {}
            useNative();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        useNative();
      } else {
        useNative();
      }
    }

    if (window.Hls || video.canPlayType('application/vnd.apple.mpegurl')) {
      useHls();
    } else {
      loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js', useHls);
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var button = shell.querySelector('[data-play-button]');
      if (button) {
        button.addEventListener('click', function () {
          attachSource(shell);
        });
      }
      shell.addEventListener('dblclick', function () {
        attachSource(shell);
      });
    });
  });
})();

(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="' + escapeHtml(movie.href) + '">',
      '  <article>',
      '    <div class="poster-frame">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <div class="poster-overlay"></div>',
      '      <span class="badge rating">★ ' + escapeHtml(movie.rating) + '</span>',
      '      <span class="badge duration">' + escapeHtml(movie.duration) + '</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <p class="card-meta">' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.year) + '</p>',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </article>',
      '</a>'
    ].join('\n');
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var input = document.getElementById('site-search-input');
    var results = document.getElementById('search-results');
    var count = document.getElementById('search-count');
    var data = window.MOVIE_SEARCH_DATA || [];
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var matched = data.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        var text = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 120);

      count.textContent = keyword ? '找到 ' + matched.length + ' 条相关影片（最多显示 120 条）' : '热门影片推荐';
      results.innerHTML = matched.map(movieCard).join('\n');
    }

    if (input) {
      input.value = initial;
      input.addEventListener('input', render);
      render();
    }
  });
})();

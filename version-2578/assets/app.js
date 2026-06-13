(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = $('.js-menu-toggle');
    var panel = $('.js-mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = $('.js-hero');
    if (!hero) {
      return;
    }
    var slides = $all('.hero-slide', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
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
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function createSearchItem(movie) {
    var item = document.createElement('a');
    item.className = 'search-result-item';
    item.href = movie.link;
    item.innerHTML = '<img src="' + movie.cover + '" alt="" onerror="this.classList.add(\'is-hidden\')">' +
      '<span><strong class="search-result-title">' + escapeHtml(movie.title) + '</strong>' +
      '<span class="search-result-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</span></span>';
    return item;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSiteSearch() {
    var data = window.MOVIE_INDEX || [];
    $all('.js-site-search').forEach(function (input) {
      var wrap = input.closest('.header-search');
      var results = wrap ? $('.js-search-results', wrap) : null;
      if (!results) {
        return;
      }
      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        results.innerHTML = '';
        if (!q) {
          results.classList.remove('is-open');
          return;
        }
        var matched = data.filter(function (movie) {
          return [movie.title, movie.region, movie.type, movie.genre, movie.year, movie.oneLine]
            .join(' ')
            .toLowerCase()
            .indexOf(q) !== -1;
        }).slice(0, 10);
        matched.forEach(function (movie) {
          results.appendChild(createSearchItem(movie));
        });
        if (!matched.length) {
          var empty = document.createElement('div');
          empty.className = 'search-result-item';
          empty.textContent = '暂未找到匹配影片';
          results.appendChild(empty);
        }
        results.classList.add('is-open');
      });
      document.addEventListener('click', function (event) {
        if (!wrap.contains(event.target)) {
          results.classList.remove('is-open');
        }
      });
    });
  }

  function initCardFilters() {
    $all('[data-filter-root]').forEach(function (root) {
      var search = $('.js-card-search', root);
      var selects = $all('.js-filter-select', root);
      var cards = $all('[data-title]', root);
      var empty = $('.js-empty-state', root);

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : '';
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute('data-filter')] = select.value;
        });
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre')
          ].join(' ').toLowerCase();
          var matchText = !query || text.indexOf(query) !== -1;
          var matchYear = !filters.year || card.getAttribute('data-year') === filters.year;
          var matchRegion = !filters.region || card.getAttribute('data-region') === filters.region;
          var matchType = !filters.type || card.getAttribute('data-type') === filters.type;
          var show = matchText && matchYear && matchRegion && matchType;
          card.classList.toggle('is-filter-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (search) {
        search.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSiteSearch();
    initCardFilters();
  });
})();

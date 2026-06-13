(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function go(step) {
      show(current + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        go(1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        go(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function applyFilters(scope) {
    var input = scope.querySelector(".js-filter-input");
    var type = scope.querySelector(".js-filter-type");
    var year = scope.querySelector(".js-filter-year");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var query = text(input && input.value).trim();
    var selectedType = type ? type.value : "";
    var selectedYear = year ? year.value : "";

    cards.forEach(function (card) {
      var haystack = text([
        card.dataset.title,
        card.dataset.type,
        card.dataset.year,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(" "));
      var okQuery = !query || haystack.indexOf(query) !== -1;
      var okType = !selectedType || card.dataset.type === selectedType;
      var okYear = !selectedYear || card.dataset.year === selectedYear;
      card.classList.toggle("is-hidden", !(okQuery && okType && okYear));
    });
  }

  function initFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
      var input = scope.querySelector(".js-filter-input");
      var type = scope.querySelector(".js-filter-type");
      var year = scope.querySelector(".js-filter-year");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      [input, type, year].forEach(function (field) {
        if (field) {
          field.addEventListener("input", function () {
            applyFilters(scope);
          });
          field.addEventListener("change", function () {
            applyFilters(scope);
          });
        }
      });
      applyFilters(scope);
    });
  }

  function initRanking() {
    var scope = document.querySelector("[data-ranking-scope]");
    if (!scope) {
      return;
    }
    var select = scope.querySelector(".js-rank-sort");
    var list = scope.querySelector(".rank-list");
    if (!select || !list) {
      return;
    }
    select.addEventListener("change", function () {
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-rank-card]"));
      var mode = select.value;
      cards.sort(function (a, b) {
        if (mode === "rating") {
          return Number(b.dataset.rating) - Number(a.dataset.rating) || Number(a.dataset.index) - Number(b.dataset.index);
        }
        if (mode === "views") {
          return Number(b.dataset.views) - Number(a.dataset.views) || Number(a.dataset.index) - Number(b.dataset.index);
        }
        var hotA = Number(a.dataset.rating) * 1000000 + Number(a.dataset.views);
        var hotB = Number(b.dataset.rating) * 1000000 + Number(b.dataset.views);
        return hotB - hotA || Number(a.dataset.index) - Number(b.dataset.index);
      });
      cards.forEach(function (card, index) {
        var number = card.querySelector(".rank-number");
        if (number) {
          number.textContent = String(index + 1).padStart(2, "0");
        }
        list.appendChild(card);
      });
    });
  }

  window.initMoviePlayer = function (mediaUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var errorBox = document.querySelector("[data-player-error]");
    if (!video || !overlay || !mediaUrl) {
      return;
    }
    var hls = null;
    var loaded = false;

    function showError() {
      if (errorBox) {
        errorBox.hidden = false;
      }
    }

    function hideError() {
      if (errorBox) {
        errorBox.hidden = true;
      }
    }

    function loadMedia() {
      if (loaded) {
        return;
      }
      loaded = true;
      hideError();
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else {
        video.src = mediaUrl;
      }
    }

    function play() {
      loadMedia();
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    overlay.addEventListener("click", function (event) {
      event.preventDefault();
      play();
    });

    video.addEventListener("click", toggle);
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      overlay.classList.remove("is-hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
    video.addEventListener("error", showError);
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initRanking();
  });
})();

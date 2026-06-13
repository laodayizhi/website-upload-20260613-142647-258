(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var value = Number(dot.getAttribute("data-hero-dot"));
        show(value);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    selectAll("[data-search-input]").forEach(function (input) {
      var targetSelector = input.getAttribute("data-search-target");
      var grid = targetSelector ? document.querySelector(targetSelector) : null;
      if (!grid) {
        return;
      }
      var cards = selectAll("[data-card]", grid);
      var clearButton = input.closest(".search-panel") ? input.closest(".search-panel").querySelector("[data-search-clear]") : null;

      function apply() {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var visible = !keyword || text.indexOf(keyword) !== -1;
          if (!visible) {
            card.classList.add("is-hidden");
          } else {
            card.classList.remove("is-hidden");
          }
        });
      }

      input.addEventListener("input", apply);
      if (clearButton) {
        clearButton.addEventListener("click", function () {
          input.value = "";
          apply();
          input.focus();
        });
      }
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
      apply();
    });
  }

  function setupFilters() {
    selectAll("[data-filter-group]").forEach(function (group) {
      var targetSelector = group.getAttribute("data-filter-group");
      var grid = document.querySelector(targetSelector);
      if (!grid) {
        return;
      }
      var buttons = selectAll("[data-filter-button]", group);
      var cards = selectAll("[data-card]", grid);
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-filter-button");
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          cards.forEach(function (card) {
            var match = value === "all" || card.getAttribute("data-category") === value;
            card.classList.toggle("is-hidden", !match);
          });
        });
      });
    });
  }

  window.initMoviePlayer = function (source) {
    var panel = document.querySelector("[data-player]");
    if (!panel) {
      return;
    }
    var video = panel.querySelector("video");
    var button = panel.querySelector("[data-play-button]");
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached || !video || !source) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!attached) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupFilters();
  });
})();

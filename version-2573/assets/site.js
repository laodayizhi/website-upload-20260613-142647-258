document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('is-menu-open', isOpen);
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        showSlide(0);

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    var filterBlocks = document.querySelectorAll('[data-filter-area]');

    filterBlocks.forEach(function (area) {
        var input = area.querySelector('[data-filter-input]');
        var selects = Array.prototype.slice.call(area.querySelectorAll('[data-filter-select]'));
        var cards = Array.prototype.slice.call(area.querySelectorAll('[data-card]'));
        var empty = area.querySelector('[data-empty-result]');
        var apply = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var matched = !keyword || haystack.indexOf(keyword) !== -1;

                selects.forEach(function (select) {
                    var field = select.getAttribute('data-field');
                    var value = select.value;
                    if (value && card.getAttribute(field) !== value) {
                        matched = false;
                    }
                });

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', shown === 0);
            }
        };

        if (input) {
            input.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) {
            input.value = query;
        }
        apply();
    });
});

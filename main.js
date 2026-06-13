    (function () {
        var nav        = document.getElementById('main-nav');
        var btn        = document.getElementById('buy-course-btn');
        var hamburger  = document.getElementById('nav-hamburger');
        var dropdown   = document.getElementById('nav-dropdown');
        var hero       = null;

        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            hamburger.classList.toggle('open');
            dropdown.classList.toggle('open');
        });

        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target)) {
                hamburger.classList.remove('open');
                dropdown.classList.remove('open');
            }
        });

        window.addEventListener('scroll', function () {
            var y = window.scrollY;

            if (y > 60) nav.classList.add('compact');
            else nav.classList.remove('compact');

            if (!hero) hero = document.getElementById('hero-section');
            if (hero) {
                if (y >= hero.offsetHeight * 0.75) {
                    btn.classList.add('visible');
                    nav.classList.add('glassy');
                } else {
                    btn.classList.remove('visible');
                    nav.classList.remove('glassy');
                }
            }
        }, { passive: true });
    })();

    function setCFATab(btn, price, period, desc) {
        document.querySelectorAll('.cfa-tab').forEach(function(t) {
            t.classList.remove('active', 'bg-white', 'text-p-dark', 'shadow-sm');
            t.classList.add('text-p-gray');
        });
        btn.classList.add('active', 'bg-white', 'text-p-dark', 'shadow-sm');
        btn.classList.remove('text-p-gray');
        document.getElementById('cfa-price').textContent = price;
        document.getElementById('cfa-period').textContent = period;
        if (desc) {
            var parts = desc.split('|');
            document.getElementById('cfa-desc').innerHTML = parts[0] + (parts[1] ? '<br><span style="font-size:12px;color:#4d7a4d;font-weight:500;">' + parts[1] + '</span>' : '');
        }
    }

        // Animate testimonial cards column by column, left to right
        (function () {
            var triggered = false;
            var grid = document.querySelector('.grid.grid-cols-4');
            if (!grid) return;

            var colObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !triggered) {
                        triggered = true;
                        colObserver.disconnect();

                        var children = Array.from(grid.children);
                        var columns = [[], [], [], []];
                        children.forEach(function (child, i) {
                            var colIdx = i % 4;
                            var cards = child.classList.contains('testimonial-card')
                                ? [child]
                                : Array.from(child.querySelectorAll('.testimonial-card'));
                            columns[colIdx] = columns[colIdx].concat(cards);
                        });

                        columns.forEach(function (cards, colIdx) {
                            setTimeout(function () {
                                cards.forEach(function (card, rowIdx) {
                                    setTimeout(function () {
                                        card.classList.add('visible');
                                    }, rowIdx * 40);
                                });
                            }, colIdx * 80);
                        });
                    }
                });
            }, { threshold: 0.1 });

            colObserver.observe(grid);
        })();

        // Scroll-speed motion blur on cards
        var lastScrollY = window.scrollY;
        var blurTimeout;
        window.addEventListener('scroll', function () {
            var speed = Math.abs(window.scrollY - lastScrollY);
            lastScrollY = window.scrollY;
            var blur = Math.min(speed * 0.05, 2);
            document.querySelectorAll('.testimonial-card.visible').forEach(function (card) {
                card.style.filter = 'blur(' + blur + 'px)';
            });
            clearTimeout(blurTimeout);
            blurTimeout = setTimeout(function () {
                document.querySelectorAll('.testimonial-card.visible').forEach(function (card) {
                    card.style.filter = 'blur(0px)';
                });
            }, 80);
        }, { passive: true });

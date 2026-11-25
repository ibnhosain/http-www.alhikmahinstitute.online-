// ছবি ও ভিডিও — হোমের স্লাইডার ([data-slider]) আর গ্যালারি পাতা ([data-gallery]), বড় করে দেখার lightbox।
// তালিকা assets/data/gallery.json থেকে (নতুন ছবি দিলে শুধু ঐ ফাইলে যোগ); featured = স্লাইডারে।
// পুরনো ফোনেও চলে (var/function, কোনো library নেই)।
(function () {
  var ICONS = 'assets/img/icons.svg#';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function icon(name) {
    return '<svg class="icon" aria-hidden="true"><use href="' + ICONS + name + '" /></svg>';
  }
  function fileName(item) {
    var ext = item.type === 'video' ? '.mp4' : '.jpg';
    return 'al-hikmah-' + item.id + ext;
  }
  var digits = '০১২৩৪৫৬৭৮৯';
  function bn(n) {
    return String(n).replace(/[0-9]/g, function (d) {
      return digits[d];
    });
  }

  // ---------- বড় করে দেখা (lightbox) ----------
  var box = null;
  var boxItems = [];
  var boxIndex = 0;
  var lastFocus = null;

  function buildBox() {
    box = el('div', 'lightbox');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'ছবি বড় করে দেখা');
    box.innerHTML =
      '<button class="lb-close" type="button" aria-label="বন্ধ করুন">' +
      icon('i-close') +
      '</button>' +
      '<button class="lb-nav lb-prev" type="button" aria-label="আগের ছবি">' +
      icon('i-arrow') +
      '</button>' +
      '<figure class="lb-figure"><div class="lb-media"></div><figcaption class="lb-cap"></figcaption></figure>' +
      '<button class="lb-nav lb-next" type="button" aria-label="পরের ছবি">' +
      icon('i-arrow') +
      '</button>';
    document.body.appendChild(box);
    box.querySelector('.lb-close').addEventListener('click', closeBox);
    box.querySelector('.lb-prev').addEventListener('click', function () {
      showBox(boxIndex - 1);
    });
    box.querySelector('.lb-next').addEventListener('click', function () {
      showBox(boxIndex + 1);
    });
    box.addEventListener('click', function (e) {
      if (e.target === box) closeBox();
    });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') closeBox();
      if (e.key === 'ArrowLeft') showBox(boxIndex - 1);
      if (e.key === 'ArrowRight') showBox(boxIndex + 1);
    });
  }

  function showBox(i) {
    var n = boxItems.length;
    boxIndex = (i + n) % n;
    var item = boxItems[boxIndex];
    var media = box.querySelector('.lb-media');
    media.innerHTML =
      item.type === 'video'
        ? '<video src="' + esc(item.src) + '" poster="' + esc(item.poster) + '" controls autoplay playsinline preload="metadata"></video>'
        : '<img src="' + esc(item.src) + '" alt="' + esc(item.title) + '" />';
    box.querySelector('.lb-cap').innerHTML =
      '<div><strong>' +
      esc(item.title) +
      '</strong><span>' +
      esc(item.caption) +
      ' · ' +
      bn(boxIndex + 1) +
      '/' +
      bn(n) +
      '</span></div>' +
      '<a class="btn btn-gold" href="' +
      esc(item.download) +
      '" download="' +
      fileName(item) +
      '">' +
      icon('i-file') +
      'ডাউনলোড</a>';
    var single = n < 2;
    box.querySelector('.lb-prev').hidden = single;
    box.querySelector('.lb-next').hidden = single;
  }

  function openBox(items, i) {
    if (!box) buildBox();
    boxItems = items;
    lastFocus = document.activeElement;
    showBox(i);
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  }

  function closeBox() {
    box.classList.remove('open');
    box.querySelector('.lb-media').innerHTML = ''; // ভিডিও থামে
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  // ---------- স্লাইডার ----------
  function slideHtml(item, eager) {
    var img =
      item.type === 'video'
        ? '<img src="' + esc(item.poster) + '" alt="' + esc(item.title) + '"' + (eager ? '' : ' loading="lazy"') + ' />'
        : '<img src="' +
          esc(item.src) +
          '" srcset="' +
          esc(item.thumb) +
          ' 640w, ' +
          esc(item.src) +
          ' 1600w" sizes="(max-width: 720px) 100vw, 1180px" alt="' +
          esc(item.title) +
          '"' +
          (eager ? '' : ' loading="lazy"') +
          ' />';
    var play =
      item.type === 'video'
        ? '<button class="slide-play" type="button" aria-label="ভিডিও চালান: ' + esc(item.title) + '">' + '<span class="play-icon" aria-hidden="true"></span></button>'
        : '';
    return (
      img +
      play +
      '<figcaption>' +
      (item.type === 'video' ? '<span class="slide-tag">ভিডিও</span>' : '') +
      '<strong>' +
      esc(item.title) +
      '</strong><span>' +
      esc(item.caption) +
      '</span></figcaption>'
    );
  }

  function initSlider(root, items) {
    var slides = items.filter(function (it) {
      return it.featured;
    });
    if (slides.length === 0) return;
    var track = root.querySelector('.slider-track');
    track.innerHTML = '';
    var nodes = slides.map(function (item, i) {
      var f = el('figure', 'slide' + (i === 0 ? ' is-active' : ''), slideHtml(item, i === 0));
      f.setAttribute('role', 'group');
      f.setAttribute('aria-roledescription', 'slide');
      f.setAttribute('aria-label', bn(i + 1) + '/' + bn(slides.length));
      if (i !== 0) f.setAttribute('aria-hidden', 'true');
      track.appendChild(f);
      var btn = f.querySelector('.slide-play');
      if (btn) {
        btn.addEventListener('click', function () {
          stop();
          var v = el('video', 'slide-video');
          v.src = item.src;
          v.poster = item.poster;
          v.controls = true;
          v.autoplay = true;
          v.setAttribute('playsinline', '');
          f.insertBefore(v, f.firstChild);
          f.classList.add('playing');
          v.addEventListener('ended', function () {
            v.remove();
            f.classList.remove('playing');
            start();
          });
        });
      }
      // ছবিতে চাপ দিলে বড় করে
      var img = f.querySelector('img');
      if (item.type === 'photo') {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function () {
          openBox(slides, i);
        });
      }
      return f;
    });

    var ctrl = el('div', 'slider-ctrl');
    var prev = el('button', 'slider-btn', icon('i-arrow'));
    prev.type = 'button';
    prev.setAttribute('aria-label', 'আগের স্লাইড');
    prev.classList.add('prev');
    var next = el('button', 'slider-btn', icon('i-arrow'));
    next.type = 'button';
    next.setAttribute('aria-label', 'পরের স্লাইড');
    var dots = el('div', 'slider-dots');
    var dotBtns = slides.map(function (_, i) {
      var d = el('button', 'slider-dot' + (i === 0 ? ' active' : ''));
      d.type = 'button';
      d.setAttribute('aria-label', 'স্লাইড ' + bn(i + 1));
      d.addEventListener('click', function () {
        go(i, true);
      });
      dots.appendChild(d);
      return d;
    });
    ctrl.appendChild(prev);
    ctrl.appendChild(dots);
    ctrl.appendChild(next);
    root.appendChild(ctrl);

    var current = 0;
    var timer = null;
    function go(i, user) {
      var old = nodes[current];
      var v = old.querySelector('video');
      if (v) {
        v.pause();
        v.remove();
        old.classList.remove('playing');
      }
      old.classList.remove('is-active');
      old.setAttribute('aria-hidden', 'true');
      dotBtns[current].classList.remove('active');
      current = (i + nodes.length) % nodes.length;
      nodes[current].classList.add('is-active');
      nodes[current].removeAttribute('aria-hidden');
      dotBtns[current].classList.add('active');
      if (user) start();
    }
    function start() {
      stop();
      if (!reduceMotion && nodes.length > 1) {
        timer = setInterval(function () {
          go(current + 1);
        }, 6000);
      }
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    prev.addEventListener('click', function () {
      go(current - 1, true);
    });
    next.addEventListener('click', function () {
      go(current + 1, true);
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', function () {
      if (!nodes[current].classList.contains('playing')) start();
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(current - 1, true);
      if (e.key === 'ArrowRight') go(current + 1, true);
    });
    // আঙুলে টেনে সরানো
    var x0 = null;
    track.addEventListener(
      'touchstart',
      function (e) {
        x0 = e.touches[0].clientX;
      },
      { passive: true },
    );
    track.addEventListener(
      'touchend',
      function (e) {
        if (x0 == null) return;
        var dx = e.changedTouches[0].clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1), true);
      },
      { passive: true },
    );
    // অন্য ট্যাবে গেলে থামে
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (!nodes[current].classList.contains('playing')) start();
    });
    root.setAttribute('tabindex', '0');
    root.classList.add('ready');
    start();
  }

  // ---------- গ্যালারি পাতা ----------
  function initGallery(root, items) {
    var grid = root.querySelector('.gallery-grid');
    var chips = root.querySelectorAll('[data-filter]');
    var count = root.querySelector('[data-count]');
    var filter = 'all';

    function render() {
      var shown = items.filter(function (it) {
        return filter === 'all' || it.type === filter;
      });
      grid.innerHTML = '';
      shown.forEach(function (item, i) {
        var card = el('article', 'gallery-card reveal in');
        card.innerHTML =
          '<button class="gallery-thumb" type="button" aria-label="বড় করে দেখুন: ' +
          esc(item.title) +
          '">' +
          '<img src="' +
          esc(item.thumb) +
          '" alt="' +
          esc(item.title) +
          '" loading="lazy" />' +
          (item.type === 'video' ? '<span class="play-icon" aria-hidden="true"></span><span class="slide-tag">ভিডিও</span>' : '') +
          '</button>' +
          '<div class="gallery-info"><div><strong>' +
          esc(item.title) +
          '</strong><span>' +
          esc(item.caption) +
          '</span></div>' +
          '<a class="gallery-dl" href="' +
          esc(item.download) +
          '" download="' +
          fileName(item) +
          '" aria-label="ডাউনলোড: ' +
          esc(item.title) +
          '">' +
          icon('i-file') +
          '<span>ডাউনলোড</span></a></div>';
        card.querySelector('.gallery-thumb').addEventListener('click', function () {
          openBox(shown, i);
        });
        grid.appendChild(card);
      });
      if (count) count.textContent = bn(shown.length) + 'টি';
    }
    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener('click', function () {
        filter = chip.getAttribute('data-filter');
        Array.prototype.forEach.call(chips, function (c) {
          c.classList.toggle('active', c === chip);
          c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
        });
        render();
      });
    });
    render();
  }

  var slider = document.querySelector('[data-slider]');
  var gallery = document.querySelector('[data-gallery]');
  if (!slider && !gallery) return;
  fetch('assets/data/gallery.json', { cache: 'no-cache' })
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (slider) initSlider(slider, data.items);
      if (gallery) initGallery(gallery, data.items);
    })
    .catch(function () {
      if (gallery) gallery.querySelector('.gallery-grid').innerHTML = '<p class="muted">ছবি আনা যায়নি — একটু পরে আবার চেষ্টা করুন।</p>';
    });
})();

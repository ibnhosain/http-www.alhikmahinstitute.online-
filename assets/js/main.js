// আল-হিকমাহ্ ইনস্টিটিউট — ওয়েবসাইটের ছোট কাজগুলো: ফোনের মেনু, মেনুর ছায়া, ধীরে ভেসে ওঠা, ফুটারের সাল।
// কোনো library নেই; পুরনো ফোনেও চলে (IntersectionObserver না থাকলে সব সাথে সাথে দেখায়)।
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  var backdrop = null;

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন');
    var use = toggle.querySelector('use');
    if (use) use.setAttribute('href', 'assets/img/icons.svg#' + (open ? 'i-close' : 'i-menu'));
    if (open && !backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      backdrop.addEventListener('click', function () {
        setMenu(false);
      });
      document.body.appendChild(backdrop);
    } else if (!open && backdrop) {
      backdrop.remove();
      backdrop = null;
    }
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('open'));
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  // মেনুর নিচে ছায়া — পাতা একটু নামলে; ফোনের ভাসমান কল/WhatsApp বোতাম — হিরো পার হলে
  var header = document.querySelector('.site-header');
  var floating = document.querySelector('.float-actions');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    if (floating) floating.classList.toggle('show', window.scrollY > 520);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ধীরে ভেসে ওঠা
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  } else {
    items.forEach(function (el) {
      el.classList.add('in');
    });
  }

  // ফুটারের সাল — বাংলা অঙ্কে
  var digits = '০১২৩৪৫৬৭৮৯';
  var year = String(new Date().getFullYear()).replace(/[0-9]/g, function (d) {
    return digits[d];
  });
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = year;
  });
})();

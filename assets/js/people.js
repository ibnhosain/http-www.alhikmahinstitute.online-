/* শিক্ষক ও পরিচালকদের কার্ডে চাপ দিলে বড় কার্ড — ছবি, পদবি, দায়িত্ব, আর কল · WhatsApp · Facebook (Owner-এর অনুরোধ ২০২৬-১১-২৫)।
   তথ্য পাতার শেষের <script id="people-data"> থেকে (tools/build.py বানায়; নম্বর শুধু Owner-এর Excel-এ দেওয়া থাকলে)।
   পুরনো ফোনের কথা মাথায় রেখে সাধারণ JavaScript — <dialog> নয়। */
(function () {
  'use strict';
  var holder = document.getElementById('people-data');
  if (!holder) return;
  var people;
  try {
    people = JSON.parse(holder.textContent);
  } catch (e) {
    return;
  }

  var OFFICE = '01713960909';
  var BN = '০১২৩৪৫৬৭৮৯';
  var bn = function (s) {
    return String(s).replace(/\d/g, function (d) {
      return BN[d];
    });
  };
  // 01713960909 → ০১৭১৩-৯৬০৯০৯
  var showPhone = function (p) {
    return /^01\d{9}$/.test(p) ? bn(p.slice(0, 5) + '-' + p.slice(5)) : p;
  };
  var telLink = function (p) {
    return 'tel:' + (/^0\d{10}$/.test(p) ? '+88' + p : p);
  };
  var waLink = function (p, name) {
    var digits = /^0\d{10}$/.test(p) ? '88' + p : p.replace(/\D/g, '');
    return 'https://wa.me/' + digits + '?text=' + encodeURIComponent('আসসালামু আলাইকুম, ' + name + '।');
  };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function button(href, cls, icon, label, external) {
    var a = el('a', 'btn ' + cls);
    a.href = href;
    if (external) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    a.innerHTML = '<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#' + icon + '" /></svg>';
    a.appendChild(document.createTextNode(label));
    return a;
  }

  // একবারই বানানো
  var overlay = el('div', 'pmodal');
  overlay.hidden = true;
  var card = el('div', 'pmodal-card');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  card.setAttribute('aria-labelledby', 'pmodal-name');
  var closeBtn = el('button', 'pmodal-close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'বন্ধ করুন');
  closeBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#i-close" /></svg>';
  var body = el('div', 'pmodal-body');
  card.appendChild(closeBtn);
  card.appendChild(body);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  var lastFocus = null;

  function open(id) {
    var p = people[id];
    if (!p) return;
    body.innerHTML = '';
    var av = el('div', 'pmodal-avatar');
    if (p.photo) {
      var img = el('img');
      img.src = p.photo;
      img.alt = p.name;
      av.appendChild(img);
    } else {
      av.appendChild(el('span', null, p.initials));
      av.setAttribute('aria-hidden', 'true');
    }
    body.appendChild(av);
    var name = el('h3', null, p.name);
    name.id = 'pmodal-name';
    body.appendChild(name);
    body.appendChild(el('p', 'pmodal-role', p.role));
    if (p.duty && p.duty.length) {
      var box = el('div', 'pmodal-duty');
      box.appendChild(el('strong', null, 'দায়িত্ব'));
      var ul = el('ul');
      for (var i = 0; i < p.duty.length; i++) ul.appendChild(el('li', null, p.duty[i]));
      box.appendChild(ul);
      body.appendChild(box);
    }
    var actions = el('div', 'pmodal-actions');
    if (p.phone) actions.appendChild(button(telLink(p.phone), 'btn-royal', 'i-phone', 'কল করুন · ' + showPhone(p.phone)));
    if (p.whatsapp) actions.appendChild(button(waLink(p.whatsapp, p.name), 'btn-green', 'i-whatsapp', 'WhatsApp-এ মেসেজ', true));
    if (p.facebook) actions.appendChild(button(p.facebook, 'btn-facebook', 'i-facebook', 'Facebook', true));
    if (!actions.childNodes.length) {
      body.appendChild(el('p', 'pmodal-note', 'সরাসরি যোগাযোগের নম্বর দেওয়া নেই — প্রতিষ্ঠানের অফিসে যোগাযোগ করুন।'));
      actions.appendChild(button(telLink(OFFICE), 'btn-outline', 'i-phone', 'অফিসে কল · ' + showPhone(OFFICE)));
    }
    body.appendChild(actions);
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.documentElement.classList.add('pmodal-open');
    closeBtn.focus();
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.documentElement.classList.remove('pmodal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function cardOf(target) {
    while (target && target !== document) {
      if (target.getAttribute && target.getAttribute('data-person')) return target;
      target = target.parentNode;
    }
    return null;
  }

  document.addEventListener('click', function (e) {
    var c = cardOf(e.target);
    if (c) open(c.getAttribute('data-person'));
  });
  document.addEventListener('keydown', function (e) {
    var key = e.key || e.keyCode;
    if (key === 'Escape' || key === 'Esc' || key === 27) return close();
    if ((key === 'Enter' || key === ' ' || key === 13 || key === 32) && cardOf(document.activeElement) === document.activeElement) {
      e.preventDefault();
      open(document.activeElement.getAttribute('data-person'));
    }
  });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
})();

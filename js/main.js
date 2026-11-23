// Логика сайта: переключатель языков + поиск по вопросам FAQ.
// Данные всех языков лежат в js/i18n.js (window.I18N), английский контент
// вшит в HTML как защищённая от отсутствия JS версия по умолчанию.
(function () {
  'use strict';

  var select = document.getElementById('lang-select');
  var q = document.getElementById('q');
  var none = document.getElementById('none');

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html; // строки приходят из проверенных JSON (валидатор тегов)
    return e;
  }

  // Пересобирает блок вопросов из данных выбранного языка
  function renderFaq(d) {
    var faq = document.getElementById('faq');
    faq.innerHTML = '';
    d.qa.forEach(function (item) {
      var det = el('details');
      var sum = el('summary');
      sum.appendChild(document.createTextNode(item.q));
      sum.appendChild(el('span', 'chev', '\u25BE'));
      det.appendChild(sum);
      det.appendChild(el('div', 'answer', item.a));
      faq.appendChild(det);
    });
  }

  function renderCards(d) {
    var box = document.getElementById('cards');
    box.innerHTML = '';
    d.cards.forEach(function (c) {
      var card = el('div', 'card');
      var h = el('h3');
      var num = el('span', 'num', c.title.replace(/^([^.]+\.)\s*/, '$1 '));
      h.appendChild(num);
      h.appendChild(document.createTextNode(c.title.replace(/^[^.]+\.\s*/, '')));
      card.appendChild(h);
      card.appendChild(el('p', '', c.text));
      box.appendChild(card);
    });
  }

  function apply(code) {
    var d = (window.I18N || {})[code];
    if (!d) return;
    document.documentElement.lang = d.html_lang || code;
    document.title = d.title;
    document.getElementById('t-h1').textContent = d.h1;
    document.getElementById('t-sub').textContent = d.subtitle;
    document.getElementById('t-banner-title').innerHTML = d.banner_title;
    var ul = document.getElementById('banner-list');
    ul.innerHTML = '';
    d.banner_items.forEach(function (item) { ul.appendChild(el('li', '', item)); });
    document.getElementById('t-search-label').textContent = d.search_label;
    q.placeholder = d.search_placeholder;
    renderFaq(d);
    none.textContent = d.none_found;
    document.getElementById('t-checklist').textContent = d.checklist_title;
    renderCards(d);
    document.getElementById('t-disclaimer').innerHTML = d.disclaimer;
    document.getElementById('t-flabel-guides').textContent = d.footer_guides_label;
    document.getElementById('t-flabel-tracker').textContent = d.footer_tracker_label;
    document.getElementById('t-flabel-official').textContent = d.footer_official_label;
    bindFilter();
  }

  // Поиск по открытым вопросам (перезапускается после каждой смены языка)
  function bindFilter() {
    var items = Array.prototype.slice.call(document.querySelectorAll('#faq details'));
    var value = (q.value || '').trim().toLowerCase();
    var visible = 0;
    items.forEach(function (det) {
      var hit = !value || det.textContent.toLowerCase().indexOf(value) !== -1;
      det.hidden = !hit;
      if (hit) visible++;
    });
    none.style.display = visible ? 'none' : 'block';
  }

  // Наполняем селект языками из данных (сначала очищаем статичные опции)
  var order = ['en', 'es', 'pt-BR', 'de', 'fr', 'it', 'tr', 'pl', 'ja', 'ko', 'zh-CN'];
  select.innerHTML = '';
  order.forEach(function (code) {
    var d = (window.I18N || {})[code];
    if (!d) return;
    var opt = document.createElement('option');
    opt.value = code;
    opt.textContent = d.name;
    select.appendChild(opt);
  });

  select.addEventListener('change', function () {
    localStorage.setItem('fw-lang', select.value);
    apply(select.value);
  });

  q.addEventListener('input', bindFilter);

  var saved = null;
  try { saved = localStorage.getItem('fw-lang'); } catch (e) { /* приватный режим */ }
  if (saved && saved !== 'en' && (window.I18N || {})[saved]) {
    select.value = saved;
    apply(saved);
  }
})();

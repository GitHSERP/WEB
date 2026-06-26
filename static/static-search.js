/*
 * Site-wide search results page for the static mirror.
 *
 * The WordPress search box on every page submits (GET, name="s") to the root
 * index.html. This script runs there: it loads the prebuilt search-index.json
 * and renders the matches in place of the homepage content, with its own search
 * box at the top that filters the list live as you type — no page reloads, no
 * suggestion dropdown.
 *
 * Loaded only on the root index.html. Regenerate the index with
 * `node static/build-search-index.js` whenever pages change.
 */
(function () {
  'use strict';

  if (window.__staticSearchReady) return;
  window.__staticSearchReady = true;

  var DEBOUNCE_MS = 120;
  var MAX_RESULTS = 100;

  // Resolve the mirror root from this script's own src so the index JSON and
  // result links resolve correctly.
  var self = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();
  var base = (self && self.getAttribute('src') || '').replace(/static\/static-search\.js.*$/, '');

  function getParam(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function parseTerms(query) {
    return query.toLowerCase().split(/\s+/).filter(Boolean);
  }

  function isNewsRecord(rec) {
    return /^pages\/\d{4}\/\d{2}\/\d{2}\//.test(rec.url || '');
  }

  function recordGroup(rec) {
    if (isNewsRecord(rec)) return 1;
    if ((rec.url || '') === 'index.html') return 2;
    return 0;
  }

  function recordNewsDate(rec) {
    var m = /^pages\/(\d{4})\/(\d{2})\/(\d{2})\//.exec(rec.url || '');
    if (!m) return 0;
    return Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  }

  function scoreRec(rec, terms) {
    var hayTitle = (rec.title || '').toLowerCase();
    var hayText = (rec.text || '').toLowerCase();
    var s = 0;
    for (var i = 0; i < terms.length; i += 1) {
      var t = terms[i];
      var inTitle = hayTitle.indexOf(t) !== -1;
      if (inTitle) s += 10;
      var idx = hayText.indexOf(t);
      if (idx === -1 && !inTitle) return -1; // every term must appear somewhere
      while (idx !== -1) { s += 1; idx = hayText.indexOf(t, idx + 1); }
    }
    return s;
  }

  function search(records, query) {
    var terms = parseTerms(query);
    if (!terms.length) return [];
    var out = [];
    for (var i = 0; i < records.length; i += 1) {
      var s = scoreRec(records[i], terms);
      if (s > 0) out.push({ rec: records[i], score: s });
    }
    // Keep product/info pages ahead of news. News items are sorted newest-first.
    out.sort(function (a, b) {
      var ag = recordGroup(a.rec);
      var bg = recordGroup(b.rec);
      if (ag !== bg) return ag - bg;

      if (ag === 1) {
        var ad = recordNewsDate(a.rec);
        var bd = recordNewsDate(b.rec);
        if (ad !== bd) return bd - ad;
      }

      if (a.score !== b.score) return b.score - a.score;

      var at = a.rec.title || a.rec.url || '';
      var bt = b.rec.title || b.rec.url || '';
      return at < bt ? -1 : (at > bt ? 1 : 0);
    });
    return out;
  }

  function highlight(text, terms) {
    var html = escapeHtml(text);
    terms.forEach(function (t) {
      html = html.replace(new RegExp('(' + escapeRegExp(escapeHtml(t)) + ')', 'gi'), '<mark>$1</mark>');
    });
    return html;
  }

  function snippet(text, terms) {
    var lower = text.toLowerCase();
    var pos = -1;
    for (var i = 0; i < terms.length; i += 1) {
      var p = lower.indexOf(terms[i]);
      if (p !== -1 && (pos === -1 || p < pos)) pos = p;
    }
    if (pos === -1) pos = 0;
    var start = Math.max(0, pos - 30);
    var frag = text.slice(start, start + 140);
    var html = escapeHtml((start > 0 ? '…' : '') + frag + (start + 140 < text.length ? '…' : ''));
    terms.forEach(function (t) {
      html = html.replace(new RegExp('(' + escapeRegExp(escapeHtml(t)) + ')', 'gi'), '<mark>$1</mark>');
    });
    return html;
  }

  function loadIndex() {
    // 'no-cache' forces the browser to revalidate with the server so a rebuilt
    // search-index.json is never served stale from the HTTP cache.
    return fetch(base + 'search-index.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function renderList(output, records, query) {
    var terms = parseTerms(query);
    output.innerHTML = '';

    var heading = document.createElement('p');
    heading.className = 'static-search-heading';

    if (!query) {
      heading.textContent = '請輸入關鍵字開始搜尋';
      output.appendChild(heading);
      return;
    }

    var results = search(records, query);
    heading.innerHTML = '符合「' + escapeHtml(query) + '」 <small>' + results.length + ' 筆</small>';
    output.appendChild(heading);

    if (!results.length) {
      var empty = document.createElement('p');
      empty.className = 'static-search-empty';
      empty.textContent = '找不到符合的內容，請嘗試其他關鍵字。';
      output.appendChild(empty);
      return;
    }

    var list = document.createElement('ul');
    list.className = 'static-search-list';
    results.slice(0, MAX_RESULTS).forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = base + item.rec.url;
      a.className = 'static-search-link';
      a.innerHTML = highlight(item.rec.title || item.rec.url, terms);
      li.appendChild(a);
      if (item.rec.text) {
        var p = document.createElement('p');
        p.className = 'static-search-snippet';
        p.innerHTML = snippet(item.rec.text, terms);
        li.appendChild(p);
      }
      list.appendChild(li);
    });
    output.appendChild(list);
  }

  function build(records, initialQuery) {
    var panel = document.createElement('main');
    panel.className = 'static-search-results';
    panel.id = 'static-search-results';

    var form = document.createElement('form');
    form.className = 'static-search-bar';
    form.setAttribute('role', 'search');
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'static-search-input';
    input.value = initialQuery;
    input.setAttribute('placeholder', '輸入關鍵字即時篩選…');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('aria-label', '搜尋全站');
    form.appendChild(input);
    panel.appendChild(form);

    var output = document.createElement('div');
    output.className = 'static-search-output';
    panel.appendChild(output);

    var composing = false;
    var debounce = null;

    function update() {
      var q = input.value.trim();
      renderList(output, records, q);
      // Keep the address bar and the header boxes in sync (shareable / refresh-safe).
      var url = location.pathname + (q ? '?s=' + encodeURIComponent(q) : '');
      history.replaceState(null, '', url);
      Array.prototype.forEach.call(document.querySelectorAll('input.search-field'), function (f) {
        f.value = q;
      });
    }

    function schedule() {
      if (composing) return;
      clearTimeout(debounce);
      debounce = setTimeout(update, DEBOUNCE_MS);
    }

    input.addEventListener('compositionstart', function () { composing = true; });
    input.addEventListener('compositionend', function () { composing = false; schedule(); });
    input.addEventListener('input', schedule);

    renderList(output, records, initialQuery);

    return { panel: panel, input: input };
  }

  function init() {
    var query = getParam('s').trim();
    if (!query && !/[?&]s=/.test(location.search)) return; // only act as a results page

    function place(node) {
      var header = document.querySelector('header.site-header, #masthead, header');
      if (header && header.parentNode) header.parentNode.insertBefore(node, header.nextSibling);
      else document.body.insertBefore(node, document.body.firstChild);
    }

    loadIndex().then(function (records) {
      ['banner-section', 'acc-content', 'primary'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      Array.prototype.forEach.call(
        document.querySelectorAll('.banner, .site-content, #content article'),
        function (el) { el.style.display = 'none'; }
      );
      var ui = build(records, query);
      place(ui.panel);
      ui.input.focus();
      // Place caret at the end so the user can keep typing/refining.
      try { ui.input.setSelectionRange(query.length, query.length); } catch (e) {}
    }).catch(function () {
      var panel = document.createElement('main');
      panel.className = 'static-search-results';
      panel.innerHTML = '<p class="static-search-empty">搜尋索引載入失敗，請確認已透過網頁伺服器開啟（而非直接以檔案路徑開啟）。</p>';
      place(panel);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

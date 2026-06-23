(function () {
  var sourceNav = document.querySelector('[data-static-nav="true"]');
  var sourceMenu = sourceNav && sourceNav.querySelector('#mega-menu-primary');
  var toggle = document.querySelector('[data-static-menu-toggle="true"]');
  if (!sourceNav || !sourceMenu || !toggle) return;

  function cleanText(node) {
    return (node && node.textContent ? node.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function directAnchor(item) {
    for (var i = 0; i < item.children.length; i += 1) {
      if (item.children[i].tagName && item.children[i].tagName.toLowerCase() === 'a') {
        return item.children[i];
      }
    }
    return null;
  }

  function makeLink(anchor, className, labelPrefix) {
    var href = anchor.getAttribute('href');
    var label = cleanText(anchor);
    if (!href || !label) return null;

    var link = document.createElement('a');
    link.className = className;
    link.href = href;
    link.textContent = labelPrefix ? labelPrefix + label : label;
    return link;
  }

  function collectLinks(root, skipAnchor) {
    var links = [];
    var seen = {};
    Array.prototype.forEach.call(root.querySelectorAll('a'), function (anchor) {
      if (anchor === skipAnchor) return;
      var href = anchor.getAttribute('href');
      var label = cleanText(anchor);
      if (!href || !label || href === '#') return;
      var key = label + '|' + href;
      if (seen[key]) return;
      seen[key] = true;
      links.push({ href: href, label: label });
    });
    return links;
  }

  function homeHref() {
    var original = document.querySelector('.custom-logo-link');
    return original ? original.getAttribute('href') || 'index.html' : 'index.html';
  }

  function cloneBrand(className) {
    var original = document.querySelector('.custom-logo-link');
    var brand = document.createElement('a');
    brand.className = className;
    brand.href = homeHref();

    var img = original && original.querySelector('img');
    if (img) {
      var cloned = img.cloneNode(false);
      cloned.removeAttribute('width');
      cloned.removeAttribute('height');
      brand.appendChild(cloned);
    } else {
      brand.textContent = document.title || '\u9996\u9801';
    }
    return brand;
  }

  function buildSearchForm() {
    // Clone the header search form so mobile users can search too. Its action
    // already points at the mirror root from this page, so submission works.
    var source = document.querySelector('form.searchform');
    if (!source) return null;
    var form = source.cloneNode(true);
    form.classList.add('static-mobile-search');
    // Drop the duplicate name/id so document.mn_searchform still resolves to a
    // single element; the button submits natively (type="submit") regardless.
    form.removeAttribute('name');
    form.removeAttribute('id');
    var button = form.querySelector('button');
    if (button) button.removeAttribute('onclick');
    var field = form.querySelector('.search-field');
    if (field) {
      field.setAttribute('placeholder', '搜尋全站');
      field.removeAttribute('id');
    }
    return form;
  }

  function buildMenuList() {
    var list = document.createElement('div');
    list.className = 'static-mobile-list';

    var search = buildSearchForm();
    if (search) list.appendChild(search);

    var home = document.createElement('a');
    home.className = 'static-mobile-home';
    home.href = homeHref();
    home.textContent = '\u9996\u9801';
    list.appendChild(home);

    Array.prototype.forEach.call(sourceMenu.children, function (item) {
      if (!item.tagName || item.tagName.toLowerCase() !== 'li') return;

      var anchor = directAnchor(item);
      if (!anchor) return;

      var title = cleanText(anchor);
      if (!title) return;

      var sublinks = collectLinks(item, anchor);
      if (!sublinks.length) {
        var direct = makeLink(anchor, 'static-mobile-link');
        if (direct) list.appendChild(direct);
        return;
      }

      var section = document.createElement('details');
      section.className = 'static-mobile-section';

      var summary = document.createElement('summary');
      var summaryText = document.createElement('span');
      var summaryCount = document.createElement('small');
      summaryText.textContent = title;
      summaryCount.textContent = sublinks.length + ' \u9805';
      summary.appendChild(summaryText);
      summary.appendChild(summaryCount);
      section.appendChild(summary);

      var parent = makeLink(anchor, 'static-mobile-parent', '\u524d\u5f80\uff1a');
      if (parent) section.appendChild(parent);

      var sublist = document.createElement('div');
      sublist.className = 'static-mobile-sublist';
      sublinks.forEach(function (entry) {
        var link = document.createElement('a');
        link.href = entry.href;
        link.textContent = entry.label;
        sublist.appendChild(link);
      });
      section.appendChild(sublist);
      list.appendChild(section);
    });

    return list;
  }

  var bar = document.createElement('div');
  bar.className = 'static-mobile-bar';
  bar.appendChild(cloneBrand('static-mobile-brand'));
  bar.appendChild(toggle);
  document.body.insertBefore(bar, document.body.firstChild);

  var panel = document.createElement('section');
  panel.className = 'static-mobile-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('aria-label', '\u7db2\u7ad9\u9078\u55ae');

  var panelHeader = document.createElement('div');
  panelHeader.className = 'static-mobile-panel-header';
  panelHeader.appendChild(cloneBrand('static-mobile-panel-brand'));

  var closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'static-mobile-close';
  closeButton.textContent = '\u95dc\u9589';
  closeButton.setAttribute('aria-label', '\u95dc\u9589\u9078\u55ae');
  panelHeader.appendChild(closeButton);

  var title = document.createElement('div');
  title.className = 'static-mobile-title';
  title.textContent = '\u7db2\u7ad9\u9078\u55ae';

  panel.appendChild(panelHeader);
  panel.appendChild(title);
  panel.appendChild(buildMenuList());
  document.body.appendChild(panel);

  toggle.classList.add('static-mobile-toggle');
  toggle.textContent = '\u9078\u55ae';
  toggle.setAttribute('aria-label', '\u958b\u555f\u9078\u55ae');
  toggle.setAttribute('aria-controls', 'static-mobile-panel');
  toggle.setAttribute('aria-expanded', 'false');
  panel.id = 'static-mobile-panel';

  sourceNav.setAttribute('aria-hidden', 'true');
  document.body.classList.add('static-nav-ready');

  function setOpen(open) {
    document.body.classList.toggle('static-nav-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '\u95dc\u9589' : '\u9078\u55ae';
    if (open) {
      closeButton.focus();
    }
  }

  toggle.addEventListener('click', function () {
    setOpen(!document.body.classList.contains('static-nav-open'));
  });

  closeButton.addEventListener('click', function () {
    setOpen(false);
    toggle.focus();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setOpen(false);
  });
})();

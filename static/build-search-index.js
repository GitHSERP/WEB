#!/usr/bin/env node
/*
 * Builds search-index.json for the static mirror's site-wide search.
 * Scans every pages/**\/index.html (plus the root index.html) and extracts
 * a title + plain-text body from the page's main <article> region so the
 * client-side search in static-search.js can match against real content
 * instead of the repeated nav/header/footer boilerplate.
 *
 * Usage: node static/build-search-index.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'search-index.json');

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    } else if (entry.isFile() && entry.name.toLowerCase() === 'index.html') {
      acc.push(full);
    }
  }
  return acc;
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      try { return String.fromCodePoint(parseInt(n, 10)); } catch (e) { return ' '; }
    });
}

function stripTags(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    const t = stripTags(h1[1]);
    if (t) return t;
  }
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) {
    // Drop the trailing site name (" – 奇勝資訊" / " | 奇勝資訊" / " - 奇勝資訊").
    return stripTags(title[1]).replace(/\s*[–|\-]\s*奇勝資訊\s*$/, '').trim() || stripTags(title[1]);
  }
  return '';
}

function extractBody(html) {
  function clean(region) {
    return stripTags(region);
  }

  // Prefer the main <article> region; if it is effectively empty, fall back to
  // #acc-content. Some top-level landing pages render their real content there
  // while the article wrapper only carries structure.
  const articleStart = html.search(/<article[\s>]/i);
  if (articleStart !== -1) {
    const articleEnd = html.lastIndexOf('</article>');
    if (articleEnd > articleStart) {
      const body = clean(html.slice(articleStart, articleEnd));
      if (body) return body;
    }
  }

  const accStart = html.search(/<div[^>]*id="acc-content"/i);
  if (accStart !== -1) {
    const footerStart = html.indexOf('<footer', accStart);
    const body = clean(html.slice(accStart, footerStart === -1 ? undefined : footerStart));
    if (body) return body;
  }

  return clean(html);
}

// Only index real content: WordPress single posts and pages. Skip everything
// whose <body> class marks it as a non-article so search results stay clean:
//   attachment       -> image/file pages (title is just the file name)
//   archive/blog/home -> category, tag, news and homepage listings (these only
//                        repeat other posts' titles)
//   login/search/404  -> system pages
const SKIP_BODY_CLASS = /\b(attachment|archive|blog|home|login|search(?!-)|error404|paged)\b/;

function bodyClass(html) {
  const m = html.match(/<body[^>]*class="([^"]*)"/i);
  return m ? m[1] : '';
}

const files = walk(path.join(ROOT, 'pages'), []);
files.unshift(path.join(ROOT, 'index.html'));

const records = [];
let skipped = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const url = path.relative(ROOT, file).split(path.sep).join('/');
  if (SKIP_BODY_CLASS.test(bodyClass(html))) { skipped += 1; continue; }
  const body = extractBody(html);
  if (!body) { skipped += 1; continue; }
  const title = extractTitle(html) || url;
  records.push({ url, title, text: body.slice(0, 4000) });
}

fs.writeFileSync(OUT, JSON.stringify(records), 'utf8');
console.log(`Indexed ${records.length} pages (skipped ${skipped}) -> ${path.relative(ROOT, OUT)}`);

#!/usr/bin/env node
/* Génère le site publié à partir des contenus enregistrés par le CMS. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const esc = (value) => String(value == null ? '' : value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const rich = (value) => esc(value).replace(/&lt;(\/?)(em|strong)&gt;/g, '<$1$2>');
const slugify = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const tel = (value) => String(value || '').replace(/[^0-9+]/g, '');
const safeUrl = (value) => {
  const url = String(value || '').trim();
  return /^(https?:|mailto:|tel:|[^:]+$)/i.test(url) ? esc(url) : '#';
};

const site = readJson('site.json');
const home = readJson('homepage.json');
const gallery = readJson('gallery.json');
const worksData = readJson('works.json');
const artistsData = readJson('artists.json');
const atelier = readJson('atelier.json');
const customisation = readJson('customisation.json');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.readdirSync(root).forEach((entry) => {
  if (['.git', 'dist', 'node_modules'].includes(entry)) return;
  fs.cpSync(path.join(root, entry), path.join(out, entry), { recursive: true });
});

function replaceInner(html, id, content) {
  return html.replace(new RegExp('(<[^>]+id="' + id + '"[^>]*>)[\\s\\S]*?(</[^>]+>)'), '$1' + content + '$2');
}
function replaceMount(html, id, content) {
  return html.replace(new RegExp('<div id="' + id + '"[^>]*>[\\s\\S]*?</div>'), '<div id="' + id + '">' + content + '</div>');
}
function removeDataScripts(html) {
  return html.replace(/\s*<script src="(?:site|home|gallery|works|artists|editorial-page)\.js"><\/script>/g, '');
}
function decorateShell(html) {
  const words = String(site.name || '').trim().split(/\s+/);
  const finalWord = words.pop() || '';
  const brand = esc(words.join(' ')) + (words.length ? ' ' : '') + '<span>' + esc(finalWord) + '</span>';
  const place = [site.name, site.location].filter(Boolean).join(' · ');
  return html
    .replace(/<a class="brand" href="index\.html">[\s\S]*?<\/a>/g, '<a class="brand" href="index.html">' + brand + '</a>')
    .replace(/<span data-site-location>[\s\S]*?<\/span>/g, '<span data-site-location>' + esc(place) + '</span>')
    .replace(/<a data-site-phone href="[^"]*">[\s\S]*?<\/a>/g, '<a data-site-phone href="tel:' + esc(tel(site.phone)) + '">' + esc(site.phone) + '</a>');
}
function write(name, html) {
  fs.writeFileSync(path.join(out, name), removeDataScripts(decorateShell(html)));
}
function source(name) { return fs.readFileSync(path.join(root, name), 'utf8'); }

function workDetails(work) {
  return [work.medium, work.dimensions, work.year, work.price, work.availability].filter(Boolean);
}
function renderWorks() {
  return (worksData.series || []).map((series) => {
    const works = series.works || [];
    if (!works.length) return '';
    const media = [...new Set(works.map((work) => String(work.medium || '').split(' sur ')[0].trim()).filter(Boolean))].join(', ');
    const cards = works.map((work) => {
      const details = workDetails(work);
      return '<figure class="work zoom" tabindex="0" role="button" data-title="' + esc(work.title) +
        '" data-artist="' + esc(work.artist) + '" data-meta="' + esc(details.join(' · ')) +
        '" data-desc="' + esc(work.description) + '"><div class="work-img"><img loading="lazy" src="' +
        esc(work.image) + '" alt="' + esc(work.title) + (work.alt ? ' — ' + esc(work.alt) : '') +
        '"/></div><figcaption class="work-txt"><h3>' + esc(work.title) + '</h3><p class="meta">' +
        esc([work.artist].concat(details).filter(Boolean).join(' · ')) + '</p></figcaption></figure>';
    }).join('');
    return '<div class="serie rv" id="' + esc(slugify(series.name)) + '"><div class="serie-bar"><h2>' +
      esc(series.name) + '</h2><span class="count">' + works.length + (works.length > 1 ? ' toiles' : ' toile') +
      (media ? ' · ' + esc(media) : '') + '</span></div><div class="grid' +
      (works.length === 2 ? ' pair' : '') + '">' + cards + '</div></div>';
  }).join('');
}
function renderFeatured() {
  const artist = (artistsData.artists || [])[0];
  const cards = (worksData.series || []).filter((series) => (series.works || []).length).map((series) => {
    const works = series.works;
    const work = works[0];
    const media = [...new Set(works.map((item) => String(item.medium || '').split(' sur ')[0].trim()).filter(Boolean))];
    const summary = works.length + (works.length > 1 ? ' toiles' : ' toile') + (media.length ? ' · ' + media.join(', ') : '');
    return '<a class="work" href="oeuvres.html#' + esc(slugify(series.name)) + '" style="text-decoration:none"><div class="work-img"><img loading="lazy" src="' +
      esc(work.image) + '" alt="' + esc(work.alt || work.title) + '"/></div><div class="work-txt"><h3>' +
      esc(series.name) + '</h3><p class="meta">' + esc(summary) + '</p></div></a>';
  }).join('');
  if (!artist) return '';
  return '<div class="section-head rv"><h2>' + esc(home.featured_label || 'À l\'affiche') + ' · ' + esc(artist.name) +
    '</h2>' + (artist.intro ? '<p class="lead">' + esc(artist.intro) + '</p>' : '') +
    '</div><div class="grid rv">' + cards + '</div><div class="cta-row rv"><a class="btn" href="' +
    esc(slugify(artist.name)) + '.html">Découvrir ' + esc(artist.name) + '</a></div>';
}
function renderGallery() {
  const sections = (gallery.sections || []).map((section) => '<div class="serie rv"><div class="serie-bar"><h2>' +
    esc(section.title) + '</h2></div>' + (section.text ? '<p class="prose">' + esc(section.text) + '</p>' : '') +
    (section.button_label ? '<div class="cta-row"><a class="btn" href="' + safeUrl(section.button_url) + '">' + esc(section.button_label) +
    '</a></div>' : '') + '</div>').join('');
  const place = [site.location, site.country].filter(Boolean).join(' — ');
  const lines = (site.phone ? '<a class="line" href="tel:' + esc(tel(site.phone)) + '"><span class="line-label">Téléphone</span>' + esc(site.phone) + '</a>' : '') +
    (site.whatsapp ? '<a class="line" href="https://wa.me/' + esc(String(site.whatsapp).replace(/\D/g, '')) + '"><span class="line-label">WhatsApp</span>' + esc(gallery.whatsapp_label) + '</a>' : '') +
    (site.email ? '<a class="line" href="mailto:' + esc(site.email) + '"><span class="line-label">Email</span>' + esc(site.email) + '</a>' : '');
  return '<section class="page-head"><div class="wrap">' + (gallery.eyebrow ? '<p class="eyebrow">' + esc(gallery.eyebrow) + '</p>' : '') +
    '<h1>' + esc(gallery.title) + '</h1>' + (gallery.intro ? '<p class="lead">' + esc(gallery.intro) + '</p>' : '') +
    '</div></section><section class="section"><div class="wrap">' + sections + '</div></section><section class="section contact"><div class="wrap"><h2>' +
    esc(gallery.contact_title) + '</h2><p>' + esc(place) + (place && gallery.contact_text ? '. ' : '') + esc(gallery.contact_text) +
    '</p><div class="lines">' + lines + '</div></div></section>';
}
function renderEditorial(page) {
  const sections = (page.sections || []).map((section) => {
    const visual = section.image ? '<figure class="content-visual rv"><img loading="lazy" src="' + esc(section.image) +
      '" alt="' + esc(section.image_alt || section.title) + '"/>' + (section.caption ? '<figcaption>' + esc(section.caption) + '</figcaption>' : '') + '</figure>' : '';
    return '<article class="content-block' + (section.image ? ' has-image' : '') + '"><div class="content-copy rv"><h2>' + esc(section.title) +
      '</h2>' + (section.text ? '<p>' + esc(section.text) + '</p>' : '') + '</div>' + visual + '</article>';
  }).join('');
  const galleryItems = (page.gallery || []).filter((item) => item.image).map((item) => '<figure class="work rv"><div class="work-img"><img loading="lazy" src="' +
    esc(item.image) + '" alt="' + esc(item.alt || item.caption || '') + '"/></div>' + (item.caption ? '<figcaption>' + esc(item.caption) + '</figcaption>' : '') + '</figure>').join('');
  const galleryHtml = galleryItems ? '<div class="editorial-gallery"><div class="grid">' + galleryItems + '</div></div>' : '';
  const cta = page.cta_title || page.cta_text || page.cta_label ? '<div class="editorial-cta rv">' +
    (page.cta_title ? '<h2>' + esc(page.cta_title) + '</h2>' : '') + (page.cta_text ? '<p>' + esc(page.cta_text) + '</p>' : '') +
    (page.cta_label ? '<div class="cta-row"><a class="btn" href="' + safeUrl(page.cta_url) + '">' + esc(page.cta_label) + '</a></div>' : '') + '</div>' : '';
  return '<section class="page-head"><div class="wrap">' + (page.eyebrow ? '<p class="eyebrow">' + esc(page.eyebrow) + '</p>' : '') +
    '<h1>' + esc(page.title) + '</h1>' + (page.intro ? '<p class="lead">' + esc(page.intro) + '</p>' : '') +
    '</div></section><section class="section"><div class="wrap"><div class="content-blocks">' + sections + '</div>' + galleryHtml + cta + '</div></section>';
}
function renderArtistsList() {
  return '<div class="grid rv">' + (artistsData.artists || []).map((artist) => '<a class="work" href="' + esc(slugify(artist.name)) +
    '.html" style="text-decoration:none"><div class="work-img"><img loading="lazy" src="' + esc(artist.portrait) +
    '" alt="' + esc(artist.portrait_alt || artist.name) + '"/></div><div class="work-txt"><h3>' + esc(artist.name) +
    '</h3><p class="meta">' + esc(artist.discipline || artist.role) + '</p></div></a>').join('') + '</div>';
}
function renderArtistDetail(artist) {
  if (!artist) return '<div class="wrap"><p class="prose">Cet artiste est introuvable.</p></div>';
  const exhibitions = (artist.exhibitions || []).filter((entry) => (entry.items || []).length).map((entry) => '<div class="expo-year rv"><h3>' + esc(entry.year) +
    '</h3><ul class="expo-list">' + entry.items.map((item) => '<li>' + esc(item) + '</li>').join('') + '</ul></div>').join('');
  const contactLines = (artist.phone ? '<a class="line" href="tel:' + esc(tel(artist.phone)) + '"><span class="line-label">Téléphone</span>' + esc(artist.phone) +
    '</a><a class="line" href="https://wa.me/' + esc(tel(artist.phone).replace('+', '')) + '"><span class="line-label">WhatsApp</span>Écrire à ' + esc(artist.name.split(' ')[0]) + '</a>' : '') +
    (artist.email ? '<a class="line" href="mailto:' + esc(artist.email) + '"><span class="line-label">Email</span>' + esc(artist.email) + '</a>' : '');
  return '<section class="page-head"><div class="wrap"><p class="eyebrow">' + esc(artist.role) + '</p><h1>' + esc(artist.name) + '</h1>' +
    (artist.intro ? '<p class="lead">' + rich(artist.intro) + '</p>' : '') + (artist.highlight_tag || artist.highlight_text ? '<div class="badge rv">' +
    (artist.highlight_tag ? '<span class="badge-tag">' + esc(artist.highlight_tag) + '</span>' : '') + (artist.highlight_text ? '<p>' + rich(artist.highlight_text) + '</p>' : '') + '</div>' : '') +
    '</div></section><section class="section bio"><div class="wrap bio-grid">' + (artist.portrait ? '<figure class="portrait rv"><img src="' + esc(artist.portrait) +
    '" alt="' + esc(artist.portrait_alt || artist.name) + '"/>' + (artist.portrait_credit ? '<figcaption>' + esc(artist.portrait_credit) + '</figcaption>' : '') + '</figure>' : '') +
    '<div class="rv"><h2>' + esc(artist.statement_title || 'Note d\'intention') + '</h2>' + (artist.statement ? '<p>' + rich(artist.statement) + '</p>' : '') +
    '<div class="cta-row"><a class="btn" href="oeuvres.html">Voir les œuvres</a></div></div></div></section>' + (exhibitions ? '<section class="section"><div class="wrap"><div class="section-head rv"><h2>Expositions &amp; participations</h2></div>' + exhibitions + '</div></section>' : '') +
    (contactLines ? '<section class="section contact"><div class="wrap"><h2>Contact</h2><p>' + (artist.location ? esc(artist.location) + '. ' : '') + 'Pour une visite, une acquisition ou un projet d’exposition.</p><div class="lines">' + contactLines + '</div></div></section>' : '');
}

let index = source('index.html');
index = index.replace(/<img id="home-hero-image"[^>]*>/, '<img id="home-hero-image" src="' + esc(home.hero_image) + '" alt="' + esc(home.hero_alt || '') + '"/>');
index = replaceInner(index, 'home-eyebrow', esc(home.eyebrow));
index = index.replace(/(<h1 id="home-title">)[\s\S]*?(<\/h1>)/, '$1' + esc(home.title) + (home.title_emphasis ? '<br/><em>' + esc(home.title_emphasis) + '</em>' : '') + '$2');
index = replaceInner(index, 'home-intro', esc(home.intro));
index = index.replace(/(<a class="btn" id="home-primary" href=")[^"]*(">)[\s\S]*?<\/a>/, '$1' + safeUrl(home.primary_url) + '$2' + esc(home.primary_label) + '</a>');
index = index.replace(/(<a class="btn ghost" id="home-secondary" href=")[^"]*(">)[\s\S]*?<\/a>/, '$1' + safeUrl(home.secondary_url) + '$2' + esc(home.secondary_label) + '</a>');
index = replaceInner(index, 'home-meeting-title', esc(home.meeting_title));
index = replaceInner(index, 'home-meeting-text', esc(home.meeting_text));
index = index.replace(/(<a class="btn ghost" id="home-meeting-button" href=")[^"]*(">)[\s\S]*?<\/a>/, '$1' + safeUrl(home.meeting_url) + '$2' + esc(home.meeting_label) + '</a>');
index = replaceMount(index, 'home-featured', renderFeatured());
write('index.html', index);

let works = source('oeuvres.html');
works = replaceInner(works, 'works-eyebrow', esc(worksData.eyebrow));
works = replaceInner(works, 'works-title', esc(worksData.page_title));
works = replaceInner(works, 'works-intro', esc(worksData.page_intro));
works = replaceInner(works, 'works-contact-title', esc(worksData.contact_title));
works = replaceInner(works, 'works-contact-text', esc(worksData.contact_text));
works = replaceMount(works, 'works', renderWorks());
write('oeuvres.html', works);

let artists = source('artistes.html');
artists = replaceInner(artists, 'artists-eyebrow', esc(artistsData.eyebrow));
artists = replaceInner(artists, 'artists-title', esc(artistsData.page_title));
artists = replaceInner(artists, 'artists-intro', esc(artistsData.page_intro));
artists = replaceMount(artists, 'artists', renderArtistsList());
write('artistes.html', artists);

let artistPage = source('nalla-thioye.html');
artistPage = artistPage.replace(/<div id="artist"[^>]*><\/div>/, '<div id="artist" data-slug="nalla-thioye">' + renderArtistDetail((artistsData.artists || []).find((artist) => slugify(artist.name) === 'nalla-thioye')) + '</div>');
write('nalla-thioye.html', artistPage);

let galleryPage = source('galerie.html');
galleryPage = galleryPage.replace(/<main id="gallery-page"><\/main>/, '<main id="gallery-page">' + renderGallery() + '</main>');
write('galerie.html', galleryPage);

let atelierPage = source('atelier.html');
atelierPage = replaceMount(atelierPage, 'editorial-page', renderEditorial(atelier));
write('atelier.html', atelierPage);
let customisationPage = source('customisation.html');
customisationPage = replaceMount(customisationPage, 'editorial-page', renderEditorial(customisation));
write('customisation.html', customisationPage);

console.log('Site statique généré dans dist/.');

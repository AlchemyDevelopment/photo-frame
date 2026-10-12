// Lumina Photo Frame — lightweight engine for low-end frames
var FEED_URL = 'https://script.google.com/macros/s/AKfycbzmE0GDAimVinYOgt3ZIOLoI-VUZyT4T01U0W5V4HNLwem287-SRX86YrqSQ4BHArW5/exec';
var SLIDE_SECONDS = 12;
var POLL_MINUTES = 5;
var RELOAD_HOURS = 6;          // occasional clean reload to clear WebView memory
var CACHE_KEY = 'lumina-feed';

// Ask Google for images sized to the screen instead of full-res originals
var W = Math.round(screen.width * (window.devicePixelRatio || 1));
var H = Math.round(screen.height * (window.devicePixelRatio || 1));
function sized(url) { return url + '=w' + W + '-h' + H; }
function thumb(url) { return url + '=w32-h32'; }

var photos = [];
var index = 0;
var front = document.getElementById('photo-a');
var back = document.getElementById('photo-b');
var ambient = document.getElementById('ambient');
var timer = null;
var preloaded = null;

function shuffle(list) {
  for (var i = list.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = list[i]; list[i] = list[j]; list[j] = t;
  }
  return list;
}

function parseFeed(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.photos)) return data.photos;
  return [];
}

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || []; } catch (e) { return []; }
}

function saveCache(list) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(list)); } catch (e) {}
}

function setPhotos(list) {
  var wasEmpty = photos.length === 0;
  photos = shuffle(list.slice());
  index = 0;
  if (wasEmpty) show();
}

function fetchFeed() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', FEED_URL);
  xhr.timeout = 30000;
  xhr.onload = function () {
    if (xhr.status !== 200) return;
    var list;
    try { list = parseFeed(JSON.parse(xhr.responseText)); } catch (e) { return; }
    if (!list.length) return;
    var changed = JSON.stringify(list.slice().sort()) !== JSON.stringify(loadCache().slice().sort());
    saveCache(list);
    if (changed || photos.length === 0) setPhotos(list);
  };
  xhr.send();
}

function preload(url) {
  var img = new Image();
  img.src = url;
  return img;
}

function show() {
  if (!photos.length) return;
  var url = photos[index];
  var full = sized(url);
  var img = (preloaded && preloaded.src === full) ? preloaded : preload(full);

  var done = false;
  function onReady() {
    if (done) return;
    done = true;
    back.style.backgroundImage = 'url("' + full + '")';
    ambient.style.backgroundImage = 'url("' + thumb(url) + '")';
    back.className = 'layer photo active';
    front.className = 'layer photo';
    var t = front; front = back; back = t;

    index = (index + 1) % photos.length;
    preloaded = photos.length > 1 ? preload(sized(photos[index])) : null;
    preload(thumb(photos[index]));
    schedule(SLIDE_SECONDS * 1000);
  }

  function onError() {
    preloaded = null;
    index = (index + 1) % photos.length;
    schedule(2000);
  }

  if (img.complete) {
    if (img.naturalWidth) onReady(); else onError();
  } else {
    img.onload = onReady;
    img.onerror = onError;
  }
}

function schedule(ms) {
  clearTimeout(timer);
  timer = setTimeout(show, ms);
}

// Start instantly from cache, refresh feed in background
var cached = loadCache();
if (cached.length) setPhotos(cached);
fetchFeed();
setInterval(fetchFeed, POLL_MINUTES * 60 * 1000);
setTimeout(function () { location.reload(); }, RELOAD_HOURS * 60 * 60 * 1000);

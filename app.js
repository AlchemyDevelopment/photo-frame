// Lumina Pure Photo Frame Engine
const DEFAULT_FEED_URL = 'https://script.google.com/macros/s/AKfycbzmE0GDAimVinYOgt3ZIOLoI-VUZyT4T01U0W5V4HNLwem287-SRX86YrqSQ4BHArW5/exec';
const SLIDE_INTERVAL_SECONDS = 12;

class PhotoFrame {
  constructor() {
    this.photos = [];
    this.currentIndex = 0;
    this.activeLayer = 'a';
    this.kenBurnsState = true;
    this.timer = null;
    this.pollTimer = null;

    // DOM Elements
    this.layerA = document.getElementById('photo-layer-a');
    this.layerB = document.getElementById('photo-layer-b');
    this.ambientLayer = document.getElementById('ambient-layer');

    this.init();
  }

  async init() {
    await this.fetchPhotos();

    if (this.photos.length > 0) {
      this.showNextPhoto(true);
    }

    // Auto-poll every 5 minutes for new photos in Drive
    this.pollTimer = setInterval(() => {
      this.fetchPhotos(true);
    }, 5 * 60 * 1000);
  }

  async fetchPhotos(isBackground = false) {
    try {
      const res = await fetch(DEFAULT_FEED_URL);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      let remoteList = [];
      if (Array.isArray(data)) {
        remoteList = data;
      } else if (typeof data === 'string' && data.startsWith('http')) {
        remoteList = [data];
      } else if (data && data.photos && Array.isArray(data.photos)) {
        remoteList = data.photos;
      }

      if (remoteList.length > 0) {
        const wasEmpty = this.photos.length === 0;
        this.photos = remoteList;

        if (wasEmpty) {
          this.showNextPhoto(true);
        }
      }
    } catch (err) {
      console.warn('Feed fetch error:', err);
    }
  }

  showNextPhoto(isFirst = false) {
    if (this.photos.length === 0) return;

    const url = this.photos[this.currentIndex];
    const incomingLayer = this.activeLayer === 'a' ? this.layerB : this.layerA;
    const outgoingLayer = this.activeLayer === 'a' ? this.layerA : this.layerB;

    // Preload image
    const img = new Image();
    img.src = url;
    img.onload = () => {
      // Set background images
      incomingLayer.style.backgroundImage = `url("${url}")`;
      this.ambientLayer.style.backgroundImage = `url("${url}")`;

      // Apply Ken Burns animation
      incomingLayer.className = 'photo-layer';
      const anim = this.kenBurnsState ? 'kenburns-zoom-in' : 'kenburns-zoom-out';
      incomingLayer.classList.add(anim);
      this.kenBurnsState = !this.kenBurnsState;

      // Cross-fade
      incomingLayer.classList.add('active');
      if (!isFirst) {
        outgoingLayer.classList.remove('active');
      }

      this.activeLayer = this.activeLayer === 'a' ? 'b' : 'a';

      // Advance index
      this.currentIndex = (this.currentIndex + 1) % this.photos.length;

      // Schedule next slide
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.showNextPhoto(), SLIDE_INTERVAL_SECONDS * 1000);
    };

    img.onerror = () => {
      console.warn('Skipping unreadable photo:', url);
      this.currentIndex = (this.currentIndex + 1) % this.photos.length;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.showNextPhoto(), 2000);
    };
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new PhotoFrame();
});

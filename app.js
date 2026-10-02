// Lumina Photo Frame Engine
const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80'
];

const DEFAULT_FEED_URL = 'https://script.google.com/macros/s/AKfycbzmE0GDAimVinYOgt3ZIOLoI-VUZyT4T01U0W5V4HNLwem287-SRX86YrqSQ4BHArW5/exec';

class PhotoFrame {
  constructor() {
    this.photos = [...DEFAULT_PHOTOS];
    this.currentIndex = 0;
    this.activeLayer = 'a';
    this.kenBurnsState = true;
    this.timer = null;
    this.pollTimer = null;

    // Load Settings
    this.settings = {
      feedUrl: localStorage.getItem('lumina_feed_url') || DEFAULT_FEED_URL,
      interval: parseInt(localStorage.getItem('lumina_interval') || '12', 10),
      kenBurns: localStorage.getItem('lumina_kenburns') !== 'false',
      showClock: localStorage.getItem('lumina_clock') !== 'false',
      shuffle: localStorage.getItem('lumina_shuffle') !== 'false',
    };

    // DOM Elements
    this.layerA = document.getElementById('photo-layer-a');
    this.layerB = document.getElementById('photo-layer-b');
    this.ambientLayer = document.getElementById('ambient-layer');
    this.timeDisplay = document.getElementById('time-display');
    this.dateDisplay = document.getElementById('date-display');
    this.clockWidget = document.getElementById('clock-widget');
    this.photoCounter = document.getElementById('photo-counter');

    // Settings UI
    this.settingsModal = document.getElementById('settings-modal');
    this.settingsToggle = document.getElementById('settings-toggle');
    this.closeSettingsBtn = document.getElementById('close-settings');
    this.saveSettingsBtn = document.getElementById('save-settings-btn');
    this.feedUrlInput = document.getElementById('feed-url');
    this.intervalInput = document.getElementById('interval-input');
    this.kenburnsToggle = document.getElementById('kenburns-toggle');
    this.clockToggle = document.getElementById('clock-toggle');
    this.shuffleToggle = document.getElementById('shuffle-toggle');

    this.init();
  }

  async init() {
    this.initClock();
    this.initSettingsUI();
    this.applySettings();

    // Fetch photos from Google Drive feed if configured
    if (this.settings.feedUrl) {
      await this.fetchRemotePhotos();
    } else {
      if (this.settings.shuffle) {
        this.shufflePhotos();
      }
    }

    // Start slideshow
    this.showNextPhoto(true);

    // Background poll every 5 minutes for new photos in Drive
    this.pollTimer = setInterval(() => {
      if (this.settings.feedUrl) {
        this.fetchRemotePhotos(true);
      }
    }, 5 * 60 * 1000);
  }

  initClock() {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;

      this.timeDisplay.textContent = `${hours}:${minutes} ${ampm}`;

      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      this.dateDisplay.textContent = now.toLocaleDateString(undefined, options);
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  async fetchRemotePhotos(isBackgroundPoll = false) {
    try {
      const res = await fetch(this.settings.feedUrl);
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
        this.photos = remoteList;
        if (this.settings.shuffle && !isBackgroundPoll) {
          this.shufflePhotos();
        }
        this.updateCounter();
        if (isBackgroundPoll) {
          console.log(`Feed refreshed: ${this.photos.length} photos loaded.`);
        }
      }
    } catch (err) {
      console.warn('Failed to load photos from feed URL:', err);
    }
  }

  shufflePhotos() {
    for (let i = this.photos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.photos[i], this.photos[j]] = [this.photos[j], this.photos[i]];
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
      // Set image on incoming layer & ambient blur
      incomingLayer.style.backgroundImage = `url("${url}")`;
      this.ambientLayer.style.backgroundImage = `url("${url}")`;

      // Apply Ken Burns animation
      incomingLayer.className = 'photo-layer';
      if (this.settings.kenBurns) {
        const anim = this.kenBurnsState ? 'kenburns-zoom-in' : 'kenburns-zoom-out';
        incomingLayer.classList.add(anim);
        this.kenBurnsState = !this.kenBurnsState;
      }

      // Cross-fade
      incomingLayer.classList.add('active');
      if (!isFirst) {
        outgoingLayer.classList.remove('active');
      }

      this.activeLayer = this.activeLayer === 'a' ? 'b' : 'a';
      this.updateCounter();

      // Preload the next image in the queue
      const nextIndex = (this.currentIndex + 1) % this.photos.length;
      const nextImg = new Image();
      nextImg.src = this.photos[nextIndex];

      // Advance index
      this.currentIndex = nextIndex;

      // Schedule next slide
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.showNextPhoto(), this.settings.interval * 1000);
    };

    img.onerror = () => {
      // Skip broken image
      console.warn('Skipping broken photo:', url);
      this.currentIndex = (this.currentIndex + 1) % this.photos.length;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.showNextPhoto(), 1000);
    };
  }

  updateCounter() {
    this.photoCounter.textContent = `${this.currentIndex + 1} / ${this.photos.length}`;
  }

  initSettingsUI() {
    // Populate form
    this.feedUrlInput.value = this.settings.feedUrl;
    this.intervalInput.value = this.settings.interval;
    this.kenburnsToggle.checked = this.settings.kenBurns;
    this.clockToggle.checked = this.settings.showClock;
    this.shuffleToggle.checked = this.settings.shuffle;

    // Toggle Modal
    this.settingsToggle.addEventListener('click', () => {
      this.settingsModal.classList.remove('hidden');
    });

    this.closeSettingsBtn.addEventListener('click', () => {
      this.settingsModal.classList.add('hidden');
    });

    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) {
        this.settingsModal.classList.add('hidden');
      }
    });

    // Save Settings
    this.saveSettingsBtn.addEventListener('click', () => {
      this.settings.feedUrl = this.feedUrlInput.value.trim();
      this.settings.interval = Math.max(3, parseInt(this.intervalInput.value, 10) || 12);
      this.settings.kenBurns = this.kenburnsToggle.checked;
      this.settings.showClock = this.clockToggle.checked;
      this.settings.shuffle = this.shuffleToggle.checked;

      localStorage.setItem('lumina_feed_url', this.settings.feedUrl);
      localStorage.setItem('lumina_interval', String(this.settings.interval));
      localStorage.setItem('lumina_kenburns', String(this.settings.kenBurns));
      localStorage.setItem('lumina_clock', String(this.settings.showClock));
      localStorage.setItem('lumina_shuffle', String(this.settings.shuffle));

      this.settingsModal.classList.add('hidden');
      this.applySettings();

      // Restart with new settings
      if (this.settings.feedUrl) {
        this.fetchRemotePhotos().then(() => this.showNextPhoto(true));
      } else {
        this.photos = [...DEFAULT_PHOTOS];
        if (this.settings.shuffle) this.shufflePhotos();
        this.showNextPhoto(true);
      }
    });
  }

  applySettings() {
    this.clockWidget.style.display = this.settings.showClock ? 'block' : 'none';
  }
}

// Start on load
window.addEventListener('DOMContentLoaded', () => {
  new PhotoFrame();
});

# Lumina Digital Photo Frame

A fast, lightweight, full-screen photo frame web app built for liberated smart frames (like Nixplay) and tablets.

## Features
- **Built for weak hardware:** No CSS filters or continuous animations — runs smoothly on low-end frames (tested on a Nixplay with a Rockchip RK3126C, 512MB RAM, Android 7.1).
- **Screen-sized images:** Requests photos from Google at the frame's resolution instead of full-size originals.
- **Instant start & offline:** Caches the photo list, so the slideshow starts immediately and keeps running if the internet drops.
- **Ambient backdrop:** Fills empty space around portrait or odd-shaped photos with a soft, dimmed version of the photo.
- **Google Drive live sync:** Checks your Drive folder for new photos every 5 minutes.
- **Smooth cross-fade** with the next photo preloaded in the background.

Settings (slide time, sync interval, reload interval) are at the top of `app.js`.

---

## How to Host for Free on GitHub Pages (2 Minutes)

1. Create a new GitHub repository named `my-photo-frame` (make it **Public**).
2. Upload the files in this folder (`index.html`, `style.css`, `app.js`).
3. In your GitHub repository:
   - Click **Settings** (tab at the top).
   - In the left sidebar, click **Pages**.
   - Under **Build and deployment** -> **Branch**, select `main` (or `master`) and folder `/ (root)`.
   - Click **Save**.
4. GitHub will give you your free live URL, like:
   `https://yourusername.github.io/my-photo-frame/`

---

## Connecting Google Drive

Follow the simple instructions inside [`GoogleDriveScript.js`](GoogleDriveScript.js) to deploy a free, 1-click Google Apps Script that generates your photo feed URL, then paste that URL into `FEED_URL` at the top of `app.js`.

---

## Running on a Nixplay / Android Frame

Recommended setup with [Fully Kiosk Browser](https://www.fully-kiosk.com/) (free version is enough):

1. Install the Fully Kiosk APK (no Google Play Services needed).
2. Set **Start URL** to your GitHub Pages URL.
3. Set Fully as the default **Home app** so it opens automatically after every restart.
   - Some frame firmware blocks apps from launching on boot, so "Launch on Boot" alone may not work — making Fully the Home app does.
4. Leave PLUS-only options off (e.g. **Error URL**) to avoid the "Please Get a License" watermark. The app's built-in cache already handles offline.

**Tips:** Upload JPEGs — iPhone HEIC photos won't display in the browser.

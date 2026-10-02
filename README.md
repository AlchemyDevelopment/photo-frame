# Lumina Digital Photo Frame

A fast, lightweight, and cinematic digital photo frame web app designed to run on liberated smart frames (like Nixplay) and tablets.

## Features
- **Ultra-low RAM usage:** Built with pure HTML/CSS/JS — won't crash on 512MB RAM devices.
- **Cinematic Ken Burns Effect:** Subtle, slow-motion pan & zoom on photos.
- **Ambient Color Halo:** Automatically fills vertical or non-matching aspect ratio photos with a matching blurred color backdrop.
- **Google Drive Live Sync:** Connects to any Google Drive folder; updates every 5 minutes in the background.
- **Glassmorphic Clock & Date:** Sleek time and calendar display in modern typography.

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

## Connecting Google Drive (Optional)

Follow the simple instructions inside [`GoogleDriveScript.js`](GoogleDriveScript.js) to deploy a free, 1-click Google Apps Script that generates your photo feed URL.

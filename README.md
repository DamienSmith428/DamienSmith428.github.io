# PS4 PKG Manager — Web Admin Dashboard

Browser-based admin panel for PS4 PKG Manager. Same features as the in-app admin tab.

## Setup

1. Open `js/admin.js` — set `API_BASE` at line 8:
   ```js
   let API_BASE = localStorage.getItem('na_url') || 'https://your-app.onrender.com';
   ```
2. Push to a GitHub repo, enable Pages (Settings → Pages → main branch)
3. Sign in with your admin account

Or: leave `API_BASE` blank and set your URL on the Settings page after signing in.

## What it does

Mirrors the admin tab from the PS4 PKG Manager app exactly:
- Dashboard with live stats and tier breakdown
- All Users table with search/filter — click any row to open profile
- User profile popup: edit email, set tier, grant trial, suspend, ban, unban, IP history, delete
- Notifications: password reset requests with one-click code copy
- Active Trials list
- Banned/Suspended list with quick unban
- Settings: configure backend URL and auto-refresh interval

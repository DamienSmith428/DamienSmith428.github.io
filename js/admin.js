/* ═══════════════════════════════════════════════════════════════
   PS4 PKG Manager — Web Admin Dashboard
   admin.js  —  mirrors tab_admin.py behaviour exactly

   SETUP: set API_BASE below to your Render deployment URL,
   OR leave blank and configure it on the Settings page.
═══════════════════════════════════════════════════════════════ */

let API_BASE = localStorage.getItem('na_url') || '';

// ── State ──────────────────────────────────────────────────────────
let TOKEN    = localStorage.getItem('na_tok')  || '';
let USERNAME = localStorage.getItem('na_usr')  || '';
let ALL_USERS = [];
let REFRESH_TIMER = null;

// ── API helper ─────────────────────────────────────────────────────
async function api(method, path, body = null) {
  if (!API_BASE) { flash('Set your backend URL in Settings first', 'err'); return null; }
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` } };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(API_BASE + path, opts);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
    return d;
  } catch (e) {
    flash('Error: ' + e.message, 'err');
    return null;
  }
}

// ── Flash ──────────────────────────────────────────────────────────
function flash(msg, type = 'ok') {
  const el = document.getElementById('flash');
  el.textContent = msg;
  el.className   = 'on ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = '', 4000);
}

// ── Tag helpers ────────────────────────────────────────────────────
function tierTag(tier) {
  const m = { admin: `<span class="t-admin">👑 ADMIN</span>`, premium: `<span class="t-premium">💎 PREMIUM</span>`, free: `<span class="t-free">🎮 FREE</span>` };
  return m[tier] || `<span class="t-free">${tier}</span>`;
}
function statusTag(s) {
  const m = { active: `<span class="t-active">● ACTIVE</span>`, banned: `<span class="t-banned">🔴 BANNED</span>`, suspended: `<span class="t-suspended">⏸ SUSPENDED</span>` };
  return m[s] || `<span class="t-active">● ACTIVE</span>`;
}
function tierBadgeHTML(tier) {
  const m = { admin: `<span style="background:#FFD70025;color:#FFD700;border:1px solid #FFD70040;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700">👑 ADMIN</span>`, premium: `<span style="background:#00B8FF22;color:#00B8FF;border:1px solid #00B8FF40;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700">💎 PREMIUM</span>`, free: `<span style="background:#1a1a2e;color:#6a6a8a;border:1px solid #2a2a4a;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700">🎮 FREE</span>` };
  return m[tier] || m.free;
}

// ── Login / Logout ──────────────────────────────────────────────────
async function doLogin() {
  const user = document.getElementById('l-user').value.trim();
  const pass = document.getElementById('l-pass').value;
  const err  = document.getElementById('l-err');
  const btn  = document.getElementById('l-btn');

  if (!API_BASE) {
    err.textContent = 'No backend URL set — open js/admin.js and set API_BASE at the top';
    return;
  }
  err.textContent = '';
  btn.textContent = 'Signing in…';
  btn.disabled    = true;

  try {
    const r = await fetch(API_BASE + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { err.textContent = d.error || 'Login failed'; return; }
    if (d.tier !== 'admin') { err.textContent = 'This account does not have admin access'; return; }

    TOKEN = d.token; USERNAME = d.username || user;
    localStorage.setItem('na_tok', TOKEN);
    localStorage.setItem('na_usr', USERNAME);
    showShell();
  } catch (e) {
    err.textContent = 'Could not reach server — check your API URL';
  } finally {
    btn.textContent = 'Sign In →';
    btn.disabled    = false;
  }
}

function doLogout() {
  TOKEN = USERNAME = '';
  localStorage.removeItem('na_tok');
  localStorage.removeItem('na_usr');
  clearRefresh();
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('shell').classList.remove('visible');
  document.getElementById('l-user').value = '';
  document.getElementById('l-pass').value = '';
}

// ── Shell ──────────────────────────────────────────────────────────
function showShell() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('shell').classList.add('visible');
  document.getElementById('t-uname').textContent   = USERNAME;
  document.getElementById('cfg-uname').textContent = USERNAME;
  document.getElementById('cfg-url').value         = API_BASE;
  const u = (API_BASE || '').replace(/https?:\/\//, '').split('/')[0];
  document.getElementById('srv-label').textContent = u || 'No URL set';
  refreshAll();
  startRefresh();
}

// ── Refresh ────────────────────────────────────────────────────────
async function refreshAll() {
  await Promise.all([loadUsers(), loadNotifications()]);
}

function startRefresh() {
  clearRefresh();
  const secs = parseInt(document.getElementById('cfg-refresh')?.value || '30');
  if (secs > 0) REFRESH_TIMER = setInterval(refreshAll, secs * 1000);
}
function clearRefresh() { if (REFRESH_TIMER) { clearInterval(REFRESH_TIMER); REFRESH_TIMER = null; } }

// ── Load users ──────────────────────────────────────────────────────
async function loadUsers() {
  const d = await api('GET', '/api/admin/users');
  if (!d) return;
  ALL_USERS = d.users || [];
  updateStats();
  renderAll();
}

function updateStats() {
  const u    = ALL_USERS;
  const tot  = u.length;
  const prem = u.filter(x => x.tier === 'premium').length;
  const adm  = u.filter(x => x.tier === 'admin').length;
  const free = u.filter(x => x.tier === 'free').length;
  const tri  = u.filter(x => x.trial_info).length;
  const ban  = u.filter(x => x.status === 'banned').length;
  const sus  = u.filter(x => x.status === 'suspended').length;
  const act  = u.filter(x => !x.status || x.status === 'active').length;

  set('s-total',     tot);
  set('s-prem',      prem);
  set('s-trials',    tri);
  set('s-active',    act);
  set('s-suspended', sus);
  set('s-banned',    ban);
  set('s-trial-ov',  tri);
  set('tb-free',     free);
  set('tb-prem',     prem);
  set('tb-admin',    adm);
  set('s-total-sub', `${free} free · ${prem} premium · ${adm} admin`);
  set('s-prem-sub',  `${tot ? Math.round(prem/tot*100) : 0}% of users`);
  set('users-sub',   `${tot} total users`);

  if (tot > 0) {
    wd('pb-free',  Math.round(free/tot*100) + '%');
    wd('pb-prem',  Math.round(prem/tot*100) + '%');
    wd('pb-admin', Math.round(adm /tot*100) + '%');
  }
}

function renderAll() {
  renderRecent(ALL_USERS.slice(0, 8));
  renderUsersTable(ALL_USERS);
  renderTrials(ALL_USERS.filter(u => u.trial_info));
  renderRestricted(ALL_USERS.filter(u => u.status === 'banned' || u.status === 'suspended'));
}

function set(id, v) { const e = document.getElementById(id); if (e) e.textContent = v; }
function wd(id, w)  { const e = document.getElementById(id); if (e) e.style.width = w; }

function userRow(u, extraCols = '') {
  return `<tr onclick="openProfile('${u.username}')">
    <td><strong style="color:var(--text-hi)">${u.username}</strong></td>
    <td>${u.email || '<span style="color:var(--text-muted)">—</span>'}</td>
    <td>${tierTag(u.tier)}</td>
    <td>${statusTag(u.status || 'active')}</td>
    ${extraCols}
    <td style="font-size:11px;color:var(--text-muted)">${u.created_at || '—'}</td>
    <td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openProfile('${u.username}')">Profile</button></td>
  </tr>`;
}

function renderRecent(users) {
  const tb = document.getElementById('recent-tbody');
  if (!tb) return;
  tb.innerHTML = users.length
    ? users.map(u => `<tr onclick="openProfile('${u.username}')">
        <td><strong style="color:var(--text-hi)">${u.username}</strong></td>
        <td>${tierTag(u.tier)}</td>
        <td>${statusTag(u.status || 'active')}</td>
        <td style="font-size:11px;color:var(--text-muted)">${u.created_at || '—'}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openProfile('${u.username}')">Profile</button></td>
      </tr>`).join('')
    : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px">No users yet</td></tr>`;
}

function renderUsersTable(users) {
  const tb = document.getElementById('users-tbody');
  if (!tb) return;
  tb.innerHTML = users.length
    ? users.map(u => userRow(u, `<td style="font-size:11px;color:var(--amber)">${u.trial_info || '<span style="color:var(--text-muted)">—</span>'}</td>`)).join('')
    : `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px">No users found</td></tr>`;
}

function filterUsers() {
  const term = document.getElementById('user-filter').value.toLowerCase().trim();
  const list = term ? ALL_USERS.filter(u =>
    u.username.toLowerCase().includes(term) ||
    (u.email || '').toLowerCase().includes(term)
  ) : ALL_USERS;
  renderUsersTable(list);
}

function renderTrials(users) {
  const tb = document.getElementById('trials-tbody');
  if (!tb) return;
  tb.innerHTML = users.length
    ? users.map(u => `<tr onclick="openProfile('${u.username}')">
        <td><strong style="color:var(--text-hi)">${u.username}</strong></td>
        <td>${tierTag(u.tier)}</td>
        <td style="font-size:11px;color:var(--amber)">${u.trial_info}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openProfile('${u.username}')">Profile</button></td>
      </tr>`).join('')
    : `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px">No active trials</td></tr>`;
}

function renderRestricted(users) {
  const tb = document.getElementById('restricted-tbody');
  if (!tb) return;
  tb.innerHTML = users.length
    ? users.map(u => `<tr onclick="openProfile('${u.username}')">
        <td><strong style="color:var(--text-hi)">${u.username}</strong></td>
        <td>${statusTag(u.status)}</td>
        <td style="font-size:11px;color:var(--text-dim)">${u.status_reason || '—'}</td>
        <td style="font-size:11px;color:var(--text-dim)">${u.status_until || 'Permanent'}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openProfile('${u.username}')">Profile</button>
          <button class="btn btn-ghost btn-sm" style="margin-left:4px;color:var(--green);border-color:var(--green)" onclick="event.stopPropagation();quickUnban('${u.username}')">Unban</button>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px">No banned or suspended users</td></tr>`;
}

async function quickUnban(username) {
  const d = await api('POST', '/api/admin/unban_user', { username });
  if (d) { flash(`${username} unbanned`); loadUsers(); }
}

// ── Notifications ───────────────────────────────────────────────────
async function loadNotifications() {
  const d = await api('GET', '/api/admin/notifications');
  if (!d) return;
  const unresolved = d.unresolved || [];
  const count      = unresolved.length;

  set('s-notifs', count);
  set('s-notifs-sub', count ? `${count} need attention` : 'All clear');

  const badge = document.getElementById('notif-badge');
  if (badge) { badge.textContent = count; badge.classList.toggle('show', count > 0); }

  const list = document.getElementById('notif-list');
  if (!list) return;

  if (!unresolved.length) {
    list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:48px">
      <div style="font-size:28px;margin-bottom:10px">✅</div>
      No unresolved notifications
    </div>`;
    return;
  }

  list.innerHTML = unresolved.map(n => {
    const isReset = n.type === 'password_reset';
    return `<div class="notif-row">
      <div class="notif-icon">${isReset ? '🔑' : '📋'}</div>
      <div class="notif-body">
        <div class="notif-title">${n.type.replace(/_/g,' ').toUpperCase()} — ${n.username}</div>
        <div class="notif-msg">${n.message}</div>
        <div class="notif-time">${n.created_at}</div>
        <div class="notif-btns">
          ${isReset && n.reset_code
            ? `<button class="btn btn-green btn-sm" onclick="issueCode('${n.username}','${n.reset_code}',${n.id})">📋 Copy Code &amp; Resolve</button>`
            : `<button class="btn btn-ghost btn-sm" onclick="resolveNotif(${n.id})">✓ Mark Resolved</button>`
          }
          <button class="btn btn-red btn-sm" onclick="resolveNotif(${n.id})">✕ Deny / Dismiss</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function issueCode(username, code, nid) {
  navigator.clipboard.writeText(code).catch(() => {});
  flash(`Code for ${username}: ${code} — copied!`, 'ok');
  resolveNotif(nid);
}

async function resolveNotif(id) {
  const d = await api('POST', '/api/admin/resolve_notification', { notification_id: id });
  if (d) { flash('Notification resolved'); loadNotifications(); }
}

// ── User profile modal ──────────────────────────────────────────────
// Mirrors the open_user_profile() popup from tab_admin.py exactly:
// Account info, email editor, set tier, grant trial, moderation, IP, delete

function openProfile(username) {
  const u = ALL_USERS.find(x => x.username === username);
  if (!u) { flash('Refresh users first', 'err'); return; }

  document.getElementById('modal-title').textContent = `👤  ${u.username.toUpperCase()}`;
  document.getElementById('modal-tier-badge').innerHTML = tierBadgeHTML(u.tier);

  const statusColor  = u.status === 'banned' ? 'var(--red)' : u.status === 'suspended' ? 'var(--amber)' : 'var(--green)';
  const tierColor    = u.tier === 'admin' ? 'var(--amber)' : u.tier === 'premium' ? 'var(--cyan)' : 'var(--text-dim)';

  document.getElementById('modal-body').innerHTML = `

    <!-- ACCOUNT INFO -->
    <div class="m-section">
      <div class="m-section-hdr">ACCOUNT INFO</div>
      <div class="m-section-body">
        <div class="m-row"><span class="m-row-lbl">Username</span><span class="m-row-val">${u.username}</span></div>
        <div class="m-row"><span class="m-row-lbl">Tier</span><span style="color:${tierColor};font-weight:700;font-family:var(--font-mono)">${u.tier.toUpperCase()}</span></div>
        <div class="m-row"><span class="m-row-lbl">Status</span><span style="color:${statusColor};font-weight:700;font-family:var(--font-mono)">${(u.status||'active').toUpperCase()}</span></div>
        <div class="m-row"><span class="m-row-lbl">Joined</span><span class="m-row-val">${u.created_at||'—'}</span></div>
        ${u.status_reason ? `<div class="m-row"><span class="m-row-lbl">Reason</span><span style="color:var(--red);font-size:12px">${u.status_reason}</span></div>` : ''}
        ${u.status_until  ? `<div class="m-row"><span class="m-row-lbl">Until</span><span style="color:var(--amber);font-size:12px">${u.status_until}</span></div>` : ''}
        ${u.trial_info    ? `<div class="m-row"><span class="m-row-lbl">Trial</span><span style="color:var(--amber);font-size:12px">${u.trial_info}</span></div>` : ''}
      </div>
    </div>

    <!-- EMAIL -->
    <div class="m-section">
      <div class="m-section-hdr">EMAIL</div>
      <div class="m-section-body">
        <div class="inp-row">
          <input class="inp" id="p-email" value="${u.email||''}" placeholder="email@example.com" style="flex:1">
          <button class="btn btn-ghost btn-sm" onclick="saveEmail('${u.username}')">Save</button>
        </div>
        <div id="p-email-msg" style="font-size:11px;margin-top:6px;min-height:14px"></div>
      </div>
    </div>

    <!-- SET TIER -->
    <div class="m-section">
      <div class="m-section-hdr">SET TIER</div>
      <div class="m-section-body">
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="setTier('${u.username}','free')">🎮 Free</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--cyan);border-color:var(--cyan-dim)" onclick="setTier('${u.username}','premium')">💎 Premium</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--amber);border-color:#ffaa0060" onclick="setTier('${u.username}','admin')">👑 Admin</button>
        </div>
        <div id="p-tier-msg" style="font-size:11px;margin-top:6px;min-height:14px"></div>
      </div>
    </div>

    <!-- GRANT TRIAL -->
    <div class="m-section">
      <div class="m-section-hdr">GRANT TRIAL</div>
      <div class="m-section-body">
        <div class="inp-row">
          <input class="inp" id="p-tri-amt" type="number" value="7" min="1" style="width:65px">
          <select class="inp" id="p-tri-unit">
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days" selected>Days</option>
            <option value="weeks">Weeks</option>
          </select>
          <button class="btn btn-ghost btn-sm" style="color:var(--cyan);border-color:var(--cyan-dim)" onclick="grantTrial('${u.username}')">🎯 Grant Trial</button>
        </div>
        <div id="p-tri-msg" style="font-size:11px;margin-top:6px;min-height:14px"></div>
      </div>
    </div>

    <!-- MODERATION -->
    <div class="m-section">
      <div class="m-section-hdr">MODERATION</div>
      <div class="m-section-body">
        <div style="margin-bottom:10px">
          <input class="inp w-full" id="p-reason" placeholder="Reason (optional)" style="width:100%;box-sizing:border-box">
        </div>
        <div style="margin-bottom:8px">
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px;letter-spacing:0.1em">SUSPEND DURATION</div>
          <div class="inp-row">
            <input class="inp" id="p-sus-amt" type="number" value="24" min="1" style="width:65px">
            <select class="inp" id="p-sus-unit">
              <option value="minutes">Minutes</option>
              <option value="hours" selected>Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
            <button class="btn btn-ghost btn-sm" style="color:var(--amber);border-color:#ffaa0060" onclick="suspendUser('${u.username}')">⏸ Suspend</button>
          </div>
        </div>
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="btn btn-red btn-sm" onclick="banUser('${u.username}')">🔴 Permanent Ban</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--green);border-color:var(--green)" onclick="unbanUser('${u.username}')">✓ Unban / Unsuspend</button>
        </div>
        <div id="p-mod-msg" style="font-size:11px;margin-top:6px;min-height:14px"></div>
      </div>
    </div>

    <!-- OTHER -->
    <div class="m-section">
      <div class="m-section-hdr">OTHER</div>
      <div class="m-section-body">
        <div class="flex gap-8" style="flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-ghost btn-sm" onclick="viewIPs('${u.username}')">🌐 IP History</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--red);border-color:var(--red)" onclick="deleteUser('${u.username}')">🗑 Delete Account</button>
        </div>
        <div id="p-ip-result" style="font-size:11px;color:var(--text-dim);line-height:1.8"></div>
      </div>
    </div>
  `;

  document.getElementById('profile-modal').classList.add('open');
}

function closeProfile() {
  document.getElementById('profile-modal').classList.remove('open');
}

// Modal message helpers
function pmsg(id, msg, color='var(--green)') {
  const e = document.getElementById(id);
  if (e) { e.textContent = msg; e.style.color = color; }
}

async function saveEmail(username) {
  const email = document.getElementById('p-email').value.trim().toLowerCase();
  const d = await api('POST', '/api/admin/set_email', { username, email });
  if (d) { pmsg('p-email-msg', '✓ Email saved'); flash(`Email updated for ${username}`); loadUsers(); }
  else    pmsg('p-email-msg', '✗ Failed', 'var(--red)');
}

async function setTier(username, tier) {
  const d = await api('POST', '/api/admin/set_tier', { username, tier });
  if (d) { pmsg('p-tier-msg', `✓ Tier set to ${tier.toUpperCase()}`); flash(`${username} → ${tier.toUpperCase()}`); loadUsers(); }
  else    pmsg('p-tier-msg', '✗ Failed', 'var(--red)');
}

async function grantTrial(username) {
  const amount = parseInt(document.getElementById('p-tri-amt').value) || 7;
  const unit   = document.getElementById('p-tri-unit').value;
  const d = await api('POST', '/api/admin/set_trial', { username, amount, unit });
  if (d) { pmsg('p-tri-msg', '✓ ' + d.message); flash(`Trial granted to ${username}`); loadUsers(); }
  else    pmsg('p-tri-msg', '✗ Failed', 'var(--red)');
}

async function suspendUser(username) {
  const amount = parseInt(document.getElementById('p-sus-amt').value) || 24;
  const unit   = document.getElementById('p-sus-unit').value;
  const reason = document.getElementById('p-reason').value.trim();
  const d = await api('POST', '/api/admin/suspend_user', { username, amount, unit, reason });
  if (d) { pmsg('p-mod-msg', '✓ ' + d.message); flash(`${username} suspended`); loadUsers(); }
  else    pmsg('p-mod-msg', '✗ Failed', 'var(--red)');
}

async function banUser(username) {
  if (!confirm(`Permanently ban ${username}?`)) return;
  const reason = document.getElementById('p-reason').value.trim();
  const d = await api('POST', '/api/admin/ban_user', { username, reason });
  if (d) { pmsg('p-mod-msg', '✓ Banned'); flash(`${username} banned`); loadUsers(); }
  else    pmsg('p-mod-msg', '✗ Failed', 'var(--red)');
}

async function unbanUser(username) {
  const d = await api('POST', '/api/admin/unban_user', { username });
  if (d) { pmsg('p-mod-msg', '✓ Unbanned'); flash(`${username} unbanned`); loadUsers(); }
  else    pmsg('p-mod-msg', '✗ Failed', 'var(--red)');
}

async function viewIPs(username) {
  const d  = await api('POST', '/api/admin/user_ips', { username });
  const el = document.getElementById('p-ip-result');
  if (!el) return;
  if (!d)            { el.textContent = 'Failed to fetch IPs'; return; }
  if (!d.ips?.length){ el.textContent = 'No login IPs recorded'; return; }
  el.innerHTML = 'Last login IPs:<br>' + d.ips.map((ip,i) =>
    `<code style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:3px;padding:1px 7px;margin-right:6px;color:${ip==='REDACTED'?'var(--red)':'var(--cyan)'}">#${i+1} ${ip}</code>`
  ).join('');
}

async function deleteUser(username) {
  if (!confirm(`Permanently delete "${username}"? This cannot be undone.`)) return;
  const d = await api('DELETE', '/api/admin/delete_user', { username });
  if (d) { flash(`${username} deleted`); closeProfile(); loadUsers(); }
}

// ── Navigation ──────────────────────────────────────────────────────
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const p = document.getElementById(`page-${page}`);
  const n = document.getElementById(`nav-${page}`);
  if (p) p.classList.add('active');
  if (n) n.classList.add('active');
}

// ── Settings ────────────────────────────────────────────────────────
function saveSettings() {
  API_BASE = (document.getElementById('cfg-url').value || '').trim().replace(/\/$/, '');
  localStorage.setItem('na_url', API_BASE);
  const u = API_BASE.replace(/https?:\/\//, '').split('/')[0];
  document.getElementById('srv-label').textContent = u || 'No URL set';
  startRefresh();
  document.getElementById('cfg-msg').textContent = '✓ Saved';
  setTimeout(() => document.getElementById('cfg-msg').textContent = '', 3000);
  flash('Settings saved');
}

// ── Keys ────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeProfile();
});

// ── Boot ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('l-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('l-user').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('l-pass').focus(); });

  // Auto-login if token exists
  if (TOKEN && API_BASE) {
    try {
      const r = await fetch(API_BASE + '/api/verify', { headers: { Authorization: `Bearer ${TOKEN}` } });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.valid && d.tier === 'admin') { USERNAME = d.username || USERNAME; showShell(); return; }
    } catch (_) {}
    TOKEN = ''; localStorage.removeItem('na_tok');
  }

  document.getElementById('login-screen').style.display = 'flex';
});

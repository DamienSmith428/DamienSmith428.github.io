/* ═══════════════════════════════════════════════════
   NexAuth  —  Dashboard JS
═══════════════════════════════════════════════════ */

// ── Role switcher ─────────────────────────────────────
function switchRole(role) {
  document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));

  const view = document.getElementById('view-' + role);
  const btn  = document.getElementById('btn-' + role);
  if (view) view.classList.add('active');
  if (btn)  btn.classList.add('active');

  // Animate stat counters when switching to admin
  if (role === 'admin') {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      animateCounter(el, target);
    });
  }
  // Animate progress bars
  setTimeout(() => {
    document.querySelectorAll('.progress-fill[data-width]').forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 100);
}

function animateCounter(el, target, duration = 1000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start).toLocaleString();
    if (start >= target) clearInterval(timer);
  }, 16);
}

// ── Ticket system ─────────────────────────────────────
const tickets = [
  {
    id: 'TKT-0041',
    title: 'API returning 401 on /api/verify after login',
    status: 'open',
    priority: 'high',
    user: 'raj_p',
    email: 'raj@codelab.dev',
    app: 'AutoScript Pro (Indie Plan)',
    created: '1 hour ago',
    updated: '14 min ago',
    preview: 'Getting consistent 401 errors on verify immediately after...',
    messages: [
      {
        from: 'user',
        name: 'raj_p',
        time: '1 hour ago',
        text: "Hey, I'm getting consistent 401 errors on /api/verify immediately after a successful login. The login response gives me a token, I store it, then the very next verify call rejects it. Using the Python client SDK on Windows. This is blocking my beta launch."
      },
      {
        from: 'staff',
        name: 'NexAuth Support',
        time: '45 min ago',
        text: "Hi Raj! Thanks for the detailed report. This is almost always a clock skew issue — if your machine's system clock is off by more than a few seconds from UTC, the JWT signature validation fails because the 'issued at' timestamp looks wrong to the server. Can you check what your system clock shows vs actual UTC time? You can run `python -c \"import datetime; print(datetime.datetime.utcnow())`  and compare to time.is/UTC."
      },
      {
        from: 'user',
        name: 'raj_p',
        time: '30 min ago',
        text: "Oh wow — my dev machine was 6 minutes behind! Synced NTP and everything works perfectly now. Feeling a bit silly but glad it was an easy fix. Is there anything on NexAuth's end that could help detect this and give a more descriptive error?"
      },
      {
        from: 'staff',
        name: 'NexAuth Support',
        time: '14 min ago',
        text: "Ha, it catches everyone at least once! Great suggestion — I've actually added it to our roadmap to return a more descriptive error when we detect likely clock skew. For now I've added a note to our docs troubleshooting section. Good luck with the beta launch! 🚀"
      }
    ]
  },
  {
    id: 'TKT-0040',
    title: 'HWID reset needed — developer got a new machine',
    status: 'pending',
    priority: 'medium',
    user: 'marcus_dev',
    email: 'dev@myapp.io',
    app: 'AutoScript Pro',
    created: '3 hours ago',
    updated: '2 hours ago',
    preview: 'One of my premium users got a new PC and can\'t log in...',
    messages: [
      {
        from: 'user',
        name: 'marcus_dev',
        time: '3 hours ago',
        text: "One of my premium end-users got a new PC and now they can't log in — it's showing 'HWID mismatch'. I reset it from the admin panel inside my app but they say they're still getting the error. Am I doing something wrong?"
      },
      {
        from: 'staff',
        name: 'NexAuth Support',
        time: '2 hours ago',
        text: "Hey Marcus! The HWID reset from your admin panel should work instantly — the new fingerprint gets registered on their very next login attempt. A couple things to check: 1) Make sure they fully closed and re-opened your app after the reset (not just minimized), and 2) Confirm the reset actually saved — in your admin panel, open their user profile and check if HWID shows as 'Reset / Pending' or still shows a fingerprint. Let me know what you see!"
      }
    ]
  },
  {
    id: 'TKT-0038',
    title: 'How do I integrate NexAuth with a C# WPF app?',
    status: 'resolved',
    priority: 'low',
    user: 'toolsmith_dev',
    email: 'hello@toolsmith.app',
    app: 'DataVault Desktop (Starter Plan)',
    created: '2 days ago',
    updated: '1 day ago',
    preview: 'I\'m building a WPF desktop app in C# and want to use NexAuth...',
    messages: [
      {
        from: 'user',
        name: 'toolsmith_dev',
        time: '2 days ago',
        text: "I'm building a WPF desktop app in C# and want to use NexAuth for user authentication and licensing. The docs show Python examples — is there a C# SDK or do I need to call the REST API directly? I just need login, verify, and tier checking."
      },
      {
        from: 'staff',
        name: 'NexAuth Support',
        time: '1 day ago',
        text: "Great question! There's no official C# SDK yet (it's on the roadmap) but the REST API is super straightforward to call from C#. Here's what you need:\n\n1. POST /api/login with {username, password} → get back token + tier\n2. GET /api/verify with Authorization: Bearer {token} → check tier on startup\n3. Store the token in your app settings\n\nYou can use HttpClient in .NET for all of this. The verify call is the only one you need regularly — call it on startup and then cache the tier locally. I'll DM you a small C# example that covers login + verify + tier gating. Check your email!"
      },
      {
        from: 'user',
        name: 'toolsmith_dev',
        time: '1 day ago',
        text: "The example was perfect, got it working in about an hour. Would love an official C# SDK eventually but the REST approach works great. Thanks!"
      }
    ]
  },
  {
    id: 'TKT-0035',
    title: 'Upgrade to Pro — need more than 1,000 users',
    status: 'resolved',
    priority: 'medium',
    user: 'sarah_k',
    email: 'sarah@velocitystudio.io',
    app: 'Multiple (Studio Plan)',
    created: '3 days ago',
    updated: '2 days ago',
    preview: 'We\'re approaching our 1,000 user limit on Indie...',
    messages: [
      {
        from: 'user',
        name: 'sarah_k',
        time: '3 days ago',
        text: "Hi, we're a small game dev studio and we're approaching our 1,000 user limit on the Indie plan across our apps. We also need more than 3 apps. Looking at upgrading to Studio — is there any way to do that mid-billing-cycle without losing any data or having downtime?"
      },
      {
        from: 'staff',
        name: 'NexAuth Support',
        time: '2 days ago',
        text: "Congrats on the growth! Upgrading is completely seamless — zero downtime, no data migration, nothing changes on your users' end. Your existing deployments, users, and configurations all stay exactly as they are. You'll just unlock higher limits instantly. I've gone ahead and processed your upgrade to Studio in the billing system. Your apps are now on unlimited users and unlimited deployments. Welcome to Studio! 🎉"
      }
    ]
  }
];

let activeTicket = 0;

function renderTicketList(filter = '') {
  const list = document.querySelector('.ticket-list');
  if (!list) return;
  list.innerHTML = '';
  const filtered = filter
    ? tickets.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())
        || t.user.toLowerCase().includes(filter.toLowerCase()))
    : tickets;

  filtered.forEach((t, i) => {
    const idx = tickets.indexOf(t);
    const el = document.createElement('div');
    el.className = 'ticket-item' + (idx === activeTicket ? ' active' : '');
    el.onclick = () => { activeTicket = idx; renderTicketDetail(); renderTicketList(filter); };
    el.innerHTML = `
      <div class="ticket-item-header">
        <div class="ticket-item-title">${t.title}</div>
        <span class="tag tag-${t.status === 'open' ? 'cyan' : t.status === 'pending' ? 'amber' : 'dim'}" style="font-size:10px;padding:2px 8px">
          ${t.status.toUpperCase()}
        </span>
      </div>
      <div class="ticket-item-preview">${t.preview}</div>
      <div class="ticket-item-meta">
        <span class="ticket-item-user">${t.user} · ${t.app}</span>
        <span class="ticket-item-user">${t.updated}</span>
      </div>
    `;
    list.appendChild(el);
  });
}

function renderTicketDetail() {
  const detail = document.querySelector('.ticket-detail');
  if (!detail) return;
  const t = tickets[activeTicket];

  const priorityColor = t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'amber' : 'dim';
  const statusColor   = t.status === 'open' ? 'cyan' : t.status === 'pending' ? 'amber' : 'dim';

  detail.querySelector('.ticket-detail-header').innerHTML = `
    <div class="ticket-detail-title">${t.title}</div>
    <div class="ticket-detail-meta">
      <div class="ticket-meta-item">ID: <strong>${t.id}</strong></div>
      <div class="ticket-meta-item">User: <strong>${t.user}</strong></div>
      <div class="ticket-meta-item">App: <strong>${t.app}</strong></div>
      <div class="ticket-meta-item">
        <span class="tag tag-${statusColor}" style="font-size:10px">${t.status.toUpperCase()}</span>
      </div>
      <div class="ticket-meta-item">
        <span class="tag tag-${priorityColor}" style="font-size:10px">${t.priority.toUpperCase()} PRIORITY</span>
      </div>
      <div class="ticket-meta-item">Opened: <strong>${t.created}</strong></div>
    </div>
  `;

  const messages = detail.querySelector('.ticket-messages');
  messages.innerHTML = '';
  t.messages.forEach(m => {
    const isStaff = m.from === 'staff';
    const div = document.createElement('div');
    div.className = 'message' + (isStaff ? ' staff' : '');
    div.innerHTML = `
      <div class="message-avatar ${isStaff ? 'staff-av' : 'user-av'}">
        ${isStaff ? 'N' : m.name[0].toUpperCase()}
      </div>
      <div class="message-content">
        <div class="message-sender">${m.name}</div>
        <div class="message-bubble">${m.text.replace(/\n/g, '<br>')}</div>
        <div class="message-time">${m.time}</div>
      </div>
    `;
    messages.appendChild(div);
  });
  messages.scrollTop = messages.scrollHeight;
}

function initTickets() {
  renderTicketList();
  renderTicketDetail();

  const search = document.querySelector('.ticket-search input');
  if (search) {
    search.addEventListener('input', e => renderTicketList(e.target.value));
  }

  const replyBtn = document.querySelector('.ticket-reply .btn-primary');
  const replyTA  = document.querySelector('.ticket-reply textarea');
  if (replyBtn && replyTA) {
    replyBtn.addEventListener('click', () => {
      const text = replyTA.value.trim();
      if (!text) return;
      tickets[activeTicket].messages.push({
        from: 'staff',
        name: 'NexAuth Support',
        time: 'Just now',
        text
      });
      replyTA.value = '';
      renderTicketDetail();
    });
    replyTA.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.ctrlKey) replyBtn.click();
    });
  }
}

// ── Progress bars on load ─────────────────────────────
function initProgressBars() {
  setTimeout(() => {
    document.querySelectorAll('.progress-fill[data-width]').forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 300);
}

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  switchRole('visitor');
  initTickets();
  initProgressBars();
});

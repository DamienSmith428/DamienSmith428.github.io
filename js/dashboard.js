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
    title: 'HWID locked to old PC after reinstall',
    status: 'open',
    priority: 'high',
    user: 'darkwolf92',
    email: 'darkwolf92@email.com',
    app: 'ScriptGuard Pro',
    created: '2 hours ago',
    updated: '14 min ago',
    preview: 'I reformatted my PC and now my license is locked...',
    messages: [
      {
        from: 'user',
        name: 'darkwolf92',
        time: '2 hours ago',
        text: "Hey, I reformatted my PC and reinstalled Windows. Now when I try to launch the app it says my HWID is locked to a different machine. I paid for a full license last month. Can you reset my HWID? My order ID is NX-2847."
      },
      {
        from: 'staff',
        name: 'NexAuth Support',
        time: '1 hour ago',
        text: "Hi! Thanks for reaching out. I can see your account and full license is active — totally understandable issue after a reinstall. I've gone ahead and reset your HWID. You should be able to launch the app now on your new machine. The new hardware fingerprint will be locked in on your next successful launch. Let me know if you run into anything else! 🎉"
      },
      {
        from: 'user',
        name: 'darkwolf92',
        time: '45 min ago',
        text: "That worked perfectly, thank you so much! One more thing — is there a way to see which apps are using my license key? Just want to keep track."
      },
      {
        from: 'staff',
        name: 'NexAuth Support',
        time: '14 min ago',
        text: "Great to hear! And yes — if you head to your customer dashboard and click on your license, you'll see a full breakdown of which apps it's registered to, your HWID fingerprint, and your activation history. If you ever need another HWID reset in the future you can also self-serve it from there after a 7-day cooldown."
      }
    ]
  },
  {
    id: 'TKT-0040',
    title: 'Trial extension request — demo for client',
    status: 'pending',
    priority: 'medium',
    user: 'velocity_dev',
    email: 'dev@velocitystudio.io',
    app: 'VaultAuth SDK',
    created: '5 hours ago',
    updated: '3 hours ago',
    preview: 'We are evaluating NexAuth for a project at my studio...',
    messages: [
      {
        from: 'user',
        name: 'velocity_dev',
        time: '5 hours ago',
        text: "Hi, we are a small game dev studio evaluating NexAuth for a project. Our 7-day trial expires tomorrow but we're in the middle of a client demo next week. Any chance of a short extension? We're very likely to convert to paid — just need a bit more time to finish integration testing."
      },
      {
        from: 'staff',
        name: 'NexAuth Support',
        time: '3 hours ago',
        text: "Hey! Love to hear you're integrating NexAuth into your studio's workflow. I've extended your trial by 14 days — no problem at all. Good luck with the client demo! If you have any integration questions our docs are at nexauth.dev/docs and I'm happy to jump on a live chat if you need help with anything specific."
      }
    ]
  },
  {
    id: 'TKT-0038',
    title: 'API returning 401 on verify endpoint',
    status: 'resolved',
    priority: 'high',
    user: 'codebreaker_x',
    email: 'x@codebreaker.dev',
    app: 'Custom Integration',
    created: '1 day ago',
    updated: '20 hours ago',
    preview: 'Getting consistent 401 errors on /api/verify...',
    messages: [
      {
        from: 'user',
        name: 'codebreaker_x',
        time: '1 day ago',
        text: "Getting consistent 401 errors on /api/verify after tokens that are less than 5 minutes old. The tokens work fine when I test them on /api/login immediately after issuing, but subsequent verify calls fail. Using Python requests library."
      },
      {
        from: 'staff',
        name: 'NexAuth Support',
        time: '22 hours ago',
        text: "Thanks for the detailed report. This sounds like a JWT clock skew issue — if your server's clock is off by more than a few seconds it can cause tokens to fail verification prematurely. Can you paste the token payload (you can decode it at jwt.io) and tell me what timezone your server is set to?"
      },
      {
        from: 'user',
        name: 'codebreaker_x',
        time: '21 hours ago',
        text: "Oh wow. My dev machine clock was 4 minutes behind. Synced NTP and everything works perfectly now. That was embarrassing. Thanks!"
      },
      {
        from: 'staff',
        name: 'NexAuth Support',
        time: '20 hours ago',
        text: "Ha, classic NTP issue! Happens to everyone. Marking this resolved but I'll add a note to our docs about clock sync since it comes up occasionally. Glad you're up and running! ✅"
      }
    ]
  },
  {
    id: 'TKT-0035',
    title: 'How do I set up tiered licensing?',
    status: 'resolved',
    priority: 'low',
    user: 'indie_launcher',
    email: 'hello@indielauncher.gg',
    app: 'GameLauncher v2',
    created: '2 days ago',
    updated: '2 days ago',
    preview: 'I want to have free, basic, and pro tiers...',
    messages: [
      {
        from: 'user',
        name: 'indie_launcher',
        time: '2 days ago',
        text: "Hey! Love the product so far. I want to set up three tiers: free, basic ($5/mo), and pro ($15/mo). Each unlocks different features in my launcher. What's the best way to structure this with NexAuth?"
      },
      {
        from: 'staff',
        name: 'NexAuth Support',
        time: '2 days ago',
        text: "Perfect use case for NexAuth tiers! Here's the recommended setup:\n\n1. In your admin panel, you have free, premium, and admin tiers built in\n2. Map: free → your Free tier, premium → Basic, admin → Pro (or use redeem codes for Pro)\n3. In your app, check auth.current_tier and gate features accordingly\n4. Use the trial system for free trials of paid tiers\n\nCheck out the docs at /docs for code examples — the 'Tier Gating' section has exactly what you need."
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

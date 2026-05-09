/* ===== app.js — Client-Side Router, Interactions & Personalization ===== */

(function () {
  'use strict';

  /* ─── Router ─────────────────────────────────────────────────────── */
  const ROUTES = ['home', 'our-story', 'memories', 'the-letter'];
  const PAGE_IDS = {
    'home':       'page-home',
    'our-story':  'page-our-story',
    'memories':   'page-memories',
    'the-letter': 'page-the-letter',
  };
  const ROUTE_LABELS = {
    'home':       '🏠 Home',
    'our-story':  '📖 Our Story',
    'memories':   '🖼️ Memories',
    'the-letter': '💌 The Letter',
  };

  let currentRoute = null;

  function getRouteFromHash() {
    const hash = location.hash.replace('#/', '').replace('#', '').split('?')[0];
    return ROUTES.includes(hash) ? hash : 'home';
  }

  function navigate(route) {
    if (!ROUTES.includes(route)) route = 'home';
    if (route === currentRoute) return;

    const overlay = document.getElementById('transition-overlay');
    overlay.classList.add('active');

    setTimeout(() => {
      applyRoute(route);
      history.pushState(null, '', '#/' + route + location.search);
      overlay.classList.remove('active');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 320);
  }

  function applyRoute(route) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const pageEl = document.getElementById(PAGE_IDS[route]);
    if (pageEl) {
      pageEl.classList.add('active');
      pageEl.style.animation = 'none';
      pageEl.offsetHeight;
      pageEl.style.animation = '';
    }

    const navBtn = document.querySelector(`.nav-btn[data-route="${route}"]`);
    if (navBtn) navBtn.classList.add('active');

    handleRouteEffects(route);
    showToast(ROUTE_LABELS[route] || route);
    currentRoute = route;
  }

  function handleRouteEffects(route) {
    const floatsContainer = document.getElementById('letter-floats');
    if (route === 'the-letter') {
      spawnLetterFloats(floatsContainer);
    } else {
      if (floatsContainer) floatsContainer.innerHTML = '';
      if (floatInterval) { clearInterval(floatInterval); floatInterval = null; }
    }
    if (route === 'home') animateStats();
  }

  /* ─── Toast ──────────────────────────────────────────────────────── */
  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* ─── Reading Progress Bar ───────────────────────────────────────── */
  function updateProgress() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ─── Send Love — Heart Burst ────────────────────────────────────── */
  function initSendLove() {
    const btn = document.getElementById('send-love-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      for (let i = 0; i < 10; i++) {
        const el = document.createElement('i');
        el.className = 'fa-solid fa-heart heart-burst';
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const dist = 60 + Math.random() * 90;
        el.style.setProperty('--tx', (Math.cos(angle) * dist) + 'px');
        el.style.setProperty('--ty', (Math.sin(angle) * dist) + 'px');
        el.style.left = cx + 'px';
        el.style.top  = cy + 'px';
        el.style.fontSize = (12 + Math.random() * 10) + 'px';
        el.style.color = `hsl(${340 + Math.random() * 30},70%,${60 + Math.random() * 20}%)`;
        el.style.animationDelay = (Math.random() * 0.2) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1400);
      }
      showToast('❤️ Sending love to Mom!');
    });
  }

  /* ─── Animated Stats Counter ─────────────────────────────────────── */
  let statsAnimated = false;
  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
      const target = +el.dataset.target;
      const duration = 1800;
      const start = performance.now();
      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }

  /* ─── Gallery Filter Tabs ────────────────────────────────────────── */
  function initFilterTabs() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const filter = this.dataset.filter;
        document.querySelectorAll('.polaroid-card').forEach(card => {
          const cat = card.dataset.category;
          if (filter === 'all' || cat === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ─── Share / Personalize System ────────────────────────────────── */
  function buildShareURL(sender, momName) {
    const base = location.href.split('#')[0].split('?')[0];
    const params = new URLSearchParams();
    if (sender) params.set('from', sender.trim());
    if (momName) params.set('for my Mom,', momName.trim());
    return base + (params.toString() ? '?' + params.toString() : '') + '#/home';
  }

  function initShareInputs() {
    const senderInput = document.getElementById('input-sender');
    const momInput    = document.getElementById('input-mom');
    const preview     = document.getElementById('share-preview-box');
    if (!senderInput || !momInput || !preview) return;

    function updatePreview() {
      const sender   = senderInput.value.trim();
      const momName  = momInput.value.trim();
      if (!sender && !momName) {
        preview.classList.remove('visible');
        preview.textContent = '';
        return;
      }
      const url = buildShareURL(sender, momName);
      preview.textContent = url;
      preview.classList.add('visible');
    }

    senderInput.addEventListener('input', updatePreview);
    momInput.addEventListener('input', updatePreview);
  }

  function copyShareLink() {
    const sender  = (document.getElementById('input-sender')?.value || '').trim();
    const momName = (document.getElementById('input-mom')?.value || '').trim();
    if (!sender) {
      showToast('Please enter your name first ✏️');
      document.getElementById('input-sender')?.focus();
      return;
    }
    const url = buildShareURL(sender, momName);
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('btn-copy-link');
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Shareable Link';
          btn.classList.remove('copied');
        }, 2500);
      }
      showToast('Link copied! Share it with Mom 💌');
    }).catch(() => {
      showToast('Could not copy — please copy manually');
    });
  }

  /* Read URL params on load & personalize ─────────────────────────── */
  function applyURLPersonalization() {
    const params = new URLSearchParams(location.search);
    const sender  = params.get('from');
    const momName = params.get('for');
    if (!sender && !momName) return;

    // Show greeting banner on home page
    const banner = document.getElementById('personalized-banner');
    if (banner) {
      const who = momName ? `<strong>${momName}</strong>` : 'Mom';
      const by  = sender  ? ` — with love from <strong>${sender}</strong>` : '';
      banner.innerHTML = `<i class="fa-solid fa-heart" style="color:var(--rose);margin-right:8px;"></i>This page was made especially for ${who}${by} 🌸`;
      banner.classList.add('show');
    }

    // Personalize the letter signature
    if (sender) {
      const sigName = document.querySelector('.signature-name');
      if (sigName) {
        sigName.innerHTML = sender + ' <i class="fa-solid fa-heart signature-heart"></i>';
      }
    }

    // Personalize hero subtitle
    if (momName) {
      const heroSub = document.querySelector('.hero-sub');
      if (heroSub) {
        heroSub.textContent = `To ${momName} — the woman who made every ordinary moment feel like magic. This little corner of the internet is made entirely for you.`;
      }
      // Update letter salutation title
      const pageTitle = document.querySelector('#page-the-letter .page-title');
      if (pageTitle) pageTitle.textContent = `Dear Mom , ${momName},`;
    }
  }

  /* ─── Letter Page: Floating FA Icons ─────────────────────────────── */
  const FLOAT_ICONS = [
    'fa-solid fa-heart', 'fa-solid fa-spa', 'fa-solid fa-star',
    'fa-solid fa-leaf', 'fa-solid fa-feather', 'fa-solid fa-wand-sparkles',
    'fa-solid fa-fan', 'fa-solid fa-seedling', 'fa-solid fa-dove',
  ];
  let floatInterval = null;

  function spawnLetterFloats(container) {
    if (!container) return;
    container.innerHTML = '';
    if (floatInterval) clearInterval(floatInterval);

    function addFloat() {
      const el = document.createElement('i');
      const icon = FLOAT_ICONS[Math.floor(Math.random() * FLOAT_ICONS.length)];
      icon.split(' ').forEach(cls => el.classList.add(cls));
      el.classList.add('letter-float');
      el.style.left = Math.random() * 92 + '%';
      const dur   = 9 + Math.random() * 10;
      const delay = Math.random() * -dur;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay   = delay + 's';
      el.style.fontSize = (13 + Math.random() * 16) + 'px';
      el.style.color = `hsl(${340 + Math.random() * 30}, 60%, ${60 + Math.random() * 20}%)`;
      container.appendChild(el);
      setTimeout(() => el.remove(), (dur + Math.abs(delay)) * 1000 + 1000);
    }

    for (let i = 0; i < 18; i++) addFloat();
    floatInterval = setInterval(addFloat, 1200);
  }

  /* ─── Background Petals (FA icons) ──────────────────────────────── */
  const PETAL_ICONS = [
    'fa-solid fa-spa', 'fa-solid fa-leaf', 'fa-solid fa-fan',
    'fa-solid fa-seedling', 'fa-solid fa-star',
  ];

  function initBgPetals() {
    const container = document.getElementById('bg-petals');
    if (!container) return;

    function addPetal() {
      const el   = document.createElement('i');
      const icon = PETAL_ICONS[Math.floor(Math.random() * PETAL_ICONS.length)];
      icon.split(' ').forEach(cls => el.classList.add(cls));
      el.classList.add('petal');
      el.style.left     = Math.random() * 100 + '%';
      const dur = 18 + Math.random() * 16;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay   = (Math.random() * -dur) + 's';
      el.style.fontSize = (10 + Math.random() * 14) + 'px';
      container.appendChild(el);
      setTimeout(() => el.remove(), dur * 1000 + 500);
    }

    for (let i = 0; i < 12; i++) addPetal();
    setInterval(addPetal, 2200);
  }

  /* ─── Scroll Reveal ──────────────────────────────────────────────── */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity    = '1';
          entry.target.style.transform  = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(
      '.timeline-card, .polaroid-card, .stat-item, .share-card, .home-closing-inner, .preview-card'
    ).forEach(el => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(28px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
      observer.observe(el);
    });
  }

  /* ─── Home load confetti ─────────────────────────────────────────── */
  function launchConfetti() {
    const colors = ['#D88C9A','#f2c4ce','#b8697a','#ffe0ec','#fff'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position:fixed; width:${4 + Math.random() * 6}px; height:${4 + Math.random() * 6}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:50%; pointer-events:none; z-index:9996;
        left:${Math.random() * 100}vw; top:-10px;
        animation: confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3600);
    }
  }

  /* ─── Init ───────────────────────────────────────────────────────── */
  window.navigate       = navigate;
  window.copyShareLink  = copyShareLink;

  document.addEventListener('DOMContentLoaded', () => {
    // Inject dynamic keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiFall {
        to { transform: translateY(105vh) rotate(360deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    initBgPetals();

    // Apply URL personalization
    applyURLPersonalization();

    // Handle initial route
    const initialRoute = getRouteFromHash();
    applyRoute(initialRoute);
    currentRoute = initialRoute;

    window.addEventListener('popstate', () => {
      const route = getRouteFromHash();
      applyRoute(route);
      currentRoute = route;
    });

    // Confetti on home load
    if (initialRoute === 'home') {
      setTimeout(launchConfetti, 600);
      animateStats();
    }

    setTimeout(() => {
      initScrollReveal();
      initFilterTabs();
      initSendLove();
      initShareInputs();
    }, 120);
  });
})();

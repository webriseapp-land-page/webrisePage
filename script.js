/* ═══════════════════════════
   WebRise – script.js v2
   שיר ודורין | Premium RTL
═══════════════════════════ */
'use strict';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ─ UTILS ─ */
function onVisible(el, cb, threshold = 0.14) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { cb(e.target); obs.unobserve(e.target); } });
  }, { threshold });
  obs.observe(el);
}

/* ═══════════════════════
   LOADER
═══════════════════════ */
function initLoader() {
  const loader = $('#loader');
  const fill   = $('#loaderFill');
  const pct    = $('#loaderPct');
  if (!loader || !fill) return;

  document.body.classList.add('no-scroll');
  initLoaderCanvas();

  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 14 + 4;
    if (p >= 100) {
      p = 100;
      clearInterval(iv);
      fill.style.width = '100%';
      if (pct) pct.textContent = '100%';
      setTimeout(() => {
        loader.classList.add('out');
        document.body.classList.remove('no-scroll');
        triggerHeroIn();
      }, 480);
    } else {
      fill.style.width = p + '%';
      if (pct) pct.textContent = Math.floor(p) + '%';
    }
  }, 55);
}

/* Loader canvas – falling gold particles */
function initLoaderCanvas() {
  const c = $('#loaderCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = c.width  = window.innerWidth;
    H = c.height = window.innerHeight;
  }

  class Pt {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : -8;
      this.vy = Math.random() * 1.2 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.r  = Math.random() * 1.6 + 0.5;
      this.a  = Math.random() * 0.5 + 0.15;
    }
    update() {
      this.y += this.vy; this.x += this.vx;
      if (this.y > H + 8) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,169,110,${this.a})`;
      ctx.fill();
    }
  }

  resize();
  pts = Array.from({ length: 80 }, () => new Pt());

  let raf;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }
  loop();
  window.addEventListener('resize', resize, { passive: true });

  // Stop when loader hides
  const obs = new MutationObserver(() => {
    if ($('#loader').classList.contains('out')) cancelAnimationFrame(raf);
  });
  obs.observe($('#loader'), { attributes: true, attributeFilter: ['class'] });
}

/* ═══════════════════════
   HERO ANIMATIONS
═══════════════════════ */
function triggerHeroIn() {
  // GSAP path
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline();
    tl.to('.hero__eyebrow', { opacity:1, y:0, duration:.8, ease:'power3.out' })
      .to('.hl',  { opacity:1, y:0, duration:.9, stagger:.1, ease:'power3.out' }, '-=.4')
      .to('.hero__sub',   { opacity:1, y:0, duration:.8, ease:'power3.out' }, '-=.5')
      .to('.hero__btns',  { opacity:1, y:0, duration:.7, ease:'power3.out' }, '-=.4')
      .to('.hero__stats', { opacity:1, y:0, duration:.7, ease:'power3.out' }, '-=.4')
      .to('.hero__visual',{ opacity:1, x:0, duration:1,  ease:'power3.out' }, '-=.6');
  } else {
    // CSS fallback
    const els = $$('.hero__eyebrow,.hl,.hero__sub,.hero__btns,.hero__stats,.hero__visual');
    els.forEach((el, i) => setTimeout(() => el.classList.add('in'), i * 90 + 80));
  }

  initHeroCanvas();
  initCounters();
}

/* ═══════════════════════
   HERO CANVAS (particles net)
═══════════════════════ */
function initHeroCanvas() {
  const c = $('#heroCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = c.width  = c.offsetWidth;
    H = c.height = c.offsetHeight;
  }

  class Dot {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - .5) * .35;
      this.vy = (Math.random() - .5) * .35;
      this.r  = Math.random() * 1.4 + .4;
      this.a  = Math.random() * .4 + .1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(200,169,110,${this.a})`; ctx.fill();
    }
  }

  function connect() {
    for (let i = 0; i < pts.length; i++)
      for (let j = i+1; j < pts.length; j++) {
        const dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(200,169,110,${.055*(1-d/110)})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
  }

  function loop() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => { p.update(); p.draw(); });
    connect();
    requestAnimationFrame(loop);
  }

  resize();
  pts = Array.from({ length: 55 }, () => new Dot());
  loop();
  window.addEventListener('resize', resize, { passive:true });
}

/* ═══════════════════════
   COUNTERS
═══════════════════════ */
function initCounters() {
  $$('.cnt').forEach(el => {
    const target = parseInt(el.dataset.to, 10);
    let cur = 0;
    const step = target / 55;
    onVisible(el, () => {
      const iv = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(iv); }
        el.textContent = Math.floor(cur);
      }, 28);
    }, 0.5);
  });
}

/* ═══════════════════════
   NAV
═══════════════════════ */
function initNav() {
  const nav    = $('#nav');
  const burger = $('#burgerBtn');
  const mob    = $('#mobMenu');
  if (!nav) return;

  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive:true });

  if (burger && mob) {
    burger.addEventListener('click', () => {
      const open = mob.classList.toggle('on');
      burger.classList.toggle('on', open);
      burger.setAttribute('aria-expanded', open);
      mob.setAttribute('aria-hidden', !open);
      document.body.classList.toggle('no-scroll', open);
    });
    $$('a', mob).forEach(a => a.addEventListener('click', () => {
      mob.classList.remove('on'); burger.classList.remove('on');
      burger.setAttribute('aria-expanded', false);
      mob.setAttribute('aria-hidden', true);
      document.body.classList.remove('no-scroll');
    }));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mob.classList.contains('on')) {
        mob.classList.remove('on'); burger.classList.remove('on');
        burger.setAttribute('aria-expanded', false);
        mob.setAttribute('aria-hidden', true);
        document.body.classList.remove('no-scroll');
        burger.focus();
      }
    });
  }
}

/* ═══════════════════════
   CURSOR
═══════════════════════ */
function initCursor() {
  const cur = $('.cursor');
  const fol = $('.cursor-f');
  if (!cur || !fol) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  });

  (function loop() {
    fx += (mx - fx) * .11; fy += (my - fy) * .11;
    fol.style.left = fx + 'px'; fol.style.top = fy + 'px';
    requestAnimationFrame(loop);
  })();

  $$('a,button,.srv-card,.port-card,.tc').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('hov'); fol.classList.add('hov'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('hov'); fol.classList.remove('hov'); });
  });
}

/* ═══════════════════════
   SCROLL REVEAL
═══════════════════════ */
function initReveal() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Section headers
    $$('.sec-label,.sec-title,.sec-sub').forEach(el => {
      gsap.fromTo(el,{opacity:0,y:22},{opacity:1,y:0,duration:.8,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });

    // About
    gsap.fromTo('.about__photos',{opacity:0,x:-36},{opacity:1,x:0,duration:1,ease:'power3.out',
      scrollTrigger:{trigger:'.about',start:'top 75%',once:true}});
    gsap.fromTo('.about__txt',{opacity:0,x:36},{opacity:1,x:0,duration:1,delay:.12,ease:'power3.out',
      scrollTrigger:{trigger:'.about',start:'top 75%',once:true}});

    // Services
    $$('.srv-card').forEach((el,i) => {
      gsap.fromTo(el,{opacity:0,y:28},{opacity:1,y:0,duration:.7,delay:i*.1,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });

    // Portfolio
    $$('.port-card').forEach((el,i) => {
      gsap.fromTo(el,{opacity:0,y:36},{opacity:1,y:0,duration:.8,delay:i*.12,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });

    // Testimonials
    $$('.tc').forEach((el,i) => {
      gsap.fromTo(el,{opacity:0,y:28},{opacity:1,y:0,duration:.8,delay:i*.1,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });

    // Parallax orbs
    gsap.to('.h-orb1',{y:-80,ease:'none',scrollTrigger:{trigger:'.hero',scrub:true,start:'top top',end:'bottom top'}});
    gsap.to('.h-orb2',{y:-50,ease:'none',scrollTrigger:{trigger:'.hero',scrub:true,start:'top top',end:'bottom top'}});

  } else {
    // Fallback IO
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .13 });
    $$('.sec-label,.sec-title,.sec-sub,.about__photos,.about__txt,.srv-card,.port-card,.tc').forEach(el => io.observe(el));
  }
}

/* ═══════════════════════
   CONTACT FORM
═══════════════════════ */
function initForm() {
  const form = $('#contactForm');
  const ok   = $('#formOk');
  if (!form) return;

  // ─────────────────────────────────────────────
  // Formspree endpoint – כדי לחבר:
  // 1. היכנסי ל- https://formspree.io
  // 2. הירשמי בחינם עם 27dorin12@gmail.com
  // 3. צרי "New Form" → תקבלי קוד כמו: xpwzabcd
  // 4. החליפי את YOUR_FORM_ID בקוד שקיבלת
  // ─────────────────────────────────────────────
  const FORMSPREE_URL = 'https://formspree.io/f/xlgpojek';

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nameEl  = $('#cName');
    const phoneEl = $('#cPhone');
    let valid = true;

    [nameEl, phoneEl].forEach(f => {
      if (!f || !f.value.trim()) {
        f.style.borderColor = 'rgba(255,100,100,.6)';
        valid = false;
      } else {
        f.style.borderColor = '';
      }
    });
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = 'שולח...'; btn.disabled = true; }

    const data = {
      name:    nameEl.value.trim(),
      phone:   phoneEl.value.trim(),
      message: $('#cMsg')?.value.trim() || ''
    };

    try {
      const res = await fetch(FORMSPREE_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(data)
      });

      if (res.ok) {
        // Success
        form.reset();
        if (ok) { ok.classList.add('show'); ok.removeAttribute('aria-hidden'); }
        setTimeout(() => {
          if (ok) { ok.classList.remove('show'); ok.setAttribute('aria-hidden', 'true'); }
        }, 6000);
      } else {
        // Formspree error – fallback to mailto
        _fallbackMailto(data);
      }
    } catch {
      // Network error – fallback to mailto
      _fallbackMailto(data);
    } finally {
      if (btn) { btn.textContent = 'שלחו הודעה'; btn.disabled = false; }
    }
  });

  function _fallbackMailto(data) {
    const subject = encodeURIComponent('פנייה חדשה מאתר WebRise');
    const body = encodeURIComponent(`שם: ${data.name}\nטלפון: ${data.phone}\nהודעה:\n${data.message}`);
    window.location.href = `mailto:27dorin12@gmail.com?subject=${subject}&body=${body}`;
  }

  $$('#contactForm input, #contactForm textarea').forEach(f => {
    f.addEventListener('input', () => { if (f.value.trim()) f.style.borderColor = ''; });
  });
}

/* ═══════════════════════
   A11Y WIDGET
═══════════════════════ */
function initA11y() {
  const btn   = $('#a11yBtn');
  const panel = $('#a11yPanel');
  const cBtn  = $('#a11yC');
  const fBtn  = $('#a11yF');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    const on = panel.classList.toggle('on');
    panel.setAttribute('aria-hidden', !on);
    btn.setAttribute('aria-expanded', on);
  });
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !panel.contains(e.target)) {
      panel.classList.remove('on');
      panel.setAttribute('aria-hidden', 'true');
    }
  });

  if (cBtn) cBtn.addEventListener('click', () => {
    const on = document.body.classList.toggle('hc');
    cBtn.setAttribute('aria-pressed', on);
  });

  if (fBtn) fBtn.addEventListener('click', () => {
    const on = document.body.classList.toggle('lg');
    fBtn.setAttribute('aria-pressed', on);
  });
}

/* ═══════════════════════
   SMOOTH SCROLL
═══════════════════════ */
function initSmooth() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const off = $('#nav')?.offsetHeight || 70;
      window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - off, behavior:'smooth' });
    });
  });
}

/* ═══════════════════════
   MISC
═══════════════════════ */
function initYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
}

function initSkipLink() {
  const skip = document.createElement('a');
  skip.href = '#content'; skip.className = 'skip-link';
  skip.textContent = 'דילוג לתוכן הראשי';
  document.body.insertBefore(skip, document.body.firstChild);
}

/* ═══════════════════════
   PHOTO FALLBACK
   (replace 'girl.png' with actual photo path when available)
═══════════════════════ */
function initPhotoFallback() {
  $$('img[src="images/dorin.jpg"], img[src="images/shir.jpg"]').forEach(img => {
    img.addEventListener('error', () => {
      const parent = img.closest('.hero__photo-main,.hero__photo-second,.about__ph,.contact__us-photo');
      if (!parent) return;
      img.style.display = 'none';
      if (!parent.querySelector('.ph-placeholder')) {
        const ph = document.createElement('div');
        ph.className = 'ph-placeholder';
        ph.setAttribute('aria-hidden','true');
        ph.style.cssText = `
          width:100%;height:100%;min-height:340px;
          background:linear-gradient(135deg,#1a1a2e,#2d1a4a);
          display:flex;align-items:center;justify-content:center;
          font-size:3.5rem;font-weight:900;color:rgba(200,169,110,.35);
          border-radius:inherit;
        `;
        ph.textContent = 'WR';
        parent.appendChild(ph);
      }
    });
  });
}

/* ─ BOOT ─ */
document.addEventListener('DOMContentLoaded', () => {
  initSkipLink();
  initLoader();   // fires triggerHeroIn() internally after load
  initCursor();
  initNav();
  initReveal();
  initForm();
  initA11y();
  initSmooth();
  initYear();
  initPhotoFallback();
});

/* ═══════════════════════
   MODALS
═══════════════════════ */
function initModals() {
  // Open
  document.querySelectorAll('.open-modal').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.dataset.modal;
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      modal.querySelector('.modal__close')?.focus();
    });
  });

  // Close via backdrop or X button
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => closeModal(el.closest('.modal')));
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.open').forEach(closeModal);
    }
  });

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }
}

document.addEventListener('DOMContentLoaded', () => { initModals(); });

(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = !reduceMotion;

  /* ================= INTRO VIDEO (reference behaviour: video -> Skip Intro -> fade into hero) ================= */
  const introScreen = document.getElementById('intro-screen');
  const introVideo = document.getElementById('intro-video');
  const skipIntroBtn = document.getElementById('skip-intro');
  const site = document.getElementById('site');
  document.body.style.overflow = 'hidden';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  setTimeout(() => skipIntroBtn.classList.add('show'), 800);

  function endIntro() {
    if (introScreen.classList.contains('fade-out')) return;
    introScreen.classList.add('fade-out');
    startMusic();
    document.body.style.overflow = '';
    gsap.to(site, { opacity: 1, duration: 1.4, ease: 'power2.out' });
    setTimeout(() => introScreen.remove(), 1400);
    initScrollAnimations();
  }
  introVideo.addEventListener('ended', endIntro);
  introVideo.addEventListener('error', endIntro);
  const introSrc = introVideo.querySelector('source');
  if (introSrc) introSrc.addEventListener('error', endIntro);
  skipIntroBtn.addEventListener('click', endIntro);
  /* the film does not start by itself: the poster (first frame) waits until the visitor taps */
  const playBtn = document.getElementById('intro-play');
  let started = false;
  function startIntro() {
    if (started) return; started = true;
    playBtn.classList.add('hide');
    startMusic();
    introVideo.play().catch(endIntro);
    setTimeout(() => { if (!introScreen.classList.contains('fade-out') && introVideo.currentTime < 0.05) endIntro(); }, 4500); /* never started */
    setTimeout(endIntro, 14000);                                                                                              /* hard safety */
  }
  playBtn.addEventListener('click', startIntro);

/* ================= LENIS SMOOTH SCROLL ================= */
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.15, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    function backToTop() { lenis.scrollTo(0, { duration: 1.6 }); }

    /* ================= CURSOR GLOW + PARALLAX (mouse devices only) ================= */
    const glow = document.getElementById('cursor-glow');
    const parallaxLayers = document.querySelectorAll('.bg-layer');
    const hasFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    if (hasFinePointer) {
      let rafPending = false;
      let mouseX = 0, mouseY = 0;
      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          gsap.to(glow, { x: mouseX, y: mouseY, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
          const dx = (mouseX / window.innerWidth - 0.5) * 20;
          const dy = (mouseY / window.innerHeight - 0.5) * 20;
          parallaxLayers.forEach(l => gsap.to(l, { x: dx, y: dy, duration: 1.4, ease: 'power2.out', overwrite: 'auto' }));
        });
      }, { passive: true });
    }

    /* ================= PETALS + PARTICLES ================= */
    const isMobile = window.innerWidth < 640 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    const petalField = document.getElementById('petal-field');
    const petalChars = ['🌸', '🌺', '❀', '✿'];
    const petalCount = isMobile ? 3 : 6;
    for (let i = 0; i < petalCount; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.textContent = petalChars[Math.floor(Math.random() * petalChars.length)];
      p.style.left = Math.random() * 100 + 'vw';
      p.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
      p.style.animationDuration = (20 + Math.random() * 14) + 's';
      p.style.animationDelay = (Math.random() * 20) + 's';
      p.style.fontSize = (10 + Math.random() * 7) + 'px';
      petalField.appendChild(p);
    }
    const particleField = document.getElementById('particles');
    const sparkCount = isMobile ? 5 : 10;
    for (let i = 0; i < sparkCount; i++) {
      const s = document.createElement('div');
      s.className = 'spark';
      s.style.left = Math.random() * 100 + 'vw';
      s.style.top = Math.random() * 100 + 'vh';
      s.style.animationDelay = (Math.random() * 4) + 's';
      particleField.appendChild(s);
    }
    /* lanterns in footer */
    const lanternField = document.getElementById('lantern-field');
    const lanternIcons = ['🏮', '✨'];
    const lanternCount = isMobile ? 5 : 8;
    for (let i = 0; i < lanternCount; i++) {
      const l = document.createElement('div');
      l.className = 'lantern'; l.textContent = lanternIcons[i % 2];
      l.style.left = (8 + Math.random() * 84) + '%';
      l.style.top = (10 + Math.random() * 70) + '%';
      l.style.animationDelay = (Math.random() * 6) + 's';
      l.style.animationDuration = (7 + Math.random() * 4) + 's';
      lanternField.appendChild(l);
    }

    /* ================= HERO NAME REVEAL ================= */
    function splitHeroNames() {
      document.querySelectorAll('#hero-names .name-part').forEach(part => {
        const text = part.textContent;
        part.innerHTML = text.split('').map(ch => `<span class="char">${ch}</span>`).join('');
      });
    }
    splitHeroNames();

    /* ================= SCROLL ANIMATIONS (init after intro) ================= */
    function initScrollAnimations() {
      gsap.to('#hero .char', {
        opacity: 1, y: 0, rotate: 0, duration: 1, ease: 'back.out(1.7)',
        stagger: 0.045, delay: 0.2
      });
      gsap.from('.monogram, .hero-sub', {
        opacity: 0, y: 20, duration: 1, stagger: 0.15, delay: 0.1
      });

      gsap.utils.toArray('.section').forEach((sec) => {
        if (sec.id === 'hero') return;
        gsap.from(sec.querySelectorAll('.eyebrow, h2, .divider, .couple-copy, .section-sub'), {
          opacity: 0, y: 60, duration: 1, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sec, start: 'top 75%' }
        });
      });

      /* event illustrations float up gently; details fade in after them */
      gsap.utils.toArray('.event').forEach((ev) => {
        const art = $('.event-art', ev), body = $('.event-body', ev);
        gsap.from(art, { opacity: 0, y: 30, scale: 0.97, duration: 0.9, ease: 'power3.out', clearProps: 'transform',
          scrollTrigger: { trigger: ev, start: 'top 82%', once: true } });
        gsap.from(body, { opacity: 0, y: 24, duration: 0.8, delay: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: ev, start: 'top 78%', once: true } });
      });

      gsap.utils.toArray('.tl-item').forEach((item) => {
        gsap.to(item, {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 85%' }
        });
      });

      gsap.from('.venue-row', {
        opacity: 0, y: 30, duration: 0.9, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: '.location-card', start: 'top 82%' }
      });

      gsap.from('.rsvp-card', { opacity: 0, y: 60, duration: 1, scrollTrigger: { trigger: '.rsvp-card', start: 'top 80%' } });
      gsap.to('#hero .bg-content, #hero .scroll-cue', { opacity: 0.15, filter: 'blur(4px)', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 } });

      buildJourney();
      ScrollTrigger.refresh();
    }

    /* ================= GALLERY PHOTO WALL — enter / drift / parallax / touch ================= */
    function initGalleryWall() {
      const wall = document.getElementById('photoWall');
      if (!wall) return;
      const cards = wall.querySelectorAll('.photo-card');
      if (!cards.length) return;

      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function revealCard(card) {
        if (card.classList.contains('is-in')) return;
        card.classList.add('is-in');
      }

      if (reduceMotion || !('IntersectionObserver' in window)) {
        cards.forEach(revealCard);
      } else {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            revealCard(en.target);
            io.unobserve(en.target);
          });
        }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
        cards.forEach((card) => io.observe(card));
      }

      /* touch bounce */
      cards.forEach((card) => {
        const clearTouch = () => card.classList.remove('is-touched');
        card.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'mouse') return;
          card.classList.add('is-touched');
          setTimeout(clearTouch, 560);
        }, { passive: true });
      });

      if (reduceMotion) return;

      /* subtle scroll parallax, driven by gsap's ticker so it stays in sync with Lenis */
      const speeds = [];
      cards.forEach((card, i) => {
        const raw = parseFloat(card.getAttribute('data-speed'));
        speeds[i] = isNaN(raw) ? ((i % 2 === 0) ? 0.04 : -0.03) : raw;
      });

      let tickerActive = true;
      function updateParallax() {
        if (!tickerActive) return;
        const vh = window.innerHeight || 1;
        const mid = vh * 0.5;
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          if (!card.classList.contains('is-in')) continue;
          const rect = card.getBoundingClientRect();
          if (rect.bottom < -100 || rect.top > vh + 100) continue;
          let offset = (rect.top + rect.height * 0.5 - mid) * speeds[i];
          if (offset > 15) offset = 15;
          if (offset < -15) offset = -15;
          card.style.setProperty('--parallax-y', offset.toFixed(1) + 'px');
        }
      }
      gsap.ticker.add(updateParallax);

      /* Pause parallax when gallery is out of view to save CPU */
      const gallery = document.getElementById('gallery');
      if (gallery) {
        const galleryObserver = new IntersectionObserver((entries) => {
          tickerActive = entries[0].isIntersecting;
        }, { rootMargin: '200px' });
        galleryObserver.observe(gallery);
      }
    }
    initGalleryWall();

    /* ================= SCRATCH CARD + GOLDEN BURST ================= */
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    const scratchHint = document.getElementById('scratch-hint');
    function sizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width; canvas.height = rect.height;
      drawScratchSurface();
    }
    function drawScratchSurface() {
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0, '#E9D6A6'); g.addColorStop(0.5, '#C9A55C'); g.addColorStop(1, '#B8934A');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '500 15px Poppins, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✦ SCRATCH HERE ✦', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '400 12px Poppins, sans-serif';
      ctx.fillText('to reveal our wedding date', canvas.width / 2, canvas.height / 2 + 14);
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!revealed && !scratching) sizeCanvas(); });

    let scratching = false, revealed = false;
    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      return { x: cx, y: cy };
    }
    function scratchAt(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.fill();
    }
    function goldenBurst() {
      const wrap = document.querySelector('.scratch-wrap');
      const rect = wrap.getBoundingClientRect();
      for (let i = 0; i < 26; i++) {
        const p = document.createElement('div');
        p.className = 'burst-particle';
        p.style.left = rect.left + rect.width / 2 + 'px';
        p.style.top = rect.top + rect.height / 2 + 'px';
        document.body.appendChild(p);
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 160;
        gsap.to(p, {
          x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
          opacity: 0, scale: 0.3, duration: 1 + Math.random() * 0.6, ease: 'power2.out',
          onComplete: () => p.remove()
        });
      }
    }
    function checkRevealed() {
      if (revealed) return;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0, total = data.length / 4;
      for (let i = 3; i < data.length; i += 4 * 20) { if (data[i] < 40) cleared++; }
      const pct = cleared / (total / 20);
      if (pct > 0.5) {
        revealed = true;
        scratchHint.classList.add('done');
        goldenBurst();
        gsap.to(canvas, { opacity: 0, duration: 0.8, onComplete: () => canvas.style.display = 'none' });
      }
    }
    canvas.addEventListener('mousedown', e => { scratching = true; const p = getPos(e); scratchAt(p.x, p.y); });
    canvas.addEventListener('mouseup', () => scratching = false);
    canvas.addEventListener('mouseleave', () => scratching = false);
    canvas.addEventListener('mousemove', e => { if (scratching) { const p = getPos(e); scratchAt(p.x, p.y); checkRevealed(); } });
    canvas.addEventListener('touchstart', e => { scratching = true; const p = getPos(e); scratchAt(p.x, p.y); }, { passive: true });
    canvas.addEventListener('touchend', () => scratching = false);
    canvas.addEventListener('touchmove', e => { if (scratching) { const p = getPos(e); scratchAt(p.x, p.y); checkRevealed(); } }, { passive: true });

    /* ================= COUNTDOWN ================= */
    const weddingDate = new Date('2027-01-31T10:15:00+05:30').getTime();
    function updateCountdown() {
      const now = Date.now();
      const diff = Math.max(0, weddingDate - now);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
      document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
      document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
      document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    /* ================= LOCATION: COPY / SHARE ================= */
    const toast = document.getElementById('copy-toast');
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    }
    function copyAddress(text) {
      navigator.clipboard?.writeText(text).then(() => showToast('Address copied'))
        .catch(() => showToast('Could not copy — please select manually'));
    }
    window.copyAddress = copyAddress;

    /* ================= BACKGROUND MUSIC (same track as the Jishnu & Vibha site) ================= */
    const player = document.getElementById('player');
    const music = document.getElementById('bg-music');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    let playing = false, resumeAfterHide = false;
    function setPlaying(on) {
      playing = on;
      player.classList.toggle('playing', on);
      player.setAttribute('aria-pressed', on ? 'true' : 'false');
      player.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
      iconPlay.style.display = on ? 'none' : 'block'; iconPause.style.display = on ? 'block' : 'none';
    }
    function startMusic() {
      if (playing || !music) return;
      music.play().then(() => setPlaying(true)).catch(() => { });   /* blocked without a tap: the player button stays available */
    }
    player.addEventListener('click', () => {
      if (!playing) music.play().then(() => setPlaying(true)).catch(() => showToast('Could not play the music'));
      else { music.pause(); setPlaying(false); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && playing) { music.pause(); resumeAfterHide = true; }
      else if (!document.hidden && resumeAfterHide) { resumeAfterHide = false; music.play().catch(() => setPlaying(false)); }
    });


    /* ================= LIGHTBOX (event illustrations + couple photographs) ================= */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    let lbList = [], lightboxIndex = 0, lbReturnFocus = null;
    function updateLightboxImage() {
      const item = lbList[lightboxIndex];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
    }
    function openLightbox(list, i, isArt) {
      lbList = list; lightboxIndex = i;
      lbReturnFocus = document.activeElement;
      lightbox.classList.toggle('single', list.length < 2);
      lightbox.classList.toggle('art', !!isArt);
      updateLightboxImage();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lenis.stop();
      lightboxClose.focus();
    }
    function closeLightbox() {
      if (!lightbox.classList.contains('open')) return;
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lenis.start();
      if (lbReturnFocus && lbReturnFocus.focus) lbReturnFocus.focus();
    }
    function lightboxNext() { lightboxIndex = (lightboxIndex + 1) % lbList.length; updateLightboxImage(); }
    function lightboxPrev() { lightboxIndex = (lightboxIndex - 1 + lbList.length) % lbList.length; updateLightboxImage(); }
    lightboxClose.addEventListener('click', closeLightbox);
    document.getElementById('lightbox-next').addEventListener('click', lightboxNext);
    document.getElementById('lightbox-prev').addEventListener('click', lightboxPrev);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight' && lbList.length > 1) lightboxNext();
      if (e.key === 'ArrowLeft' && lbList.length > 1) lightboxPrev();
    });
    /* swipe */
    let touchX = null;
    lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (touchX === null || lbList.length < 2) return;
      const dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 50) (dx < 0 ? lightboxNext : lightboxPrev)();
    });

    const onActivate = (el, fn) => {
      el.addEventListener('click', fn);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
    };
    /* couple photographs: love-story polaroids first, then the gallery wall (document order) */
    const photoEls = $$('[data-lb]');
    const photoList = photoEls.map((el) => { const im = $('img', el); return { src: im.dataset.full || im.currentSrc || im.src, alt: im.alt }; });
    photoEls.forEach((el, i) => onActivate(el, () => openLightbox(photoList, i, false)));

    /* ================= EVENTS: ANIMATED GOLD DOTTED JOURNEY LINE (SVG + GSAP ScrollTrigger) ================= */
    const SVGNS = 'http://www.w3.org/2000/svg';
    const J = document.getElementById('event-grid');
    const jsvg = document.getElementById('journey-svg');
    let journeyTween = null, rebuildTimer;
    const rel = (el, container) => { let x = 0, y = 0, n = el; while (n && n !== container) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight, cx: x + el.offsetWidth / 2 }; };
    const mkEl = (tag, attrs, parent) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
    const f1 = (n) => n.toFixed(1);
    /* smooth S-curve through points that all share a vertical tangent */
    const curveThrough = (pts) => {
      let d = `M${f1(pts[0].x)} ${f1(pts[0].y)}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], k = Math.max(b.y - a.y, 10) * 0.55;
        d += ` C${f1(a.x)} ${f1(a.y + k)} ${f1(b.x)} ${f1(b.y - k)} ${f1(b.x)} ${f1(b.y)}`;
      }
      return d;
    };
    /* gentle wave down a side margin: returns points between y0 and y1 at x ± amp */
    const wave = (x, y0, y1, amp, step) => {
      const pts = [{ x, y: y0 }]; let s = 1;
      for (let y = y0 + step; y < y1 - step * 0.5; y += step) { pts.push({ x: x + amp * s, y }); s = -s; }
      pts.push({ x, y: y1 }); return pts;
    };

    function buildJourney() {
      if (journeyTween) { journeyTween.scrollTrigger && journeyTween.scrollTrigger.kill(); journeyTween.kill(); journeyTween = null; }
      jsvg.innerHTML = '';
      const W = J.offsetWidth, H = J.offsetHeight;
      if (!W || !H) return;
      jsvg.setAttribute('viewBox', `0 0 ${W} ${H}`);

      const evs = $$('.event', J);
      const arts = evs.map((e) => rel($('.event-art', e), J));
      const bodies = evs.map((e) => rel($('.event-body', e), J));
      const stacked = window.innerWidth < 768;
      const parts = [];   /* each part = one SVG subpath; gaps = hidden stretches behind an illustration */
      let end;

      if (stacked) {
        /* phone: one continuous line that snakes down alternating side margins, crossing in the gaps between events */
        const xL = Math.min(24, Math.max(14, W * 0.045)), xR = W - xL, amp = Math.min(5, xL * 0.35);
        const side = (i) => (i % 2 === 0 ? xL : xR);
        let pts = [];
        evs.forEach((_, i) => {
          const x = side(i), a = arts[i], b = bodies[i];
          const y0 = i === 0 ? a.y + a.h * 0.22 : a.y - 6;
          const y1 = b.y + b.h + 4;
          const seg = wave(x, y0, y1, amp, 120);
          pts = pts.concat(seg);
        });
        end = { x: W / 2, y: bodies[2].y + bodies[2].h + 84 };
        pts.push(end);
        parts.push({ d: curveThrough(pts), gap: 0 });
      } else {
        /* desktop: S-curves swing from each illustration's base to the next illustration's crown */
        const base = (a) => ({ x: a.cx, y: a.y + a.h * 0.9 }), crown = (a) => ({ x: a.cx, y: a.y + a.h * 0.07 });
        for (let i = 0; i < evs.length - 1; i++) {
          const p0 = base(arts[i]), p1 = crown(arts[i + 1]);
          parts.push({ d: curveThrough([p0, p1]), gap: arts[i + 1].h * 0.83 });
        }
        const last = base(arts[evs.length - 1]);
        end = { x: W / 2, y: arts[evs.length - 1].y + arts[evs.length - 1].h + 96 };
        parts.push({ d: curveThrough([last, end]), gap: 0 });
      }

      const defs = mkEl('defs', {}, jsvg);
      const grad = mkEl('radialGradient', { id: 'glowG' }, defs);
      mkEl('stop', { offset: '0', 'stop-color': '#FFF4D6' }, grad);
      mkEl('stop', { offset: '.4', 'stop-color': '#E8C77F', 'stop-opacity': '.85' }, grad);
      mkEl('stop', { offset: '1', 'stop-color': '#B89558', 'stop-opacity': '0' }, grad);
      const sym = mkEl('symbol', { id: 'jas', viewBox: '0 0 40 40' }, defs);
      const petals = mkEl('g', { fill: '#FFFBF3', stroke: '#B89558', 'stroke-width': '.9' }, sym);
      [0, 60, 120, 180, 240, 300].forEach((r) => mkEl('ellipse', { cx: 20, cy: 10.5, rx: 4.4, ry: 9, transform: `rotate(${r} 20 20)` }, petals));
      mkEl('circle', { cx: 20, cy: 20, r: 2.8, fill: '#B89558' }, sym);
      const mask = mkEl('mask', { id: 'journeyMask', maskUnits: 'userSpaceOnUse', x: -60, y: -60, width: W + 120, height: H + 120 }, defs);
      const gTrack = mkEl('g', {}, jsvg);
      const gDots = mkEl('g', { mask: 'url(#journeyMask)' }, jsvg);

      let total = 0;
      const segs = parts.map((p) => {
        mkEl('path', { d: p.d, class: 'track' }, gTrack);
        mkEl('path', { d: p.d, class: 'dots' }, gDots);
        const mp = mkEl('path', { d: p.d, class: 'mask-path' }, mask);
        const len = mp.getTotalLength();
        mp.style.strokeDasharray = len; mp.style.strokeDashoffset = len;
        const s = { mp, len, from: total, gap: p.gap };
        total += len + p.gap;
        return s;
      });
      const orn = mkEl('use', { href: '#jas', x: end.x - 19, y: end.y - 19, width: 38, height: 38 }, jsvg);
      orn.style.opacity = 0; orn.style.transformOrigin = `${end.x}px ${end.y}px`;
      const glow = mkEl('circle', { r: 9, fill: 'url(#glowG)', opacity: 0 }, jsvg);
      const core = mkEl('circle', { r: 2.4, fill: '#FFF4D6', opacity: 0 }, jsvg);

      let ornOn = false;
      const showOrn = (on) => {
        if (ornOn === on) return; ornOn = on;
        if (animate) gsap.to(orn, { opacity: on ? 1 : 0, scale: on ? 1 : 0.6, duration: 0.8, ease: 'power2.out', overwrite: true });
        else orn.style.opacity = on ? 1 : 0;
      };
      const state = { p: 0 };
      const apply = () => {
        const pos = state.p * total;
        let lead = null;
        segs.forEach((s) => {
          const local = Math.min(1, Math.max(0, (pos - s.from) / s.len));
          s.mp.style.strokeDashoffset = s.len * (1 - local);
          if (local > 0 && local < 1) lead = { s, local };
        });
        showOrn(state.p > 0.985);
        if (!animate) return;
        if (lead) {
          const pt = lead.s.mp.getPointAtLength(lead.s.len * lead.local);
          glow.setAttribute('cx', pt.x); glow.setAttribute('cy', pt.y); core.setAttribute('cx', pt.x); core.setAttribute('cy', pt.y);
        }
        glow.setAttribute('opacity', lead ? 1 : 0); core.setAttribute('opacity', lead ? 1 : 0);
      };
      if (!animate) { state.p = 1; apply(); return; }

      const jTop = () => J.getBoundingClientRect().top + window.scrollY;
      const startY = segs.length ? (parts[0].d.match(/^M([\d.\-]+) ([\d.\-]+)/) || [0, 0, 0])[2] : 0;
      journeyTween = gsap.to(state, {
        p: 1, ease: 'none', onUpdate: apply,
        scrollTrigger: {
          trigger: J, scrub: 0.6, invalidateOnRefresh: true,
          start: () => jTop() + parseFloat(startY) - innerHeight * 0.72,
          end: () => jTop() + end.y - innerHeight * 0.55,
          onRefresh: apply
        }
      });
      apply();
    }
    function rebuildJourneySoon() {
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(() => { buildJourney(); ScrollTrigger.refresh(); }, 160);
    }
    if (window.ResizeObserver) {
      let lw = J.offsetWidth, lh = J.offsetHeight;
      new ResizeObserver(() => {
        if (J.offsetWidth === lw && J.offsetHeight === lh) return;
        lw = J.offsetWidth; lh = J.offsetHeight; rebuildJourneySoon();
      }).observe(J);
    } else window.addEventListener('resize', rebuildJourneySoon);
    window.addEventListener('orientationchange', rebuildJourneySoon);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuildJourneySoon);
    window.addEventListener('load', rebuildJourneySoon);
    $$('.event-art img', J).forEach((im) => { if (!im.complete) im.addEventListener('load', rebuildJourneySoon, { once: true }); });
    buildJourney();

    /* ================= RSVP FORM ================= */
    (function initRSVP() {
      const form = document.getElementById('rsvp-form');
      const btn = document.getElementById('rsvp-btn');
      const status = document.getElementById('rsvp-status');
      const eventsField = document.getElementById('events-field');
      const attendBtns = $$('.attend-toggle button[data-val]', form);
      const eventBtns = $$('button[data-event]', form);
      let attendValue = 'yes', submitting = false;

      const setErr = (name, msg) => {
        const el = $(`.err[data-for="${name}"]`, form); if (el) el.textContent = msg || '';
        const inp = form.elements[name];
        if (inp && inp.nodeType === 1) { msg ? inp.setAttribute('aria-invalid', 'true') : inp.removeAttribute('aria-invalid'); }
      };
      const say = (msg, cls) => { status.className = 'rsvp-status ' + (cls || ''); status.textContent = msg; };

      attendBtns.forEach((b) => b.addEventListener('click', () => {
        attendBtns.forEach((x) => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('active'); b.setAttribute('aria-pressed', 'true');
        attendValue = b.dataset.val;
        const no = attendValue === 'no';
        eventsField.style.display = no ? 'none' : '';
        if (no) { eventBtns.forEach((x) => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); }); setErr('events', ''); }
      }));
      eventBtns.forEach((b) => b.addEventListener('click', () => {
        const on = !b.classList.contains('active');
        b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); setErr('events', '');
      }));
      form.addEventListener('input', (e) => { if (e.target.name) setErr(e.target.name, ''); });

      function validate() {
        let ok = true, first = null;
        const bad = (n, m, focusEl) => { setErr(n, m); ok = false; if (!first) first = focusEl || form.elements[n]; };
        const name = form.elements.name.value.trim(), phone = form.elements.phone.value.trim();
        const guests = parseInt(form.elements.guests.value, 10);
        if (name.length < 2) bad('name', 'Please enter your name.');
        const digits = phone.replace(/\D/g, '');
        if (!/^[+\d][\d\s\-()]*$/.test(phone) || digits.length < 8 || digits.length > 15) bad('phone', 'Please enter a valid phone number.');
        if (!Number.isInteger(guests) || guests < 1 || guests > 10) bad('guests', 'Guests must be between 1 and 10.');
        if (attendValue === 'yes' && !eventBtns.some((b) => b.classList.contains('active'))) bad('events', 'Please choose at least one event.', eventBtns[0]);
        if (first && first.focus) first.focus();
        return ok;
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (document.getElementById('r-website').value) return;            /* honeypot */
        if (!validate()) { say('Please check the highlighted fields.', 'is-bad'); return; }
        const endpoint = ((window.SITE_CONFIG || {}).RSVP_ENDPOINT || '').trim();
        if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(endpoint)) {
          say('Online RSVP is not switched on yet, so your response has not been sent. Please confirm your attendance with the family directly.', 'is-bad');
          return;
        }
        const payload = {
          submissionId: (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2)),
          name: form.elements.name.value.trim(),
          phone: form.elements.phone.value.trim(),
          guests: form.elements.guests.value,
          attending: attendValue,
          events: eventBtns.filter((b) => b.classList.contains('active')).map((b) => b.dataset.event),
          message: form.elements.message.value.trim()
        };
        submitting = true; btn.disabled = true; const label = btn.textContent; btn.textContent = 'Submitting…'; say('');
        const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 20000);
        try {
          const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), signal: ctl.signal });
          const data = await res.json();
          if (!res.ok || data.result !== 'success') throw new Error(data.error || 'Server error');
          form.style.display = 'none';
          document.getElementById('rsvp-success').classList.add('show');
        } catch (err) {
          say('Sorry, we could not send your RSVP. Please check your connection and try again.', 'is-bad');
          btn.disabled = false; btn.textContent = label;
        } finally { clearTimeout(to); submitting = false; }
      });
    })();

    if (reduceMotion) endIntro();   /* reduced-motion visitors go straight to the invitation */
})();

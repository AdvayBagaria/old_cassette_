(function() {
    var theme = 'dark';
    try {
      var saved = window.localStorage.getItem('old-cassette-oc-theme');
      if (saved === 'light') theme = 'light';
    } catch (e) {}
    document.documentElement.dataset.theme = theme;
  })();

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const html = document.documentElement;
  const animatedView = document.getElementById('animated-view');
  const progressBar = document.getElementById('reading-progress-bar');
  const themeToggle = document.getElementById('theme-toggle');
  const pdfLink = document.getElementById('pdf-download');

  const STORAGE_PREFIX = 'old-cassette-';
  const storage = {
    get(key, fallback) {
      try {
        const namespaced = STORAGE_PREFIX + key;
        const value = window.localStorage.getItem(namespaced);
        return value === null ? fallback : value;
      } catch (err) {
        return fallback;
      }
    },
set(key, value) {
       try {
         const namespaced = STORAGE_PREFIX + key;
         window.localStorage.setItem(namespaced, value);
       } catch (err) {}
     }
  };

  function setTheme(theme) {
    html.dataset.theme = theme;
    if (themeToggle) {
      themeToggle.textContent = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
      themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'false' : 'true');
      themeToggle.classList.toggle('active', theme === 'light');
    }
    storage.set('oc-theme', theme);
  }


  function initProgressBar() {
    if (!progressBar) return;
    let ticking = false;
    let scrollHeightCached = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    window.addEventListener('resize', () => {
      scrollHeightCached = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    }, { passive: true });
const update = () => {
       const scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;
       const scrolled = scrollHeightCached > 0 ? (scrollTop / scrollHeightCached) * 100 : 0;
       progressBar.style.width = `${Math.min(100, Math.max(0, scrolled))}%`;
       progressBar.setAttribute('aria-valuenow', Math.round(scrolled).toString());
       ticking = false;
     };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  function initSkipLink() {
    const skipLink = document.getElementById('skip-link');
    const mainContent = document.getElementById('animated-view');
    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function initToolbar() {

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        setTheme(html.dataset.theme === 'light' ? 'dark' : 'light');
      });
    }

    if (pdfLink) {
      pdfLink.setAttribute('aria-label', 'Download the writeup as a PDF');
    }

    const binLink = document.getElementById('bin-download');
    const solverLink = document.getElementById('solver-download');
    const challengeLink = document.getElementById('challenge-link');
    if (binLink) binLink.setAttribute('aria-label', 'Download the challenge binary');
    if (solverLink) solverLink.setAttribute('aria-label', 'Download the solver script');
    if (challengeLink) challengeLink.setAttribute('aria-label', 'Open the official challenge page in a new tab');
  }

  function initCopyButtons() {
    const blocks = animatedView ? animatedView.querySelectorAll('pre') : document.querySelectorAll('pre');
    blocks.forEach((pre, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'copyable-block';

      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = 'COPY';

btn.addEventListener('click', async () => {
         const text = pre.textContent.replace(/\n+$/g, '');
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'COPIED!';
          btn.classList.add('is-copied');
          window.setTimeout(() => {
            btn.textContent = 'COPY';
            btn.classList.remove('is-copied');
          }, 1400);
} catch (err) {
           btn.textContent = 'FAILED';
          window.setTimeout(() => {
            btn.textContent = 'COPY';
          }, 1400);
        }
      });

      wrapper.appendChild(btn);
    });
  }

  function makeDisclosureToggles() {
    document.querySelectorAll('.rabbit-header, .dd-header').forEach(hdr => {


      const parent = hdr.parentElement;
      const setExpanded = () => {
        const open = parent.classList.contains('open');
        hdr.setAttribute('aria-expanded', String(open));
      };

      hdr.addEventListener('click', () => {
        parent.classList.toggle('open');
        setExpanded();
      });

      hdr.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          parent.classList.toggle('open');
          setExpanded();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          if (parent.classList.contains('open')) {
            parent.classList.remove('open');
            setExpanded();
          }
        }
      });

      setExpanded();
    });
  }

  function initBootSequence() {
    const title = document.querySelector('#boot-sequence .hero-title');
    const meta = document.querySelector('#boot-sequence .hero-meta');
    const bootLines = document.querySelectorAll('#boot-sequence .boot-text');

    if (!title || !meta || !bootLines.length) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotion = motionQuery.matches;

    if (reducedMotion) {
      bootLines.forEach(line => {
        line.style.opacity = '1';
        line.style.display = 'block';
      });
      title.style.opacity = '1';
      title.textContent = 'OLD CASSETTE';
      meta.style.opacity = '1';
      return;
    }

    let delay = 450;
    bootLines.forEach((line, index) => {
      line.style.opacity = '0';
      window.setTimeout(() => {
        line.style.opacity = '1';
        if (index === 2) {
          body.classList.add('boot-filter');
          window.setTimeout(() => {
            body.classList.remove('boot-filter');
          }, 120);
        }
      }, delay);
      delay += 580;
    });

    window.setTimeout(() => {
      const boot = document.getElementById('boot-sequence');
      if (boot) boot.style.justifyContent = 'flex-start';

      bootLines.forEach(line => {
        line.style.display = 'none';
      });

      title.style.opacity = '1';
      title.textContent = '';

      const text = 'OLD CASSETTE';
      let index = 0;
      const typer = window.setInterval(() => {
        title.textContent = text.slice(0, index);
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        title.appendChild(cursor);
        index += 1;
        if (index > text.length) {
          window.clearInterval(typer);
          title.textContent = text;
          meta.style.opacity = '1';
        }
      }, 90);
    }, delay + 420);
  }

  

  function initEmulatorWidget() {
    const emuCanvas = document.getElementById('emu-display');
    const emuCtx = emuCanvas && emuCanvas.getContext ? emuCanvas.getContext('2d') : null;
    const btnPlay = document.getElementById('emu-play');
    const btnStep = document.getElementById('emu-step');
    const regVA = document.getElementById('reg-va');
    const regVB = document.getElementById('reg-vb');

if (!emuCanvas || !emuCtx || !btnPlay || !btnStep || !regVA || !regVB) {
       return;
     }

    const characters = ['', 'T', 'TH', 'THE', 'THEM', 'THEM?', 'WAITING...'];
    const vaVals = ['00', 'A1', '3F', '8C', '12', 'E4', '??'];
    const vbVals = ['00', 'B2', '11', '9A', '55', '7C', '??'];
    let emuState = 0;
    let emuTimer = null;

    const draw = () => {
      const width = emuCanvas.width;
      const height = emuCanvas.height;
      emuCtx.fillStyle = '#000';
      emuCtx.fillRect(0, 0, width, height);
      emuCtx.fillStyle = '#00ff41';
      emuCtx.font = '24px ui-monospace, SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace';
      emuCtx.fillText(characters[emuState], 10, 30);
      regVA.textContent = `VA: 0x${vaVals[emuState]}`;
      regVB.textContent = `VB: 0x${vbVals[emuState]}`;
    };

    const stop = () => {
      if (emuTimer) {
        clearInterval(emuTimer);
        emuTimer = null;
      }
    };

    const stepOnce = () => {
      emuState = Math.min(characters.length - 1, emuState + 1);
      draw();
    };

    btnStep.addEventListener('click', () => {
      stop();
      stepOnce();
    });

    btnPlay.addEventListener('click', () => {
      stop();
      emuState = 0;
      draw();
      emuTimer = setInterval(() => {
        if (emuState < characters.length - 1) {
          emuState += 1;
          draw();
        } else {
          stop();
        }
      }, 800);
    });

    draw();
  }

  function initPrngWidget() {
    const prngGrid = document.querySelector('.prng-grid');
    const btnPrng = document.getElementById('btn-prng-play');
    const prngStep = document.getElementById('prng-step');
    if (!prngGrid || !btnPrng || !prngStep) return;

    const dots = [];
    for (let i = 0; i < 100; i += 1) {
      const dot = document.createElement('div');
      dot.className = 'prng-dot';
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      prngGrid.appendChild(dot);
      dots.push(dot);
    }

    let running = false;
    let timer = null;

    const reset = () => {
      dots.forEach(dot => dot.classList.remove('active', 'cycle'));
      prngGrid.style.boxShadow = 'none';
      prngStep.textContent = 'STEP: 0';
      btnPrng.textContent = 'SEARCH >>';
    };

    btnPrng.addEventListener('click', () => {
      if (timer) clearInterval(timer);
      timer = null;
      if (running) {
        running = false;
        reset();
        btnPrng.disabled = false;
        return;
      }
      running = true;
      reset();
      btnPrng.disabled = true;
      btnPrng.textContent = 'SEARCHING...';

      let i = 0;
      timer = setInterval(() => {
        if (i > 0 && dots[i - 1]) dots[i - 1].classList.remove('active');
        if (i < dots.length) {
          dots[i].classList.add('active');
          prngStep.textContent = `STEP: ${i}`;
          if (i >= 31 && i < 65) {
            dots[i].classList.add('cycle');
            if (i === 31) prngGrid.style.boxShadow = '0 0 30px rgba(0,229,255,0.5)';
          }
          i += 1;
        } else {
          clearInterval(timer);
          timer = null;
          running = false;
          btnPrng.disabled = false;
          btnPrng.textContent = 'SEARCH >>';
        }
      }, 50);
    });
  }

  function initTimerRace() {
    const btnRace = document.getElementById('btn-race');
    const timerLeft = document.getElementById('timer-bf');
    const fillLeft = document.getElementById('fill-bf');
    const timerRight = document.getElementById('timer-math');
    const fillRight = document.getElementById('fill-math');
    if (!btnRace || !timerLeft || !fillLeft || !timerRight || !fillRight) return;

    const TRILLION_STEPS = 1095216660225n;
    const CYCLE_LENGTH = 34n;
    const ADVANCE_PER_LATE_CHAR = TRILLION_STEPS % CYCLE_LENGTH;
    let running = false;
    let timer = null;
    let rafHandle = null;

    const formatBigInt = (value) => {
      const str = value.toString();
      return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    btnRace.addEventListener('click', () => {
      if (running) return;
      running = true;
      btnRace.disabled = true;
      btnRace.textContent = 'CALCULATING...';

      timerLeft.textContent = '∞ years';
      fillLeft.style.width = '0%';
      timerRight.textContent = formatBigInt(ADVANCE_PER_LATE_CHAR);
      fillRight.style.width = '100%';

      let progress = 0;
      const duration = 2000;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = Math.min(currentTime - startTime, duration);
        progress = elapsed / duration;

        if (progress < 0.8) {
          const steps = BigInt(Math.floor(Number(TRILLION_STEPS) * progress));
          timerLeft.textContent = formatBigInt(steps) + ' steps';
          fillLeft.style.width = `${Math.min(100, progress * 125)}%`;
          rafHandle = requestAnimationFrame(animate);
        } else {
          timerLeft.textContent = '1,095,216,660,225 steps';
          timerLeft.style.fontSize = '18px';
          fillLeft.style.width = '100%';

          setTimeout(() => {
            timerLeft.innerHTML = '<small>1,095,216,660,225 mod 34 =</small><div style=\"font-size: 32px; margin-top: 5px;\">' + formatBigInt(ADVANCE_PER_LATE_CHAR) + '</div>';
            timerRight.textContent = formatBigInt(ADVANCE_PER_LATE_CHAR);
            btnRace.disabled = false;
            btnRace.textContent = '▶ REPLAY RACE';
            running = false;
            if (rafHandle) cancelAnimationFrame(rafHandle);
          }, 800);
        }
      };

      rafHandle = requestAnimationFrame(animate);
    });
  }

  function initXorDemo() {
    const inputPT = document.getElementById('xor-pt');
    const inputVA = document.getElementById('xor-va');
    const inputVB = document.getElementById('xor-vb');
    const valPT = document.getElementById('val-pt');
    const valVA = document.getElementById('val-va');
    const valVB = document.getElementById('val-vb');
    const resDec = document.getElementById('xor-res-dec');
    const resBin = document.getElementById('xor-res-bin');

    if (!inputPT || !inputVA || !inputVB || !valPT || !valVA || !valVB || !resDec || !resBin) return;

    const update = () => {
      const pt = parseInt(inputPT.value, 10);
      const vA = parseInt(inputVA.value, 10);
      const vB = parseInt(inputVB.value, 10);
      const ct = pt ^ vA ^ vB;

      valPT.textContent = pt.toString(16).padStart(2, '0').toUpperCase();
      valVA.textContent = vA.toString(16).padStart(2, '0').toUpperCase();
      valVB.textContent = vB.toString(16).padStart(2, '0').toUpperCase();
      resDec.textContent = `0x${ct.toString(16).padStart(2, '0').toUpperCase()}`;
      resBin.textContent = ct.toString(2).padStart(8, '0');
    };

    inputPT.addEventListener('input', update);
    inputVA.addEventListener('input', update);
    inputVB.addEventListener('input', update);
    update();
  }

  function initFlagReveal() {
    const flagContainer = document.querySelector('.flag-slots');
    const flagCopyHost = document.getElementById('flag-copy-host');
    if (!flagContainer) return;

    const obfuscatedFlag = 'VEhFTT8hQ1RGezBMRF9UNFAzX04zVjNSX0QxRTVLN30=';
    let decoded;
    try {
      decoded = atob(obfuscatedFlag);
    } catch (_) {
      decoded = 'THEM?!CTF{0LD_T4P3_N3V3R_D1E5K7}';
    }
    const finalFlag = decoded;

    flagContainer.innerHTML = '';
    decoded.split('').forEach(() => {
      const slot = document.createElement('div');
      slot.className = 'flag-slot';
      slot.textContent = '_';
      flagContainer.appendChild(slot);
    });

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'flag-copy-btn';
    copyBtn.textContent = 'COPY FLAG';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(finalFlag);
        copyBtn.textContent = 'COPIED!';
        window.setTimeout(() => {
          copyBtn.textContent = 'COPY FLAG';
        }, 1300);
      } catch (_) {
        copyBtn.textContent = 'FAILED';
        window.setTimeout(() => {
          copyBtn.textContent = 'COPY FLAG';
        }, 1300);
      }
    });

    if (flagCopyHost) flagCopyHost.appendChild(copyBtn);
    else flagContainer.insertAdjacentElement('afterend', copyBtn);

    const observerTarget = flagContainer;
    const revealSlots = flagContainer.querySelectorAll('.flag-slot');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotion = motionQuery.matches;
    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;

      if (reducedMotion) {
        revealSlots.forEach((slot, idx) => {
          slot.textContent = finalFlag[idx];
          slot.classList.add('locked');
        });
        return;
      }

      const sequence = [];
      for (let i = 0; i < finalFlag.length; i++) {
        sequence.push(String.fromCharCode(33 + ((i * 7 + 3) % 90)));
      }

      revealSlots.forEach((slot, idx) => {
        slot.textContent = sequence[idx];
        slot.classList.add('scrambled');
      });

      let index = 0;
      const interval = setInterval(() => {
        if (index < finalFlag.length) {
          const slot = revealSlots[index];
          slot.classList.remove('scrambled');
          slot.classList.add('locked');
          slot.textContent = finalFlag[index];
          body.classList.add('flash-green');
          setTimeout(() => {
            body.classList.remove('flash-green');
          }, 100);
          index += 1;
        } else {
          clearInterval(interval);
        }
      }, 150);
    };

    if ('IntersectionObserver' in window) {
      const flagObserver = new IntersectionObserver((entries, obs) => {
        if (entries.some(entry => entry.isIntersecting)) {
          reveal();
          obs.disconnect();
        }
      }, { threshold: 0.2 });
      flagObserver.observe(observerTarget);
    } else {
      reveal();
    }
  }

  function initEasterEgg() {
    const sequence = [];
    const konami = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a';

    window.addEventListener('keydown', (event) => {
      sequence.push(event.key);
      if (sequence.length > 10) sequence.splice(0, sequence.length - 10);
      if (sequence.join(',') === konami) {
        if (document.querySelector('.rabbit-hole.hacker-mode')) return;
        const banner = document.createElement('div');
        banner.className = 'rabbit-hole hacker-mode';
        banner.style.marginTop = '20px';
        banner.style.padding = '15px';
        banner.style.color = 'var(--phosphor-amber)';
        banner.textContent = 'HACKER MODE ACTIVATED: The pigeonhole principle is your friend.';
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 3000);
      }
    });
  }

  function initRevealObserver() {
    const items = document.querySelectorAll('.reveal-on-scroll');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(item => item.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    items.forEach(el => observer.observe(el));
  }

  initProgressBar();
  initSkipLink();
  initToolbar();
  initCopyButtons();
  makeDisclosureToggles();

  const preferredTheme = storage.get('oc-theme', 'dark');
  setTheme(preferredTheme === 'light' ? 'light' : 'dark');

  initRevealObserver();
  initBootSequence();
  
  initEmulatorWidget();
  initPrngWidget();
  initTimerRace();
  initXorDemo();
  initFlagReveal();
  initEasterEgg();
});


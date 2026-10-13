/* ============================================================
   js/pwa.js — SHIVAM DUPLEX Society
   Lord Shiva (મહાદેવ) Cosmic Loader & PWA App Installation Engine
   ============================================================ */

(function () {
  'use strict';

  // 1. Lord Shiva Trishul & Damru SVG String
  function getShivaTrishulSVG(size = 80) {
    return `
      <svg class="shiva-trishul-svg" viewBox="0 0 100 110" width="${size}" height="${size * 1.1}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shivaGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="50%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#d97706" />
          </linearGradient>
          <linearGradient id="shivaAuraGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.2" />
          </linearGradient>
        </defs>

        <!-- Crescent Moon (Ardha Chandra) on Trishul side -->
        <path class="shiva-crescent-moon" d="M 58 14 A 12 12 0 0 1 68 28 A 12 12 0 0 0 60 16 Z" fill="#e0e7ff" opacity="0.95" />

        <!-- Trishul Center Spear (Middle Prong) -->
        <path d="M 50 10 L 46 25 L 48.5 25 L 48.5 78 L 51.5 78 L 51.5 25 L 54 25 Z" fill="url(#shivaGold)" />
        <polygon points="50,6 45,20 55,20" fill="#fef08a" />

        <!-- Left Curved Prong -->
        <path d="M 48.5 42 C 34 42 26 36 26 24 C 26 21 27 18 29 18 C 30 18 31 22 34 26 C 38 31 43 35 48.5 36 Z" fill="url(#shivaGold)" />
        <polygon points="27,15 24,22 30,22" fill="#fef08a" />

        <!-- Right Curved Prong -->
        <path d="M 51.5 42 C 66 42 74 36 74 24 C 74 21 73 18 71 18 C 70 18 69 22 66 26 C 62 31 57 35 51.5 36 Z" fill="url(#shivaGold)" />
        <polygon points="73,15 70,22 76,22" fill="#fef08a" />

        <!-- Tripundra (3 Holy Ash Lines) on Center Prong -->
        <line x1="43" y1="28" x2="57" y2="28" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.9" />
        <line x1="44" y1="31" x2="56" y2="31" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.9" />
        <line x1="45" y1="34" x2="55" y2="34" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.9" />

        <!-- Third Eye / Tilak (Trinetra) in Center -->
        <circle class="shiva-third-eye" cx="50" cy="31" r="1.8" fill="#ef4444" />

        <!-- Damru (Sacred Drum) Tied in Center -->
        <g class="shiva-damru-node">
          <!-- Top Triangle -->
          <polygon points="38,46 62,46 50,54" fill="#ef4444" stroke="#b91c1c" stroke-width="0.8" />
          <!-- Bottom Triangle -->
          <polygon points="38,62 62,62 50,54" fill="#ef4444" stroke="#b91c1c" stroke-width="0.8" />
          <!-- Damru Rim rings -->
          <ellipse cx="50" cy="46" rx="12" ry="2" fill="#f59e0b" />
          <ellipse cx="50" cy="62" rx="12" ry="2" fill="#f59e0b" />
          <!-- Center Waist Cord -->
          <line x1="47" y1="54" x2="53" y2="54" stroke="#fde047" stroke-width="2.5" stroke-linecap="round" />
          <!-- Vibrating String & Bead -->
          <circle cx="34" cy="53" r="2" fill="#fbbf24" />
          <line x1="50" y1="54" x2="35" y2="53" stroke="#fef08a" stroke-width="1" />
          <circle cx="66" cy="55" r="2" fill="#fbbf24" />
          <line x1="50" y1="54" x2="65" y2="55" stroke="#fef08a" stroke-width="1" />
        </g>
      </svg>
    `;
  }

  // 2. Lord Shiva Fullscreen Page Loader
  function injectShivaPageLoader() {
    if (document.getElementById('shiva-page-loader')) return;

    const loader = document.createElement('div');
    loader.id = 'shiva-page-loader';
    loader.className = 'shiva-page-loader';
    loader.innerHTML = `
      <div class="shiva-loader-container">
        <div class="shiva-aura-ring"></div>
        <div class="shiva-aura-ring"></div>
        <div class="shiva-aura-ring"></div>
        ${getShivaTrishulSVG(90)}
      </div>
      <div class="shiva-loader-text">
        <div class="shiva-mantra">॥ ॐ नमः शिवाय ॥</div>
        <div class="shiva-subtext">
          <span>SHIVAM DUPLEX</span>
          <span class="shiva-dots"></span>
        </div>
      </div>
    `;

    document.body.appendChild(loader);

    // Fade out loader smoothly once page assets ready
    const hideLoader = () => {
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 550);
      }, 400);
    };

    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
      setTimeout(hideLoader, 2500); // Safety fallback timeout
    }
  }

  // 3. Upgrade all inline Spinners to Mini Shiva Trishul
  function upgradeInlineSpinners() {
    document.querySelectorAll('.spinner-wrap').forEach((wrap) => {
      if (wrap.dataset.shivaUpgraded) return;
      wrap.dataset.shivaUpgraded = '1';
      wrap.innerHTML = `
        <div class="shiva-inline-loader">
          ${getShivaTrishulSVG(52)}
          <div style="font-size:12px;font-weight:700;letter-spacing:1.5px;color:#fde047;">ॐ नमः शिवाय</div>
          <div style="font-size:11px;color:rgba(165,180,252,0.8);">Loading data...</div>
        </div>
      `;
    });
  }

  // 4. Upgrade Sidebar Brand Icon with Shiva Trishul
  function upgradeBrandIcon() {
    const brandIcons = document.querySelectorAll('.sidebar-brand .brand-icon');
    brandIcons.forEach((icon) => {
      if (icon.dataset.shivaBrand) return;
      icon.dataset.shivaBrand = '1';
      icon.innerHTML = getShivaTrishulSVG(38);
    });
  }

  // ============================================================
  // PWA APP INSTALLATION SYSTEM (FIXED & GUARANTEED)
  // ============================================================

  // 5. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration:', err);
        });
    });
  }

  // 6. Platform Detection
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://');

  const isIOS =
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !window.MSStream;

  const isAndroid = /Android/i.test(navigator.userAgent);

  // Capture deferredPrompt early on window
  let deferredPrompt = window.__pwaDeferredPrompt || null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.__pwaDeferredPrompt = e;
    console.log('[PWA] beforeinstallprompt captured successfully!');
    showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App successfully installed!');
    deferredPrompt = null;
    window.__pwaDeferredPrompt = null;
    hideInstallBanner();
    if (typeof showToast === 'function') {
      showToast('🔱 SHIVAM App સફળતાપૂર્વક Install થઈ ગઈ છે!', 'success');
    }
  });

  // 7. Inject Shiva PWA Install Modal
  function injectInstallModal() {
    if (document.getElementById('shiva-install-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'shiva-install-modal';
    modal.className = 'shiva-install-modal-overlay hidden';
    modal.innerHTML = `
      <div class="shiva-install-card">
        <div class="shiva-card-top-glow"></div>
        <div class="shiva-card-body">
          <div class="shiva-app-badge">
            <img src="icons/icon-192.png" alt="SHIVAM Icon" onerror="this.src='icons/icon-96.png'"/>
            <div class="shiva-app-badge-title">
              <h4>SHIVAM DUPLEX App</h4>
              <p>⭐⭐⭐⭐⭐ Official Society Portal</p>
            </div>
          </div>

          <h3 class="shiva-install-title">📲 મોબાઇલ પર એપ Install કરો</h3>
          <p class="shiva-install-desc" id="shiva-install-desc-text">
            સોસાયટીના મેન્ટેનન્સ બિલ, પાવતી, પેમેન્ટ અને રેસિડેન્ટ પોર્ટલ સીધા મોબાઇલમાંથી વાપરો.
          </p>

          <!-- Step instructions box (changes based on OS) -->
          <div class="shiva-steps-box" id="shiva-install-steps">
            <!-- Injected dynamically -->
          </div>

          <div class="shiva-install-actions">
            <button type="button" class="shiva-btn-primary-install" id="shiva-modal-primary-btn">
              ⚡ Install Now / ડાઉનલોડ કરો
            </button>
            <button type="button" class="shiva-btn-close-modal" id="shiva-modal-close-btn">
              બંધ કરો (Close)
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeInstallModal();
    });
    document.getElementById('shiva-modal-close-btn')?.addEventListener('click', closeInstallModal);
  }

  function openInstallModal() {
    const modal = document.getElementById('shiva-install-modal');
    if (!modal) return;

    const stepsBox = document.getElementById('shiva-install-steps');
    const primaryBtn = document.getElementById('shiva-modal-primary-btn');

    if (isIOS) {
      // iPhone / iPad instructions
      stepsBox.innerHTML = `
        <div class="shiva-step-item">
          <div class="shiva-step-icon">1</div>
          <div>Safari બ્રાઉઝરમાં નીચે <strong>Share બટન</strong> (<span style="font-size:16px;">⎋</span>) દબાવો.</div>
        </div>
        <div class="shiva-step-item">
          <div class="shiva-step-icon">2</div>
          <div>નીચે સ્ક્રોલ કરીને <strong>"Add to Home Screen"</strong> (<span style="font-size:16px;">⊞</span>) પસંદ કરો.</div>
        </div>
        <div class="shiva-step-item">
          <div class="shiva-step-icon">3</div>
          <div>ઉપર જમણી બાજુ <strong>"Add"</strong> બટન દબાવો. એપ સ્ક્રીન પર આવી જશે!</div>
        </div>
      `;
      primaryBtn.innerHTML = '👌 સમજાઈ ગયું (Got it)';
      primaryBtn.onclick = closeInstallModal;
    } else if (deferredPrompt) {
      // Android / Chrome with native install prompt ready
      stepsBox.innerHTML = `
        <div class="shiva-step-item">
          <div class="shiva-step-icon">✓</div>
          <div>તમારા ડિવાઇસ માટે <strong>Direct Install</strong> તૈયાર છે. નીચેના બટન પર ક્લિક કરો.</div>
        </div>
      `;
      primaryBtn.innerHTML = '⬇️ Direct Install App';
      primaryBtn.onclick = () => {
        closeInstallModal();
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('[PWA] User accepted install prompt');
            hideInstallBanner();
          }
          deferredPrompt = null;
        });
      };
    } else if (isAndroid) {
      // Android browser when beforeinstallprompt has not triggered yet
      stepsBox.innerHTML = `
        <div class="shiva-step-item">
          <div class="shiva-step-icon">1</div>
          <div>Chrome બ્રાઉઝરમાં ઉપર જમણી બાજુ <strong>3 ટપકાં (⋮)</strong> મેનૂ દબાવો.</div>
        </div>
        <div class="shiva-step-item">
          <div class="shiva-step-icon">2</div>
          <div><strong>"Install app"</strong> અથવા <strong>"Add to Home screen"</strong> (📲) પસંદ કરો.</div>
        </div>
        <div class="shiva-step-item">
          <div class="shiva-step-icon">3</div>
          <div><strong>"Install"</strong> પર ક્લિક કરો — એપ ડાઉનલોડ થઈ જશે!</div>
        </div>
      `;
      primaryBtn.innerHTML = '🔄 તપાસો / રીફ્રેશ કરો';
      primaryBtn.onclick = () => {
        window.location.reload();
      };
    } else {
      // Desktop PC / Mac
      stepsBox.innerHTML = `
        <div class="shiva-step-item">
          <div class="shiva-step-icon">1</div>
          <div>બ્રાઉઝરના એડ્રેસ બારમાં ઉપર જમણી બાજુ <strong>Install આઇકોન (⊕)</strong> દબાવો.</div>
        </div>
        <div class="shiva-step-item">
          <div class="shiva-step-icon">2</div>
          <div><strong>"Install"</strong> કન્ફર્મ કરો — એપ ડેસ્કટોપ પર આવી જશે!</div>
        </div>
      `;
      primaryBtn.innerHTML = '👌 સમજાઈ ગયું (Close)';
      primaryBtn.onclick = closeInstallModal;
    }

    modal.classList.remove('hidden');
  }

  function closeInstallModal() {
    const modal = document.getElementById('shiva-install-modal');
    if (modal) modal.classList.add('hidden');
  }

  // 8. Inject Top Shiva Install Banner
  function injectInstallBanner() {
    if (document.getElementById('pwa-install-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'pwa-install-bar';
    bar.className = 'pwa-install-bar';
    bar.innerHTML = `
      <div class="pwa-install-bar-text">
        <span style="font-size:20px;filter:drop-shadow(0 0 6px #fbbf24);">🔱</span>
        <span><strong>SHIVAM App</strong> મોબાઇલ પર Install કરો (Direct Download)</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button type="button" id="pwa-bar-install-btn" class="pwa-install-btn">
          ⬇️ Install App
        </button>
        <button type="button" id="pwa-bar-dismiss-btn" class="pwa-install-dismiss" title="Close">✕</button>
      </div>
    `;

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.insertBefore(bar, mainContent.firstChild);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }

    document.getElementById('pwa-bar-install-btn')?.addEventListener('click', triggerInstall);
    document.getElementById('pwa-bar-dismiss-btn')?.addEventListener('click', () => {
      hideInstallBanner();
      sessionStorage.setItem('pwa_banner_dismissed', '1');
    });

    if (!isStandalone && !sessionStorage.getItem('pwa_banner_dismissed')) {
      bar.classList.add('show');
    }
  }

  function showInstallBanner() {
    const bar = document.getElementById('pwa-install-bar');
    if (bar && !isStandalone && !sessionStorage.getItem('pwa_banner_dismissed')) {
      bar.classList.add('show');
    }
  }

  function hideInstallBanner() {
    const bar = document.getElementById('pwa-install-bar');
    if (bar) bar.classList.remove('show');
  }

  // 9. Inject Mobile Bottom Navigation
  function injectBottomNav() {
    if (document.querySelector('.mobile-bottom-nav')) return;

    const currentPath =
      window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    const nav = document.createElement('nav');
    nav.className = 'mobile-bottom-nav';
    nav.innerHTML = `
      <div class="mbn-items">
        <a href="index.html" class="mbn-item ${currentPath === 'index' ? 'active' : ''}">
          <span class="mbn-icon">📊</span>
          <span>Dashboard</span>
        </a>
        <a href="members.html" class="mbn-item ${currentPath === 'members' ? 'active' : ''}">
          <span class="mbn-icon">👥</span>
          <span>Members</span>
        </a>
        <a href="maintenance.html" class="mbn-item ${currentPath === 'maintenance' ? 'active' : ''}">
          <span class="mbn-icon">🧾</span>
          <span>Bills</span>
        </a>
        <a href="payments.html" class="mbn-item ${currentPath === 'payments' ? 'active' : ''}">
          <span class="mbn-icon">💳</span>
          <span>Pay</span>
        </a>
        <a href="resident.html" class="mbn-item ${currentPath === 'resident' ? 'active' : ''}">
          <span class="mbn-icon">🏠</span>
          <span>Resident</span>
        </a>
      </div>
    `;

    document.body.appendChild(nav);
  }

  // 10. Central Trigger Install Method
  function triggerInstall() {
    if (isStandalone) {
      if (typeof showToast === 'function') {
        showToast('🔱 SHIVAM App પહેલેથી જ ઇન્સ્ટોલ કરેલી છે!', 'info');
      } else {
        alert('SHIVAM App પહેલેથી જ ઇન્સ્ટોલ કરેલી છે!');
      }
      return;
    }

    if (deferredPrompt) {
      // Direct native prompt if available
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted install prompt');
          hideInstallBanner();
        }
        deferredPrompt = null;
      });
    } else {
      // Show smart OS-specific guided dialog
      openInstallModal();
    }
  }

  function bindInstallButtons() {
    document.querySelectorAll('.btn-install-app').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerInstall();
      });
    });
  }

  // 11. Lifecycle Boots
  document.addEventListener('DOMContentLoaded', () => {
    injectShivaPageLoader();
    upgradeBrandIcon();
    upgradeInlineSpinners();

    if (isStandalone) {
      document.body.classList.add('is-pwa-standalone');
      return;
    }

    injectInstallBanner();
    injectInstallModal();
    injectBottomNav();
    bindInstallButtons();
  });

  // Watch for any dynamically rendered spinner-wraps
  const observer = new MutationObserver(() => {
    upgradeInlineSpinners();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Expose helpers globally
  window.triggerAppInstall = triggerInstall;
  window.getShivaTrishulSVG = getShivaTrishulSVG;
})();

/* ============================================================
   js/pwa.js — SHIVAM DUPLEX Society · PWA & Mobile App Support
   Handles Service Worker, Android & iOS Install Prompts, Bottom Nav
   ============================================================ */

(function () {
  'use strict';

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }

  // 2. Platform & Standalone Detection
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true ||
                       document.referrer.includes('android-app://');

  const isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
                !window.MSStream;

  let deferredPrompt = null;

  // 3. Listen for Android/Desktop Chrome Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt captured');
    showInstallBanner();
    enableInstallButtons();
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App successfully installed!');
    deferredPrompt = null;
    hideInstallBanner();
    if (typeof showToast === 'function') {
      showToast('🎉 SHIVAM App successfully installed!', 'success');
    }
  });

  // 4. Dom Ready Initializations
  document.addEventListener('DOMContentLoaded', () => {
    // If running inside installed app, don't show install buttons/banners
    if (isStandalone) {
      document.body.classList.add('is-pwa-standalone');
      return;
    }

    injectInstallBanner();
    injectIosModal();
    injectBottomNav();
    bindInstallButtons();

    // On iOS, if not dismissed, show banner
    if (isIOS && !sessionStorage.getItem('pwa_banner_dismissed')) {
      showInstallBanner();
    }
  });

  // 5. Inject Top Install Banner
  function injectInstallBanner() {
    if (document.getElementById('pwa-install-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'pwa-install-bar';
    bar.className = 'pwa-install-bar';
    bar.innerHTML = `
      <div class="pwa-install-bar-text">
        <span style="font-size:18px;">📲</span>
        <span><strong>SHIVAM App</strong> મોબાઇલ પર Install કરો (Direct App)</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button type="button" id="pwa-bar-install-btn" class="pwa-install-btn">
          ⬇️ Install App
        </button>
        <button type="button" id="pwa-bar-dismiss-btn" class="pwa-install-dismiss" title="Close">✕</button>
      </div>
    `;

    // Insert at the top of .main-content or body
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

    if (deferredPrompt || isIOS) {
      if (!sessionStorage.getItem('pwa_banner_dismissed')) {
        bar.classList.add('show');
      }
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

  // 6. Inject iOS Install Bottom Sheet
  function injectIosModal() {
    if (document.getElementById('ios-install-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'ios-install-modal';
    modal.className = 'ios-install-modal hidden';
    modal.innerHTML = `
      <div class="ios-install-backdrop" id="ios-modal-backdrop"></div>
      <div class="ios-install-sheet">
        <div class="sheet-handle"></div>
        <div style="font-size:36px;margin-bottom:8px;">📱</div>
        <h3>iPhone / iPad પર Install કરો</h3>
        <p>SHIVAM DUPLEX એપને તમારી હોમ સ્ક્રીન પર મૂકવા માટે નીચેના પગલાં અનુસરો:</p>
        <div class="ios-steps">
          <div class="ios-step">
            <span class="ios-step-num">1</span>
            <div>Safari બ્રાઉઝરમાં નીચે <strong>Share બટન</strong> (<span style="font-size:16px;">⎋</span> / <span style="font-size:16px;">⎙</span>) દબાવો.</div>
          </div>
          <div class="ios-step">
            <span class="ios-step-num">2</span>
            <div>નીચે સ્ક્રોલ કરીને <strong>"Add to Home Screen"</strong> (<span style="font-size:16px;">⊞</span>) પસંદ કરો.</div>
          </div>
          <div class="ios-step">
            <span class="ios-step-num">3</span>
            <div>ઉપર જમણી બાજુ <strong>"Add"</strong> બટન દબાવો. એપ સ્ક્રીન પર આવી જશે!</div>
          </div>
        </div>
        <button type="button" class="ios-install-close" id="ios-modal-close-btn">સમજાઈ ગયું (Close)</button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('ios-modal-backdrop')?.addEventListener('click', closeIosModal);
    document.getElementById('ios-modal-close-btn')?.addEventListener('click', closeIosModal);
  }

  function openIosModal() {
    const modal = document.getElementById('ios-install-modal');
    if (modal) modal.classList.remove('hidden');
  }

  function closeIosModal() {
    const modal = document.getElementById('ios-install-modal');
    if (modal) modal.classList.add('hidden');
  }

  // 7. Inject Mobile Bottom Navigation
  function injectBottomNav() {
    if (document.querySelector('.mobile-bottom-nav')) return;

    const currentPath = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

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

  // 8. Trigger Install Action (for buttons anywhere on the site)
  function triggerInstall() {
    if (deferredPrompt) {
      // Android / Chrome / Edge native install dialog
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted install prompt');
          hideInstallBanner();
        } else {
          console.log('[PWA] User dismissed install prompt');
        }
        deferredPrompt = null;
      });
    } else if (isIOS) {
      // iOS Guide
      openIosModal();
    } else if (window.matchMedia('(display-mode: standalone)').matches) {
      if (typeof showToast === 'function') {
        showToast('એપ પહેલેથી જ ઇન્સ્ટોલ કરેલી છે!', 'info');
      } else {
        alert('એપ પહેલેથી જ ઇન્સ્ટોલ કરેલી છે!');
      }
    } else {
      // Desktop Chrome or browser without prompt triggered yet
      alert('એપ ઇન્સ્ટોલ કરવા માટે:\nબ્રાઉઝરના એડ્રેસ બારમાં ઉપર જમણી બાજુ આવેલા ⊕ અથવા "Install" આઇકોન પર ક્લિક કરો.');
    }
  }

  function bindInstallButtons() {
    document.querySelectorAll('.btn-install-app').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerInstall();
      });
    });
  }

  function enableInstallButtons() {
    document.querySelectorAll('.btn-install-app').forEach(btn => {
      btn.style.display = 'inline-flex';
    });
  }

  // Expose global helper
  window.triggerAppInstall = triggerInstall;
})();

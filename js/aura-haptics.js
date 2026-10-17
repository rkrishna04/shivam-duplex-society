/* ============================================================
   aura-haptics.js — SHIVAM DUPLEX RESIDENTS ASSOCIATION
   Aura-Matrix Procedural Web Audio Acoustic Micro-Feedback
   Ultra-soft 12ms optical glass droplet haptic acoustic feedback
   Zero external audio files · Pure Web Audio API synthesis
   ============================================================ */

(function () {
  'use strict';

  var audioCtx = null;
  var soundEnabled = localStorage.getItem('aura_sound') !== 'off';

  function initAudio() {
    if (!audioCtx) {
      try {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioCtx = new AudioContext();
        }
      } catch (e) {
        // AudioContext not supported or blocked
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () {});
    }
  }

  // Synthesize microscopic optical glass pop
  function playGlassHaptic(freq, duration) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      var f = freq || 920;
      var d = duration || 0.035;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(f * 0.45, audioCtx.currentTime + d);

      gain.gain.setValueAtTime(0.045, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + d);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + d);
    } catch (e) {}
  }

  function playSoftTick() {
    playGlassHaptic(1100, 0.025);
  }

  function playSuccessChime() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      [784, 1046].forEach(function (f, i) {
        setTimeout(function () {
          playGlassHaptic(f, 0.06);
        }, i * 65);
      });
    } catch (e) {}
  }

  // Global exposure
  window.AuraHaptics = {
    play: playGlassHaptic,
    tick: playSoftTick,
    chime: playSuccessChime,
    toggle: function () {
      soundEnabled = !soundEnabled;
      localStorage.setItem('aura_sound', soundEnabled ? 'on' : 'off');
      updateTogglePills();
      if (soundEnabled) playSuccessChime();
      return soundEnabled;
    },
    isEnabled: function () {
      return soundEnabled;
    }
  };

  function updateTogglePills() {
    document.querySelectorAll('.haptic-sound-toggle').forEach(function (btn) {
      btn.innerHTML = soundEnabled ? '🔊 Haptics: ON' : '🔇 Haptics: OFF';
      btn.style.opacity = soundEnabled ? '1' : '0.6';
    });
  }

  // Bind interactive elements across document
  document.addEventListener('DOMContentLoaded', function () {
    updateTogglePills();

    document.addEventListener('click', function (e) {
      var target = e.target.closest('button, .btn, .nav-link, .action-btn, .cb, .hero-btn-primary, .hero-btn-secondary, .futuristic-tab, .evt-tab-btn, a[href]');
      if (!target) return;

      if (target.classList.contains('haptic-sound-toggle')) {
        window.AuraHaptics.toggle();
        return;
      }

      if (target.classList.contains('btn-success') || target.id === 'btn-save' || target.id === 'btn-submit-kyc') {
        playSuccessChime();
      } else {
        playSoftTick();
      }
    }, true);
  });
})();

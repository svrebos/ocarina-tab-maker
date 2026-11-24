/* =====================================================================
   support.js - the optional Ko-fi "Tip Me" button, behind a consent choice.

   Ko-fi's button script sets cookies, so it is NOT loaded until the visitor
   agrees. The choice ("yes" or "no") is remembered in this browser only
   (localStorage); until then a notice asks. "Cookie settings" in the footer
   reopens the notice.
   ===================================================================== */
(function () {
  'use strict';
  const ns = (window.OcarinaTab = window.OcarinaTab || {});
  const { h } = ns.dom;

  const KOFI_PAGE = 'artisifact'; // the name in ko-fi.com/<name>
  const KOFI_SCRIPT = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
  const BUTTON = {
    type: 'floating-chat',
    'floating-chat.donateButton.text': 'Tip Me',
    'floating-chat.donateButton.background-color': '#103a31', // --forest in css/base.css
    'floating-chat.donateButton.text-color': '#e3c468'        // --gold in css/base.css
  };
  const STORAGE_KEY = 'ocarina-tab-maker.kofi-consent'; // 'yes' | 'no'

  const banner = document.getElementById('consent');

  function readChoice() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage blocked: the notice just shows again next time */ }
  }

  let loaded = false;
  function loadKofi() {
    if (loaded) return;
    loaded = true;
    document.head.append(h('script', {
      src: KOFI_SCRIPT,
      async: true,
      onload: () => { if (window.kofiWidgetOverlay) window.kofiWidgetOverlay.draw(KOFI_PAGE, BUTTON); }
    }));
  }

  function choose(value) {
    const before = readChoice();
    saveChoice(value);
    banner.hidden = true;
    if (value === 'yes') {
      loadKofi();
    } else if (loaded || before === 'yes') {
      // The button is already on the page and cannot be removed cleanly, so reload without it.
      // render() first writes the current notes into the address, so nothing typed is lost.
      if (ns.app) ns.app.render();
      location.reload();
    }
  }

  document.getElementById('consent-yes').addEventListener('click', () => choose('yes'));
  document.getElementById('consent-no').addEventListener('click', () => choose('no'));
  document.getElementById('cookie-settings').addEventListener('click', () => { banner.hidden = false; });

  const choice = readChoice();
  if (choice === 'yes') loadKofi();
  else if (choice !== 'no') banner.hidden = false; // no choice yet: ask
})();

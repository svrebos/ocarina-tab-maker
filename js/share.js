/* =====================================================================
   share.js - saving a tab in the page address (the part after the #).

   The address holds everything: notes, line width, ocarina type, title and
   subtitle. A bookmark or a shared link is therefore a saved tab; nothing is
   sent to a server.  Example:  #t=C%20D%20E&w=8&o=6&n=Title&s=Subtitle
   ===================================================================== */
(function () {
  'use strict';
  const ns = (window.OcarinaTab = window.OcarinaTab || {});

  const EXAMPLE_NOTES = 'E E F G\nG F E D\nC C D E\nE D D';
  const DEFAULT_WRAP = 8;
  const DEFAULT_TYPE = '12'; // not written to the address, to keep links short

  /**
   * state: { notes, wrap, type, title, subtitle } -> "t=...&w=...&o=...&n=...&s=..."
   */
  function encode(state) {
    const title = state.title.trim();
    const subtitle = state.subtitle.trim();
    return 't=' + encodeURIComponent(state.notes) + '&w=' + state.wrap +
      (state.type !== DEFAULT_TYPE ? '&o=' + state.type : '') +
      (title ? '&n=' + encodeURIComponent(title) : '') +
      (subtitle ? '&s=' + encodeURIComponent(subtitle) : '');
  }

  /** The reverse of encode(). Anything missing or broken falls back to a default. */
  function decode(hash) {
    const read = (key) => {
      const match = new RegExp('[#&]' + key + '=([^&]*)').exec(hash);
      if (!match) return null;
      try { return decodeURIComponent(match[1]); } catch (e) { return null; }
    };
    const wrap = parseInt(read('w'), 10);
    return {
      notes: read('t') !== null ? read('t') : EXAMPLE_NOTES,
      wrap: Number.isFinite(wrap) ? wrap : DEFAULT_WRAP,
      type: read('o') || DEFAULT_TYPE,
      title: read('n') || '',
      subtitle: read('s') || ''
    };
  }

  ns.share = { EXAMPLE_NOTES, DEFAULT_WRAP, encode, decode };
})();

/* =====================================================================
   registry.js - the list of supported ocarinas.

   Every ocarina lives in its own file in js/ocarinas/ and calls `register`.
   To add an ocarina: copy ocarina-6.js, change the data, and add one
   <script> tag to index.html. The type selector, palette, chart, texts and
   error messages all pick it up automatically.

   An ocarina definition looks like this:

   {
     id: '6',                    // used in share links (#o=6)
     label: '6-hole',            // shown on the selector and in messages
     artwork: {
       box: { x, y, w, h },      // visible area of the drawing (incl. strokes), in source coordinates
       scale: 1.3,               // how much bigger it is drawn in the tab
       tilt: -10.32,             // rotation of the holes group, as in the Inkscape file
       holeStroke: 3,
       holes: { NAME: { cx, cy, r } },
       body: (k) => [svg nodes]  // the outline; k = 1 / scale, to keep line widths constant
     },
     fingerings: { 'C5': ... }, // raw table, one entry per note (note names, '#' for sharps)
     parseFingering: fn,         // turns one raw entry into { covered: Set, half: Set }
     chartColumns: 6,            // notes per row in the fingering chart
     legend: ['half'],           // extra legend entries: 'half' and/or 'sub'
     texts: { lede, hint, chartTitle, chartHint, howToRead }
   }

   After registering, `min`, `max`, `rangeLabel` are derived from the table and
   `fingerings` is keyed by MIDI number.
   ===================================================================== */
(function () {
  'use strict';
  const ns = (window.OcarinaTab = window.OcarinaTab || {});
  const list = [];

  /** Fingering parsers for the two table formats used so far. */
  const fingeringFormats = {
    /** 'Lt Lp Lr' -> those holes are covered, all others open. */
    list: (text) => ({ covered: new Set(text.split(/\s+/).filter(Boolean)), half: new Set() }),
    /** Chart rows such as 'CCHOOO': one letter per hole, in `holeOrder`.
        C = covered, O = open, H = half covered. */
    pattern: (holeOrder) => (text) => {
      const covered = new Set();
      const half = new Set();
      text.split('').forEach((letter, i) => {
        if (letter === 'C') covered.add(holeOrder[i]);
        else if (letter === 'H') half.add(holeOrder[i]);
      });
      return { covered, half };
    }
  };

  function register(def) {
    const byMidi = {};
    Object.keys(def.fingerings).forEach((name) => {
      byMidi[ns.notes.midiFromName(name)] = def.parseFingering(def.fingerings[name]);
    });
    const midis = Object.keys(byMidi).map(Number);
    def.fingerings = byMidi;
    def.min = Math.min(...midis);
    def.max = Math.max(...midis);
    def.rangeLabel = ns.notes.label(def.min) + '–' + ns.notes.label(def.max);
    list.push(def);
  }

  ns.ocarinas = {
    list,
    register,
    fingeringFormats,
    /** The ocarina with this id; unknown ids fall back to the first registered one. */
    get: (id) => list.find((o) => o.id === id) || list[0]
  };
})();

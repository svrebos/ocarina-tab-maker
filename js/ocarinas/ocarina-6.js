/* =====================================================================
   6-hole ocarina (C), range C5-E6.
   Artwork: 6-hole ocarina.svg, drawn in Inkscape (CC BY 4.0).

   Four finger holes (upper row = middle fingers, lower row = index fingers)
   and two thumb holes beside the mouthpiece.
   ===================================================================== */
(function () {
  'use strict';
  const ns = (window.OcarinaTab = window.OcarinaTab || {});
  const { s } = ns.dom;

  /* ---- Artwork (original Inkscape coordinates, holes rotated by `tilt`) ---- */
  const R = 13.915212;
  const HOLES = {
    LM: { cx: 826.73395, cy: 705.61584, r: R },
    RM: { cx: 867.02313, cy: 712.95276, r: R },
    LI: { cx: 819.8277,  cy: 743.5401,  r: R },
    RI: { cx: 860.11688, cy: 750.87701, r: R },
    LT: { cx: 779.54791, cy: 787.98395, r: R },
    RT: { cx: 882.14337, cy: 806.66724, r: R }
  };
  const MOUTHPIECE_OUTLINE = 'm 990.14121,616.87472 c -4.64451,4.64455 -6.9048,7.0034 -6.9048,15.09595 h -45.96972 c 0,-8.09255 -2.26025,-10.4514 -6.9048,-15.09595';
  const MOUTHPIECE_FILL = 'm 990.1407,616.87497 a 59.562382,59.562382 0 0 1 -29.88867,8.04297 59.562382,59.562382 0 0 1 -29.89062,-8.04297 c 4.64455,4.64455 6.90429,7.00315 6.90429,15.0957 h 45.97071 c 0,-8.09252 2.25982,-10.45119 6.90429,-15.0957 z';

  /** Round body plus mouthpiece; `k` keeps the line width the same at any scale. */
  function body(k) {
    const line = { stroke: '#000', 'stroke-width': 4 * k };
    return [
      s('path', { d: MOUTHPIECE_OUTLINE, fill: 'none', ...line }),
      s('circle', { cx: 960.25153, cy: 565.35498, r: 59.562382, fill: 'none', ...line }),
      s('path', { d: MOUTHPIECE_FILL, fill: '#1a1a1a', ...line })
    ];
  }

  /* ---- Fingerings ----------------------------------------------------
     Standard 6-hole C chart. One letter per hole, in the order below:
     C = covered, O = open, H = half covered. */
  const HOLE_ORDER = ['LM', 'LI', 'RI', 'RM', 'LT', 'RT'];
  const FINGERINGS = {
    'C5':  'CCCCCC',
    'C#5': 'CCCHCC', // RM half covered
    'D5':  'CCCOCC',
    'D#5': 'CCHCCC', // RI half covered
    'E5':  'CCOCCC',
    'F5':  'CCOOCC',
    'F#5': 'OCCCCC',
    'G5':  'OCCOCC',
    'G#5': 'OCOCCC',
    'A5':  'OCOOCC',
    'A#5': 'OOCOCC',
    'B5':  'OOOCCC',
    'C6':  'OOOOCC',
    'C#6': 'OOOCCO',
    'D6':  'OOOOCO',
    'D#6': 'OOOCOO',
    'E6':  'OOOOOO'
  };

  ns.ocarinas.register({
    id: '6',
    label: '6-hole',
    artwork: {
      box: { x: 888, y: 502, w: 184, h: 153 }, // visible area incl. strokes
      scale: 1.3,
      tilt: -10.320853,
      holeStroke: 3,
      holes: HOLES,
      body
    },
    fingerings: FINGERINGS,
    parseFingering: ns.ocarinas.fingeringFormats.pattern(HOLE_ORDER),
    chartColumns: 6,
    legend: ['half'],
    texts: {
      lede: 'Type your notes, mark where each new line starts, and get a printable fingering tab for a 6-hole ocarina (range C5–E6).',
      hint: 'Separate notes with spaces. Examples: `C` `C#` `Eb` `F#6`. Notes without a number are in octave 5 (C5–B5, the main scale). Use `C6`, `C#6`, `D6`, `D#6`, `E6` for the high notes. A dash `-` is a rest. Notes outside C5–E6 are flagged, so you can switch ocarina type at any time and see which notes do not fit.',
      chartTitle: 'Fingering chart (all 17 notes)',
      chartHint: 'Standard 6-hole (pendant) fingerings for a C ocarina. Half-filled circles mean the hole is half covered. Ocarina makers differ a little for sharps and the highest notes, so if your instrument came with its own chart, trust that one and edit the table in `js/ocarinas/ocarina-6.js`.',
      howToRead: [
        'Each picture shows the ocarina from above, mouthpiece towards you, left hand on the left.',
        'The two circles beside the mouthpiece are the thumb holes. Of the four other holes, the upper row is for the middle fingers and the lower row for the index fingers.',
        'Filled circles are covered, open circles are uncovered, half-filled circles are half covered.',
        'Notes are written at sounding pitch for a 6-hole C ocarina (C5–E6).'
      ]
    }
  });
})();

/* =====================================================================
   12-hole ocarina (alto/tenor C), range A4-F6.
   Artwork: Ocarina.svg, drawn in Inkscape (CC BY 4.0).
   ===================================================================== */
(function () {
  'use strict';
  const ns = (window.OcarinaTab = window.OcarinaTab || {});
  const { s } = ns.dom;

  /* ---- Artwork -------------------------------------------------------
     Coordinates are the original ones from the Inkscape file. The holes are
     rotated by `tilt` around the origin, exactly like the transform in that file. */
  const BODY_PATH = 'm 887.87344,630.7309 23.60922,6.0425 c 0,0 9.90002,-45.52472 52.43895,-79.50938 34.5203,-27.57853 88.95509,-52.70015 101.74739,-59.28813 12.7923,-6.58799 6.3642,-21.84276 -10.6589,-21.78447 -17.0231,0.0583 -72.74841,4.73112 -112.09211,12.50422 -39.34371,7.77311 -60.00554,12.56216 -83.07442,24.86197 -27.72534,14.78252 -20.19707,40.45828 1.13805,49.6772 25.75191,11.12741 41.11577,11.97963 26.89182,67.49609 z';
  const R_BIG = 9.2768078;
  const R_SMALL = 6.0299249;

  /* Hole names:  L = left hand, R = right hand
     t = thumb, p = pinky, r = ring, m = middle, i = index, s = sub-hole */
  const HOLES = {
    Lt: { cx: 740.72968, cy: 756.89532, r: R_BIG },
    Li: { cx: 747.47321, cy: 679.46509, r: R_BIG },
    Lm: { cx: 775.79486, cy: 678.85162, r: R_BIG },
    Lr: { cx: 802.81732, cy: 673.10095, r: R_BIG },
    Lp: { cx: 831.06171, cy: 665.10846, r: R_BIG },
    Ls: { cx: 775.71643, cy: 698.97656, r: R_SMALL },
    Rt: { cx: 824.01215, cy: 772.06165, r: R_BIG },
    Ri: { cx: 838.18146, cy: 704.75433, r: R_BIG },
    Rm: { cx: 865.4632,  cy: 690.30048, r: R_BIG },
    Rr: { cx: 892.36597, cy: 683.2406,  r: R_BIG },
    Rp: { cx: 918.80988, cy: 677.55237, r: R_BIG },
    Rs: { cx: 865.57916, cy: 668.48419, r: R_SMALL }
  };

  /* ---- Fingerings ----------------------------------------------------
     Each entry lists the COVERED holes. Everything else is open.
     Standard 12-hole alto C system (sub-holes are open except where listed). */
  const MAIN = 'Lt Lp Lr Lm Li Rt Ri Rm Rr Rp';
  const FINGERINGS = {
    'A4':  MAIN + ' Ls Rs',                   // all 12 holes covered
    'A#4': MAIN + ' Ls',
    'B4':  MAIN + ' Rs',
    'C5':  MAIN,                              // home note, both sub-holes open
    'C#5': 'Lt Lp Lr Lm Li Rt Ri Rm Rr Rs',
    'D5':  'Lt Lp Lr Lm Li Rt Ri Rm Rr',
    'D#5': 'Lt Lp Lr Lm Li Rt Ri Rm Rs',
    'E5':  'Lt Lp Lr Lm Li Rt Ri Rm',
    'F5':  'Lt Lp Lr Lm Li Rt Ri',
    'F#5': 'Lt Lp Lr Lm Li Rt Rr',
    'G5':  'Lt Lp Lr Lm Li Rt',
    'G#5': 'Lt Lp Lm Li Rt Rr',
    'A5':  'Lt Lp Lm Li Rt',
    'A#5': 'Lt Lp Li Rt Rr',
    'B5':  'Lt Lp Li Rt',
    'C6':  'Lt Lp Rt',
    'C#6': 'Lp Rt Rr',
    'D6':  'Lp Rt',
    'D#6': 'Lp Rr',
    'E6':  'Lp',                              // Asian system; the Italian system uses 'Rt'
    'F6':  ''                                 // all holes open
  };

  ns.ocarinas.register({
    id: '12',
    label: '12-hole',
    artwork: {
      box: { x: 836, y: 470, w: 243, h: 173 }, // visible area incl. strokes
      scale: 1,
      tilt: -10.320853,
      holeStroke: 2,
      holes: HOLES,
      body: (k) => [s('path', { d: BODY_PATH, fill: 'none', stroke: '#000', 'stroke-width': 4 * k, 'stroke-miterlimit': 3.5 })]
    },
    fingerings: FINGERINGS,
    parseFingering: ns.ocarinas.fingeringFormats.list,
    chartColumns: 7,
    legend: ['sub'],
    texts: {
      lede: 'Type your notes, mark where each new line starts, and get a printable fingering tab for a 12-hole ocarina (range A4–F6).',
      hint: 'Separate notes with spaces. Examples: `C` `C#` `Eb` `F#6` `A4`. Notes without a number are in octave 5 (C5–B5, the main scale). Use `A4`, `A#4`, `B4` for the three low notes and `C6`–`F6` for the high ones. A dash `-` is a rest.',
      chartTitle: 'Fingering chart (all 21 notes)',
      chartHint: 'Standard 12-hole fingerings, Asian system for the high notes. Ocarina makers differ for sharps and flats, so if your instrument came with its own chart, trust that one and edit the table in `js/ocarinas/ocarina-12.js`.',
      howToRead: [
        'Each picture shows the ocarina from above, mouthpiece towards you, left hand on the left.',
        'The two lower circles are the thumb holes. The two small circles are the sub-holes.',
        'Filled circles are covered, open circles are uncovered.',
        'Notes are written at sounding pitch for a 12-hole alto/tenor C ocarina (A4–F6).'
      ]
    }
  });
})();

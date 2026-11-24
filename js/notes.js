/* =====================================================================
   notes.js - turning typed text into notes (no DOM, no drawing).

   A note is a MIDI number (C5 = 72). Typing a note without an octave means
   octave 5, so `C D E` is the main scale C5-E5.
   ===================================================================== */
(function () {
  'use strict';
  const ns = (window.OcarinaTab = window.OcarinaTab || {});

  const DEFAULT_OCTAVE = 5;
  const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  const PITCH_CLASS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const NOTE_RE = /^([A-Ga-g])([#♯]|[b♭])?(-?\d+)?$/; // letter, accidental, octave
  const REST_RE = /^(-|_|\.|r|R)$/;

  /** 72 -> "C5", 73 -> "C♯5" (or "D♭5" when `flat` is true). */
  function label(midi, flat) {
    const pitchClass = ((midi % 12) + 12) % 12;
    return (flat ? FLAT_NAMES : SHARP_NAMES)[pitchClass] + (Math.floor(midi / 12) - 1);
  }

  /** "C#5" / "Eb" / "F♯6" -> { midi, flat }, or null when the text is not a note. */
  function readNote(token) {
    const m = NOTE_RE.exec(token);
    if (!m) return null;
    const accidental = m[2] ? (m[2] === '#' || m[2] === '♯' ? 1 : -1) : 0;
    const octave = m[3] !== undefined ? parseInt(m[3], 10) : DEFAULT_OCTAVE;
    return {
      midi: 12 * (octave + 1) + PITCH_CLASS[m[1].toUpperCase()] + accidental,
      flat: accidental < 0
    };
  }

  /** Same as readNote, but for names in the data tables: a typo there is a bug, so throw. */
  function midiFromName(name) {
    const note = readNote(name);
    if (!note) throw new Error('Not a note name: ' + name);
    return note.midi;
  }

  /**
   * Parses the textarea contents for one ocarina type.
   * Returns an array of lines; every line is an array of items:
   *   { type: 'note', midi, label, token } | { type: 'rest', token } | { type: 'error', token, reason }
   */
  function parse(text, ocarina) {
    return String(text).split(/\r?\n/).map((line) =>
      line.split(/[\s,;|]+/).filter(Boolean).map((token) => {
        if (REST_RE.test(token)) return { type: 'rest', token };
        const note = readNote(token);
        if (!note) return { type: 'error', token, reason: 'is not a note' };
        if (note.midi < ocarina.min || note.midi > ocarina.max) {
          return { type: 'error', token, reason: 'is outside the range ' + ocarina.rangeLabel + ' of the ' + ocarina.label + ' ocarina' };
        }
        if (!ocarina.fingerings[note.midi]) {
          return { type: 'error', token, reason: 'has no fingering for the ' + ocarina.label + ' ocarina' };
        }
        return { type: 'note', midi: note.midi, token, label: label(note.midi, note.flat) };
      })
    );
  }

  /** Splits parsed lines into rows: Enter starts a new row, long lines wrap after `wrapAt` items. */
  function layoutRows(parsedLines, wrapAt) {
    const rows = [];
    parsedLines.forEach((line) => {
      for (let i = 0; i < line.length; i += wrapAt) rows.push(line.slice(i, i + wrapAt)); // blank lines add nothing
    });
    return rows;
  }

  ns.notes = { DEFAULT_OCTAVE, label, readNote, midiFromName, parse, layoutRows };
})();

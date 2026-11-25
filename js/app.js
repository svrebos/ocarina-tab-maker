/* =====================================================================
   app.js - the page itself: reads the form, draws the tab, wires the buttons.
   Loaded last. The other files are plain data and helpers (see index.html
   for the order).
   ===================================================================== */
(function () {
  'use strict';
  const ns = (window.OcarinaTab = window.OcarinaTab || {});
  const { h, s, add, richText, clear } = ns.dom;
  const { notes, ocarinas, drawing, share, exporter } = ns;

  const $ = (id) => document.getElementById(id);
  const el = {
    notes: $('notes'), title: $('title'), subtitle: $('subtitle'), wrap: $('wrapAt'),
    palette: $('palette'), messages: $('messages'), tab: $('tab'), chart: $('chart'),
    legend: $('legend'), typeSelector: $('typesel')
  };

  const pageTitle = document.title; // the full title from index.html, used when there is no tab title
  let ocarina = ocarinas.list[0]; // the selected ocarina
  let currentTab = null;          // the tab on screen, for the downloads

  /* ---------- State: the form <-> the page address ---------- */

  function getWrap() {
    const n = parseInt(el.wrap.value, 10);
    return Number.isFinite(n) && n >= 1 ? Math.min(n, 24) : share.DEFAULT_WRAP;
  }

  function readState() {
    return {
      notes: el.notes.value, wrap: getWrap(), type: ocarina.id,
      title: el.title.value, subtitle: el.subtitle.value
    };
  }

  /** Fills the form from the page address (on load, and when the address changes). */
  function loadFromAddress() {
    const state = share.decode(location.hash);
    selectOcarina(state.type);
    el.wrap.value = state.wrap;
    el.title.value = state.title;
    el.subtitle.value = state.subtitle;
    el.notes.value = state.notes;
    render();
  }

  /* ---------- Rendering ---------- */

  function render() {
    const parsed = notes.parse(el.notes.value, ocarina);
    const rows = notes.layoutRows(parsed, getWrap());
    currentTab = drawing.show(el.tab, rows, { title: el.title.value, subtitle: el.subtitle.value }, ocarina);
    showProblems(parsed);

    const title = el.title.value.trim();
    document.title = title ? title + ' – Ocarina Tab Maker' : pageTitle; // becomes the bookmark name
    // replaceState does not trigger 'hashchange', so this does not reload the form.
    try { history.replaceState(null, '', '#' + share.encode(readState())); } catch (e) { /* file:// or sandbox */ }
  }

  /** Lists every entry that could not be shown, under the input. */
  function showProblems(parsedLines) {
    const problems = [];
    parsedLines.forEach((line, lineIndex) => line.forEach((item) => {
      if (item.type === 'error') problems.push('Line ' + (lineIndex + 1) + ': “' + item.token + '” ' + item.reason + '.');
    }));
    clear(el.messages);
    if (problems.length) {
      el.messages.append(h('div', { class: 'msg' },
        h('strong', null, 'Some entries could not be shown:'),
        h('ul', null, problems.map((p) => h('li', null, p)))));
    }
  }

  /* ---------- Ocarina type ---------- */

  /** Switches the ocarina: updates texts, palette, chart and legend (not the tab itself). */
  function selectOcarina(id) {
    ocarina = ocarinas.get(id);
    const t = ocarina.texts;
    $('lede').textContent = t.lede;
    clear($('noteHint')); add($('noteHint'), richText(t.hint));
    $('chartSum').textContent = t.chartTitle;
    clear($('chartHint')); add($('chartHint'), richText(t.chartHint));
    clear($('howList')); add($('howList'), t.howToRead.map((line) => h('li', null, line)));
    el.typeSelector.querySelectorAll('input').forEach((radio) => { radio.checked = radio.value === ocarina.id; });
    buildPalette();
    buildChart();
    buildLegend();
  }

  function buildTypeSelector() {
    add(el.typeSelector, ocarinas.list.map((o) =>
      h('label', null,
        h('input', {
          type: 'radio', name: 'otype', value: o.id,
          onchange: () => { selectOcarina(o.id); render(); }
        }),
        h('span', null, h('b', null, o.label), h('small', null, o.rangeLabel)))));
  }

  /** One button per playable note; clicking inserts it at the cursor. */
  function buildPalette() {
    clear(el.palette);
    for (let midi = ocarina.min; midi <= ocarina.max; midi++) {
      const name = notes.label(midi, false);
      const inDefaultOctave = Math.floor(midi / 12) - 1 === notes.DEFAULT_OCTAVE;
      const typed = (inDefaultOctave ? name.replace(/\d+$/, '') : name).replace('♯', '#');
      el.palette.append(h('button', {
        type: 'button',
        class: name.includes('♯') ? 'sharp' : '',
        'aria-label': 'Insert ' + name.replace('♯', ' sharp '),
        onclick: () => insertAtCursor(typed)
      }, name));
    }
  }

  /** The full fingering chart: every playable note, in rows. */
  function buildChart() {
    const items = [];
    for (let midi = ocarina.min; midi <= ocarina.max; midi++) items.push({ type: 'note', midi, label: notes.label(midi, false) });
    const rows = [];
    for (let i = 0; i < items.length; i += ocarina.chartColumns) rows.push(items.slice(i, i + ocarina.chartColumns));
    drawing.show(el.chart, rows, {}, ocarina);
  }

  function buildLegend() {
    const icon = (...shapes) => s('svg', { width: 18, height: 18, viewBox: '0 0 18 18' }, shapes);
    const circle = (fill) => s('circle', { cx: 9, cy: 9, r: 7, fill, stroke: '#000', 'stroke-width': 2 });
    const entries = {
      covered: [icon(circle('#000')), 'covered'],
      open: [icon(circle('none')), 'open'],
      half: [icon(circle('none'), s('path', { d: 'M2 9 A7 7 0 0 0 16 9 Z', fill: '#000' })), 'half covered'],
      sub: [null, 'small circles = sub-holes']
    };
    clear(el.legend);
    ['covered', 'open', ...ocarina.legend].forEach((key) => el.legend.append(h('span', null, entries[key])));
  }

  /* ---------- Editing helpers ---------- */

  /** Inserts text at the cursor in the notes box, with a space around it where needed. */
  function insertAtCursor(text, options) {
    const box = el.notes;
    const before = box.value.slice(0, box.selectionStart);
    const after = box.value.slice(box.selectionEnd);
    if (options && options.newLine) {
      const trimmed = before.replace(/[ \t]+$/, ''); // no trailing space before a line break
      box.value = trimmed + '\n' + after.replace(/^[ \t]+/, '');
      box.setSelectionRange(trimmed.length + 1, trimmed.length + 1);
    } else {
      let insert = text;
      if (before && !/\s$/.test(before)) insert = ' ' + insert;
      if (after && !/^\s/.test(after)) insert += ' ';
      box.value = before + insert + after;
      box.setSelectionRange(before.length + insert.length, before.length + insert.length);
    }
    box.focus();
  }

  /* ---------- Header crest: the first ocarina's outline ---------- */

  function buildCrest() {
    const art = ocarinas.list[0].artwork;
    const { x, y, w, h: height } = art.box;
    const holes = Object.values(art.holes).map((hole) =>
      s('circle', { cx: hole.cx, cy: hole.cy, r: hole.r, fill: 'none', stroke: 'currentColor', 'stroke-width': 3 }));
    const outline = art.body(1).map((node) => {
      node.setAttribute('stroke', 'currentColor');
      node.setAttribute('stroke-width', 6);
      node.setAttribute('stroke-linejoin', 'round');
      return node;
    });
    $('crest').append(s('svg', { viewBox: [x - 6, y - 6, w + 12, height + 12].join(' '), 'aria-hidden': 'true' },
      outline, s('g', { transform: 'rotate(' + art.tilt + ')' }, holes)));
  }

  /* ---------- Wiring ---------- */

  buildTypeSelector();
  buildCrest();

  $('show').addEventListener('click', render);
  $('newline').addEventListener('click', () => insertAtCursor('', { newLine: true }));
  $('rest').addEventListener('click', () => insertAtCursor('-'));
  $('clear').addEventListener('click', () => { el.notes.value = ''; render(); el.notes.focus(); });
  el.wrap.addEventListener('change', render);
  [el.title, el.subtitle].forEach((input) => {
    input.addEventListener('change', render);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); render(); } });
  });
  el.notes.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); render(); }
  });

  $('dl-svg').addEventListener('click', () => { if (currentTab) exporter.saveSvg(currentTab, el.title.value); });
  $('dl-png').addEventListener('click', () => { if (currentTab) exporter.savePng(currentTab, el.title.value); });
  $('print').addEventListener('click', () => window.print());
  $('share').addEventListener('click', async (e) => {
    const button = e.currentTarget;
    const url = location.href.split('#')[0] + '#' + share.encode(readState());
    try { await navigator.clipboard.writeText(url); button.textContent = 'Link copied!'; }
    catch (err) { window.prompt('Copy this link:', url); }
    setTimeout(() => { button.textContent = 'Copy share link'; }, 1800);
  });

  // Selecting another bookmark, or the browser's back/forward buttons, changes the address
  // without reloading the page, so the form has to be refilled from it.
  window.addEventListener('hashchange', loadFromAddress);
  loadFromAddress();

  /** For tests and for people who want to build on this. */
  ns.app = { render, selectOcarina: (id) => { selectOcarina(id); render(); } };
})();

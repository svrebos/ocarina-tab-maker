/* =====================================================================
   tab-drawing.js - draws the tab as SVG.

   buildTab() returns the same tab in two shapes:
   - svg():   one combined SVG, used for the SVG/PNG download;
   - parts(): a header plus one SVG per row, used on screen and for printing,
              so a page break can never cut a row in half.
   ===================================================================== */
(function () {
  'use strict';
  const ns = (window.OcarinaTab = window.OcarinaTab || {});
  const { h, s, clear } = ns.dom;

  const LABEL_H = 54;        // space under each picture for the note name
  const ROW_GAP = 22;
  const PAD = 26;
  const CELL_GAP = 30;       // horizontal space between pictures
  const SCREEN_SCALE = 0.62; // on screen a tab is shown at 62% of its drawing size
  const FONT = 'Georgia, "Times New Roman", serif';
  const COLORS = { ink: '#2b2118', muted: '#6a5c45', restMark: '#b7a894', restText: '#9a8a7a', error: '#b3261e', errorFill: '#fdf0ee' };

  /** Size of one picture, and of a picture plus its label, for an ocarina. */
  function cellSize(ocarina) {
    const { box, scale } = ocarina.artwork;
    const width = box.w * scale;
    const height = box.h * scale;
    return { width, height, cellWidth: width + CELL_GAP, cellHeight: height + LABEL_H };
  }

  /** One ocarina picture: the body plus its holes, filled according to the fingering. */
  function ocarinaPicture(ocarina, fingering) {
    const art = ocarina.artwork;
    const k = 1 / art.scale;
    const holes = [];
    Object.entries(art.holes).forEach(([name, hole]) => {
      holes.push(s('circle', {
        cx: hole.cx, cy: hole.cy, r: hole.r,
        fill: fingering.covered.has(name) ? '#000' : 'none',
        stroke: '#000', 'stroke-width': art.holeStroke * k
      }));
      if (fingering.half.has(name)) {
        // Lower half covered. The half-disc is kept level on screen, so undo the tilt around the hole centre.
        holes.push(s('path', {
          transform: 'rotate(' + (-art.tilt) + ' ' + hole.cx + ' ' + hole.cy + ')',
          d: 'M ' + (hole.cx - hole.r) + ' ' + hole.cy + ' A ' + hole.r + ' ' + hole.r + ' 0 0 0 ' + (hole.cx + hole.r) + ' ' + hole.cy + ' Z',
          fill: '#000'
        }));
      }
    });
    return [...art.body(k), s('g', { transform: 'rotate(' + art.tilt + ')' }, holes)];
  }

  /** Centered text. Pass `attrs` for size, weight and colour. */
  function text(content, x, y, attrs) {
    return s('text', { x, y, 'text-anchor': 'middle', 'font-family': FONT, ...attrs }, content);
  }

  /** What goes in one cell of a row: a note, a rest, or an error box. `x`,`y` is the top-left corner. */
  function cell(item, x, y, ocarina) {
    const { width, height } = cellSize(ocarina);
    const centerX = x + width / 2;
    const labelY = y + height + 38;
    if (item.type === 'note') {
      const { box, scale } = ocarina.artwork;
      return [
        s('g', { transform: 'translate(' + x + ',' + y + ') scale(' + scale + ') translate(' + (-box.x) + ',' + (-box.y) + ')' },
          s('title', null, item.label),
          ocarinaPicture(ocarina, ocarina.fingerings[item.midi])),
        text(item.label, centerX, labelY, { 'font-size': 34, 'font-weight': 700, fill: COLORS.ink })
      ];
    }
    if (item.type === 'rest') {
      return [
        text('–', centerX, y + height / 2 + 18, { 'font-size': 64, fill: COLORS.restMark }),
        text('rest', centerX, labelY, { 'font-size': 26, fill: COLORS.restText })
      ];
    }
    return [ // error: something that is not a note, or that this ocarina cannot play
      s('rect', {
        x: x + 20, y: y + 16, width: width - 40, height: height - 32, rx: 14,
        fill: COLORS.errorFill, stroke: COLORS.error, 'stroke-width': 3, 'stroke-dasharray': '10 8'
      }),
      text(item.token.slice(0, 8), centerX, y + height / 2 + 14, { 'font-family': 'monospace', 'font-size': 40, fill: COLORS.error }),
      text('?', centerX, labelY, { 'font-size': 26, fill: COLORS.error })
    ];
  }

  /**
   * Lays out the tab. `rows` comes from notes.layoutRows().
   * Returns { width, height, svg(), parts() } (see the top of this file).
   */
  function buildTab(rows, options, ocarina) {
    const title = (options.title || '').trim();
    const subtitle = (options.subtitle || '').trim();
    const { cellWidth, cellHeight } = cellSize(ocarina);
    const TITLE_FONT = 46;
    const SUBTITLE_FONT = 28;

    const columns = Math.max(1, ...rows.map((row) => row.length));
    const contentWidth = PAD * 2 + columns * cellWidth - CELL_GAP;
    const headerWidth = PAD * 2 + Math.max(title.length * TITLE_FONT * 0.58, subtitle.length * SUBTITLE_FONT * 0.5);
    const width = Math.max(contentWidth, headerWidth);
    const offsetX = (width - contentWidth) / 2; // center the rows

    /* Header: title and subtitle. Returns [nodes, height]; nodes are made fresh on each call. */
    const titleY = PAD + TITLE_FONT;
    const subtitleY = PAD + (title ? TITLE_FONT + 40 : SUBTITLE_FONT);
    let headerHeight = 0;
    if (subtitle) headerHeight = subtitleY + 24;
    else if (title) headerHeight = titleY + 24;
    const headerNodes = () => [
      title ? text(title, width / 2, titleY, { 'font-size': TITLE_FONT, 'font-weight': 700, fill: COLORS.ink }) : null,
      subtitle ? text(subtitle, width / 2, subtitleY, { 'font-size': SUBTITLE_FONT, 'font-style': 'italic', fill: COLORS.muted }) : null
    ];

    const rowNodes = (row, top) => row.map((item, i) => cell(item, offsetX + PAD + i * cellWidth, top, ocarina));
    const height = headerHeight + PAD * 2 + rows.length * cellHeight + Math.max(0, rows.length - 1) * ROW_GAP;

    return {
      width,
      height,
      svg() {
        return s('svg', { viewBox: '0 0 ' + width + ' ' + height, width, height, role: 'img', 'aria-label': 'Ocarina fingering tab' },
          s('rect', { width: '100%', height: '100%', fill: '#ffffff' }),
          headerNodes(),
          rows.map((row, i) => rowNodes(row, headerHeight + PAD + i * (cellHeight + ROW_GAP))));
      },
      parts() {
        const part = (cls, partHeight, label, nodes) => ({
          cls,
          svg: s('svg', {
            viewBox: '0 0 ' + width + ' ' + partHeight,
            style: 'max-width:' + Math.round(width * SCREEN_SCALE) + 'px;--w:' + width, // --w is used by the print CSS
            role: 'img', 'aria-label': label
          }, nodes)
        });
        const parts = rows.map((row) => part('row', cellHeight + ROW_GAP, 'Line of the tab', rowNodes(row, 0)));
        if (headerHeight) parts.unshift(part('head', headerHeight + PAD, 'Title', headerNodes()));
        return parts;
      }
    };
  }

  /** Draws the tab into `container` (as separate parts). Returns the tab, or null when there is nothing to show. */
  function show(container, rows, options, ocarina) {
    clear(container);
    if (!rows.length) {
      container.append(h('div', { class: 'empty' }, 'Nothing to show yet. Type some notes and press “Show tab”.'));
      return null;
    }
    const tab = buildTab(rows, options, ocarina);
    tab.parts().forEach((p) => container.append(h('div', { class: 'tabpart ' + p.cls }, p.svg)));
    return tab;
  }

  ns.drawing = { buildTab, show };
})();

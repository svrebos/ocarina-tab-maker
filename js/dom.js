/* =====================================================================
   dom.js - tiny helpers for building DOM and SVG elements.

   Instead of gluing HTML strings together, write
       h('button', { class: 'primary', onclick: save }, 'Save')
       s('circle', { cx: 10, cy: 10, r: 5, fill: 'none' })
   `h` builds HTML elements, `s` builds SVG elements. Text children are always
   inserted as text, so nothing has to be escaped by hand.
   ===================================================================== */
(function () {
  'use strict';
  const ns = (window.OcarinaTab = window.OcarinaTab || {});
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /** Sets attributes (`onclick: fn` adds a listener, null/false skips) and appends children. */
  function build(el, attrs, children) {
    Object.entries(attrs || {}).forEach(([name, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (name.startsWith('on') && typeof value === 'function') el.addEventListener(name.slice(2), value);
      else el.setAttribute(name, value === true ? '' : value);
    });
    append(el, children);
    return el;
  }

  /** Appends strings, nodes, or (nested) arrays of them; null/false are ignored. */
  function append(el, children) {
    children.forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      if (Array.isArray(child)) append(el, child);
      else el.append(child.nodeType ? child : document.createTextNode(String(child)));
    });
  }

  /** Splits "text with `code` parts" into text and <code> elements. */
  function richText(str) {
    return str.split('`').map((part, i) => (i % 2 ? build(document.createElement('code'), null, [part]) : part));
  }

  ns.dom = {
    SVG_NS,
    h: (tag, attrs, ...children) => build(document.createElement(tag), attrs, children),
    s: (tag, attrs, ...children) => build(document.createElementNS(SVG_NS, tag), attrs, children),
    /** Appends strings, nodes or arrays of them to an existing element. */
    add: (el, ...children) => append(el, children),
    richText,
    clear: (el) => el.replaceChildren()
  };
})();

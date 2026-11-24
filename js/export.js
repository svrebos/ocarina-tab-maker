/* =====================================================================
   export.js - downloading the tab as SVG or PNG.
   ===================================================================== */
(function () {
  'use strict';
  const ns = (window.OcarinaTab = window.OcarinaTab || {});

  /** Starts a browser download of `blob`. */
  function download(filename, blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  }

  /** Name for downloaded files: the title as a slug, or "ocarina-tab". */
  function fileBase(title) {
    const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return slug || 'ocarina-tab';
  }

  function svgMarkup(tab) {
    return new XMLSerializer().serializeToString(tab.svg());
  }

  function saveSvg(tab, title) {
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgMarkup(tab);
    download(fileBase(title) + '.svg', new Blob([xml], { type: 'image/svg+xml' }));
  }

  /** Renders the SVG onto a canvas at twice its size and downloads that as a PNG. */
  function savePng(tab, title) {
    const scale = 2;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = tab.width * scale;
      canvas.height = tab.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => blob && download(fileBase(title) + '.png', blob), 'image/png');
    };
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMarkup(tab));
  }

  ns.exporter = { saveSvg, savePng };
})();

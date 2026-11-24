/* Loads the browser scripts into a bare Node context, so the pure parts
   (notes, ocarina data, share links) can be tested without a browser. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILES = ['js/dom.js', 'js/notes.js', 'js/ocarinas/registry.js', 'js/ocarinas/ocarina-12.js', 'js/ocarinas/ocarina-6.js', 'js/share.js'];

module.exports = function load() {
  const sandbox = {};
  sandbox.window = sandbox; // the scripts attach themselves to window.OcarinaTab
  vm.createContext(sandbox);
  FILES.forEach((file) => {
    const code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    vm.runInContext(code, sandbox, { filename: file });
  });
  return sandbox.OcarinaTab;
};

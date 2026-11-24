# Ocarina Tab Maker

A small, dependency-free web page that turns typed notes into fingering tabs for a **12-hole ocarina** (alto/tenor C, range A4–F6, 21 notes) or a **6-hole ocarina** (C, range C5–E6, 17 notes).

- Pick the ocarina type at the top; you can switch at any time and the tab is converted instantly. Notes the selected ocarina cannot play are shown as red dashed boxes and listed under the input.

- Type notes (`C`, `C#`, `Eb`, `F#6`, `A4`, …), one line per line of tab.
- Optionally add a title and a subtitle; they appear above the tab (and in the downloads and the share link).
- Press **Show tab** to get one ocarina picture per note, with the note name underneath.
- Printing only prints the tab (no legend). Every line of the tab is kept together, so a fingering picture is never cut in half by a page break.
- Download as SVG or PNG, print, or copy a share link (the notes and the ocarina type are stored in the URL hash, nothing is sent to a server).

## Saving your tabs

There is no server and no account. The address of the page contains the whole tab (notes, title, subtitle, line width and ocarina type), so a **bookmark is a saved tab**:

1. Press **Show tab**, then bookmark the page (Ctrl/Cmd+D). The page title, and so the bookmark name, follows your tab title.
2. Keep all your tabs in one bookmark folder (for example "Ocarina tabs"). That folder is your collection, and your browser can sync it across devices.
3. **Copy share link** gives the same address, for sending a tab to someone else.

Press **Show tab** again after changing something, so the address is up to date before you bookmark.

## Run it

Open `index.html` in a browser. The page consists of several files that must stay together in the same folders (see below). To host it, put them all on GitHub Pages (or any static host). There is no build step. The only external request is Ko-fi's donation button script.

## Input format

| You type | Meaning |
| --- | --- |
| `C D E F G A B` | Octave 5 (C5–B5), the main scale |
| `C#`, `Db`, `F♯`, `B♭` | Sharps and flats (`#`/`♯`, `b`/`♭`) |
| `A4` `A#4` `B4` | The three low notes (use the sub-holes) |
| `C6` … `F6` | The high notes |
| `-` | A rest |
| new line (Enter) | Start a new line of tab |
| separators | spaces, commas, `;` and `|` all work |

Lines longer than the "wrap" setting (default 8) are wrapped automatically. Notes outside the range of the selected ocarina are shown as red dashed boxes and listed under the input.

## Project structure

No build step, no dependencies: plain HTML, CSS and JavaScript. Open `index.html` and it works.

```
index.html              page markup only
css/
  base.css              colour tokens (edit :root to retheme), reset, page width
  layout.css            header, panels, collapsible sections, footer
  components.css        form fields, buttons, palette, ocarina selector, tab output, legend
  print.css             print rules (only the tab is printed, rows never split)
js/
  dom.js                h() and s(): build HTML and SVG elements without string-gluing
  notes.js              typed text -> notes (parsing, ranges, line wrapping)
  ocarinas/
    registry.js         the list of ocarinas, plus the two fingering-table formats
    ocarina-12.js       12-hole: artwork, holes, fingerings, texts
    ocarina-6.js        6-hole: artwork, holes, fingerings, texts
  tab-drawing.js        draws the tab as SVG (combined for download, separate rows for screen/print)
  share.js              notes <-> page address (bookmarks and share links)
  export.js             SVG and PNG download
  support.js            the Ko-fi "Tip Me" button
  app.js                the page: form, buttons, rendering (loaded last)
tests/                  unit tests for notes, ocarina data and share links
```

The scripts are classic `<script>` tags in dependency order (see the bottom of `index.html`), not ES modules, so the page also works when opened straight from disk (`file://`), where browsers block modules.

## Adding or changing an ocarina

Everything specific to one ocarina lives in its own file in `js/ocarinas/`: the artwork (outline and hole coordinates from Inkscape), the fingering table, and the texts shown on the page.

- **Change a fingering**: edit the table in `ocarina-12.js` (list of covered holes per note) or `ocarina-6.js` (one letter per hole: `C` covered, `O` open, `H` half covered).
- **Restyle the artwork**: replace the path and hole coordinates in the same file.
- **Add a new ocarina**: copy `ocarina-6.js`, change the data, and add one `<script>` line for it in `index.html`. The selector, note palette, chart, legend, texts and error messages are generated from the registered ocarinas. The range is taken from the fingering table.

The shape of an ocarina definition is documented at the top of `js/ocarinas/registry.js`.

## Publishing updates

Browsers and GitHub Pages cache files for a while. The links in `index.html` therefore end in `?v=2`. After you change a CSS or JS file, raise that number in all those links (for example to `?v=3`) so visitors get the new files immediately instead of a mix of old and new ones.

## Tests

`npm test` (Node 20 or newer, nothing to install) runs the unit tests in `tests/`. They check, among other things, that every note in range has a fingering and that every fingering only uses holes that exist.

## Privacy, cookies and donations

- The page sets **no cookies itself**, has no analytics, and your notes are never sent anywhere. The only thing stored in your browser (localStorage) is your answer to the cookie question below.
- A small floating "Tip Me" button (Ko-fi) lets visitors leave a voluntary donation. Ko-fi's button script **sets cookies**, so it is only loaded after the visitor agrees in the cookie notice. A plain link to the Ko-fi page is always in the footer. "Cookie settings" in the footer reopens the notice; answering "No" after "Yes" reloads the page without the button (the current notes are kept in the address).
- Visiting the page from GitHub Pages is also logged by GitHub, as for any GitHub-hosted site (see GitHub's privacy statement).
- The notice and the button are never printed.

## Why no libraries?

The code base is small, and every dependency has to be downloaded, kept up to date and shipped with the page (or loaded from a third party, which would end "nothing is sent anywhere"). The small helper in `js/dom.js` gives the main benefit of a DOM or SVG library (no HTML strings, automatic escaping) in about 40 lines. The CSS is split by purpose and uses variables, which is easier to read here than a CSS framework would be. If the project grows a lot, a bundler plus a small library can still be added later.

Hole names in the 12-hole chart: `L`/`R` = left/right hand; `t` thumb, `p` pinky, `r` ring, `m` middle, `i` index, `s` sub-hole. The left sub-hole (`Ls`) is drawn next to the left ring-finger hole and the right sub-hole (`Rs`) next to the right middle-finger hole, as in the original drawing. In the 6-hole chart: `LM LI RI RM` are the finger holes (middle/index) and `LT RT` the thumb holes.

## About the fingerings

The natural notes and the sub-hole notes follow the standard 12-hole system (Asian system for the high notes). Sharps and flats are cross-fingerings and vary between makers; the chart used here was cross-checked against published 12-hole alto C charts. If your ocarina came with its own chart, trust that one and edit the table.

The 12-hole and 6-hole charts are common, published fingerings, which are factual information. The 6-hole chart follows the standard chart published at [playocarina.com](https://www.playocarina.com/fingering-chart/6-hole/) (with the half-covered holes for C♯5 and D♯5); where that site's text and chart disagree for the high notes, the chart was followed. Thanks to that site for making it available.

Pitch names are sounding pitches (A4–F6). Many tabs write 12-hole ocarina music one octave lower; if you work from such a score, shift your octave numbers accordingly.

## 6-hole ocarina

Layout: two thumb holes beside the mouthpiece, and four finger holes above them (upper row = middle fingers, lower row = index fingers). The chart is the common 6-hole C chart (C♯5 and D♯5 use a half-covered hole). Makers differ slightly for the highest notes; trust your instrument's own chart and edit the table in `js/ocarinas/ocarina-6.js` if needed.

## License

Code: MIT. Ocarina artwork (the outlines and hole layouts in `js/ocarinas/ocarina-12.js` and `js/ocarinas/ocarina-6.js`): CC BY 4.0. See `LICENSE`.

## Disclaimer

This is an independent fan-made tool. It is not affiliated with, endorsed by or connected to Nintendo. The visual style is only inspired by the look of the games; no Nintendo logos, characters or images are used.

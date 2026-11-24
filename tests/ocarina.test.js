const test = require('node:test');
const assert = require('node:assert/strict');
const ns = require('./load')();
const { notes, ocarinas, share } = ns;
/* The scripts run in their own vm context, so arrays/objects they return have a different prototype;
   copy them into this realm before comparing with deepEqual. */
const plain = (value) => JSON.parse(JSON.stringify(value));
const [oc12, oc6] = [ocarinas.get('12'), ocarinas.get('6')];

test('ranges are derived from the fingering tables', () => {
  assert.equal(oc12.rangeLabel, 'A4–F6');
  assert.equal(oc6.rangeLabel, 'C5–E6');
  assert.equal(Object.keys(oc12.fingerings).length, 21);
  assert.equal(Object.keys(oc6.fingerings).length, 17);
});

test('every note in range has a fingering, and only uses holes that exist', () => {
  ocarinas.list.forEach((oc) => {
    for (let midi = oc.min; midi <= oc.max; midi++) {
      const f = oc.fingerings[midi];
      assert.ok(f, oc.label + ' lacks a fingering for ' + notes.label(midi));
      [...f.covered, ...f.half].forEach((hole) =>
        assert.ok(oc.artwork.holes[hole], oc.label + ' ' + notes.label(midi) + ': unknown hole ' + hole));
    }
  });
});

test('spot checks of fingerings', () => {
  assert.deepEqual([...oc12.fingerings[72].covered].sort(), 'Lt Lp Lr Lm Li Rt Ri Rm Rr Rp'.split(' ').sort()); // C5
  assert.equal(oc12.fingerings[89].covered.size, 0);                                                          // F6
  assert.deepEqual([...oc6.fingerings[73].half], ['RM']);                                                      // C#5
  assert.equal(oc6.fingerings[72].covered.size, 6);                                                            // C5
  assert.equal(oc6.fingerings[88].covered.size, 0);                                                            // E6
});

test('notes: names, accidentals, octaves', () => {
  assert.equal(notes.midiFromName('C5'), 72);
  assert.equal(notes.readNote('C').midi, 72);       // no octave = octave 5
  assert.equal(notes.readNote('Eb').midi, 75);
  assert.equal(notes.readNote('Eb').flat, true);
  assert.equal(notes.readNote('F♯6').midi, 90);
  assert.equal(notes.readNote('H'), null);
  assert.equal(notes.label(73, false), 'C♯5');
  assert.equal(notes.label(73, true), 'D♭5');
});

test('parse: ranges per ocarina, rests, errors', () => {
  const [line] = notes.parse('A4 C5 F6 - X Bb3', oc12);
  assert.deepEqual(plain(line.map((i) => i.type)), ['note', 'note', 'note', 'rest', 'error', 'error']);
  const [line6] = notes.parse('A4 C5 F6 E6', oc6);
  assert.deepEqual(plain(line6.map((i) => i.type)), ['error', 'note', 'error', 'note']);
  assert.match(line6[0].reason, /outside the range C5–E6 of the 6-hole ocarina/);
});

test('layoutRows: new lines, wrapping, blank lines', () => {
  const parsed = notes.parse('C D E F G\n\nA B', oc12);
  const rows = notes.layoutRows(parsed, 3);
  assert.deepEqual(plain(rows.map((r) => r.length)), [3, 2, 2]);
});

test('share links survive a round trip', () => {
  const state = { notes: 'C D#\nE6 -', wrap: 5, type: '6', title: 'Ode & Joy', subtitle: 'Über #1' };
  assert.deepEqual(plain(share.decode('#' + share.encode(state))), state);
  const d = share.decode('');
  assert.equal(d.type, '12');
  assert.equal(d.wrap, 8);
  assert.equal(d.notes, share.EXAMPLE_NOTES);
});

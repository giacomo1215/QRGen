const { buildVCardFromData, escapeV, yyyymmdd } = require('../src/js/vcard');

test('yyyymmdd formats date correctly and returns empty on invalid', () => {
  expect(yyyymmdd('2020-01-02')).toBe('20200102');
  expect(yyyymmdd('invalid-date')).toBe('');
  expect(yyyymmdd('')).toBe('');
});

test('escapeV escapes special characters', () => {
  const input = "Line1\nLine2;Comma,Back\\slash";
  const out = escapeV(input);
  expect(out).toContain('\\n');
  expect(out).toContain('\\;');
  expect(out).toContain('\\,');
  expect(out).toContain('\\\\');
});

test('buildVCardFromData creates a vCard with expected fields', () => {
  const data = {
    first: 'Ada',
    last: 'Lovelace',
    org: 'Analytical Engines',
    phone: '',
    mob: '+39 333 1234567',
    emailP: 'ada@example.com',
    bday: '1815-12-10',
    note: 'Met at a conference',
  };
  const v = buildVCardFromData(data);
  expect(v).toMatch(/BEGIN:VCARD/);
  expect(v).toMatch(/FN:Ada Lovelace/);
  expect(v).toMatch(/ORG:Analytical Engines/);
  expect(v).toMatch(/TEL;TYPE=CELL:\+39 333 1234567/);
  expect(v).toMatch(/EMAIL;TYPE=INTERNET:ada@example.com/);
  expect(v).toMatch(/BDAY:18151210/);
  expect(v).toMatch(/NOTE:.*Met at a conference/);
});

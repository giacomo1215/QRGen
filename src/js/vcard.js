// vCard 3.0 builder (pure). UMD: CommonJS for tests, browser global otherwise.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.vcard = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  function escapeV(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');
  }

  function yyyymmdd(iso) {
    if (!iso) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso).trim());
    if (!m) return '';
    const y = +m[1], mo = +m[2], d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return '';
    return `${m[1]}${m[2]}${m[3]}`;
  }

  function line(prop, value) {
    if (value == null) return '';
    const s = String(value).trim();
    if (!s) return '';
    return `${prop}:${s}\r\n`;
  }

  function buildVCardFromData(d) {
    d = d || {};
    const out = [];

    out.push('BEGIN:VCARD\r\n');
    out.push('VERSION:3.0\r\n');

    // Name
    const n = [
      d.last || '', d.first || '', '', d.prefix || '', d.suffix || ''
    ].map(escapeV).join(';');
    out.push(`N:${n}\r\n`);

    const fnParts = [];
    if (d.prefix) fnParts.push(d.prefix);
    if (d.first || d.last) fnParts.push([d.first, d.last].filter(Boolean).join(' '));
    if (!d.first && !d.last && d.org) fnParts.push(d.org);
    if (d.suffix) fnParts.push(d.suffix);
    const fn = fnParts.join(' ').trim() || 'Contact';
    out.push(`FN:${escapeV(fn)}\r\n`);

    // Organization
    if (d.org || d.dept) {
      out.push(`ORG:${escapeV(d.org || '')}${d.dept ? ';' + escapeV(d.dept) : ''}\r\n`);
    }
    out.push(line('TITLE', d.title));
    out.push(line('ROLE', d.role));

    // Dates
    const bday = yyyymmdd(d.bday);
    if (bday) out.push(`BDAY:${bday}\r\n`);
    const anniv = yyyymmdd(d.anniv);
    if (anniv) out.push(`ANNIVERSARY:${anniv}\r\n`);
    out.push(line('GENDER', d.gender));
    out.push(line('PHOTO', d.photo));

    // Phones
    out.push(line('TEL;TYPE=CELL', d.mob));
    out.push(line('TEL;TYPE=WORK', d.work));
    out.push(line('TEL;TYPE=HOME', d.home));
    out.push(line('TEL;TYPE=FAX', d.fax));
    if (d.im) out.push(line('X-IM', d.im));

    // Email
    out.push(line('EMAIL;TYPE=INTERNET', d.emailP));
    out.push(line('EMAIL;TYPE=INTERNET', d.emailW));

    // Addresses (ADR: pobox;extended;street;city;region;zip;country)
    function adr(street, city, region, zip, country) {
      return ['', '', street || '', city || '', region || '', zip || '', country || '']
        .map(escapeV).join(';');
    }
    if (d.hStreet || d.hCity || d.hRegion || d.hZip || d.hCountry) {
      out.push(`ADR;TYPE=HOME:${adr(d.hStreet, d.hCity, d.hRegion, d.hZip, d.hCountry)}\r\n`);
    }
    if (d.wStreet || d.wCity || d.wRegion || d.wZip || d.wCountry) {
      out.push(`ADR;TYPE=WORK:${adr(d.wStreet, d.wCity, d.wRegion, d.wZip, d.wCountry)}\r\n`);
    }
    if (d.hGeo) out.push(line('GEO', d.hGeo));
    out.push(line('TZ', d.tz));

    // URLs / socials
    out.push(line('URL', d.website));
    if (d.linkedin) out.push(line('X-SOCIALPROFILE;TYPE=linkedin', d.linkedin));
    if (d.instagram) out.push(line('X-SOCIALPROFILE;TYPE=instagram', d.instagram));
    if (d.tagline) out.push(line('X-TAGLINE', d.tagline));

    // Note
    if (d.note) out.push(`NOTE:${escapeV(d.note)}\r\n`);

    out.push('END:VCARD\r\n');
    return out.join('');
  }

  return { buildVCardFromData, escapeV, yyyymmdd };
}));
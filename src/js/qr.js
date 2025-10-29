// Utility
const $ = (id) => document.getElementById(id);
const modeRadios = document.querySelectorAll('input[name="mode"]');

const escapeV = (s) =>
    (s || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

function yyyymmdd(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}${m}${day}`;
}

// Build vCard 3.0
function buildVCard() {
    const prefix = $("namePrefix").value.trim();
    const first = $("firstName").value.trim();
    const last = $("lastName").value.trim();
    const suffix = $("nameSuffix").value.trim();
    const org = $("org").value.trim();
    const dept = $("dept").value.trim();
    const title = $("title").value.trim();
    const role = $("role").value.trim();
    const bday = yyyymmdd($("bday").value);
    const anniv = yyyymmdd($("anniversary").value);
    const gender = $("gender").value.trim();
    const photo = $("photo").value.trim();

    const mob = $("phoneMobile").value.trim();
    const work = $("phoneWork").value.trim();
    const home = $("phoneHome").value.trim();
    const fax  = $("fax").value.trim();
    const im   = $("imHandle").value.trim();

    const emailP = $("emailPersonal").value.trim();
    const emailW = $("emailWork").value.trim();

    const hStreet = $("addrHomeStreet").value.trim();
    const hCity = $("addrHomeCity").value.trim();
    const hRegion = $("addrHomeRegion").value.trim();
    const hZip = $("addrHomeZip").value.trim();
    const hCountry = $("addrHomeCountry").value.trim();
    const hGeo = $("geoHome").value.trim(); // "lat,long"

    const wStreet = $("addrWorkStreet").value.trim();
    const wCity = $("addrWorkCity").value.trim();
    const wRegion = $("addrWorkRegion").value.trim();
    const wZip = $("addrWorkZip").value.trim();
    const wCountry = $("addrWorkCountry").value.trim();
    const tz = $("tz").value.trim();

    const website = $("urlWebsite").value.trim();
    const linkedin = $("linkedin").value.trim();
    const instagram = $("instagram").value.trim();
    const tagline = $("tagline").value.trim();

    const note = $("note").value;

    // Formatted name for FN
    const fnParts = [];
    if (prefix) fnParts.push(prefix);
    if (first || last) fnParts.push([first, last].filter(Boolean).join(" "));
    if (!first && !last && org) fnParts.push(org);
    if (suffix) fnParts.push(suffix);
    const fn = fnParts.join(" ").trim() || "Contact";

    // vCard lines
    const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    // N:Last;First;Middle;Prefix;Suffix
    `N:${escapeV(last)};${escapeV(first)};;${escapeV(prefix)};${escapeV(suffix)}`,
    `FN:${escapeV(fn)}`
    ];

    if (org || dept) {
    // ORG can include Department after a semicolon
    // ORG:Company;Department
    const orgLine = dept ? `${escapeV(org)};${escapeV(dept)}` : escapeV(org);
    lines.push(`ORG:${orgLine}`);
    }

    if (title) lines.push(`TITLE:${escapeV(title)}`);
    if (role)  lines.push(`ROLE:${escapeV(role)}`);

    if (bday) lines.push(`BDAY:${bday}`);
    // ANNIVERSARY is not standard in vCard 3.0, but many scanners just add it to notes.
    if (anniv) lines.push(`X-ANNIVERSARY:${anniv}`);

    if (gender) lines.push(`X-GENDER:${escapeV(gender)}`);
    if (photo)  lines.push(`PHOTO;VALUE=URI:${escapeV(photo)}`);

    if (mob)  lines.push(`TEL;TYPE=CELL:${escapeV(mob)}`);
    if (work) lines.push(`TEL;TYPE=WORK,VOICE:${escapeV(work)}`);
    if (home) lines.push(`TEL;TYPE=HOME,VOICE:${escapeV(home)}`);
    if (fax)  lines.push(`TEL;TYPE=FAX:${escapeV(fax)}`);
    if (im)   lines.push(`IMPP:${escapeV(im)}`);

    if (emailP) lines.push(`EMAIL;TYPE=INTERNET:${escapeV(emailP)}`);
    if (emailW) lines.push(`EMAIL;TYPE=WORK,INTERNET:${escapeV(emailW)}`);

    // Addresses
    const hasHomeAddr = hStreet || hCity || hRegion || hZip || hCountry;
    if (hasHomeAddr) {
    lines.push(
        `ADR;TYPE=HOME:;;${escapeV(hStreet)};${escapeV(hCity)};${escapeV(hRegion)};${escapeV(hZip)};${escapeV(hCountry)}`
    );
    }
    if (hGeo) {
    // GEO in vCard 3.0 often appears as "geo:lat,long"
    lines.push(`GEO:${escapeV(hGeo.startsWith("geo:") ? hGeo : "geo:" + hGeo)}`);
    }

    const hasWorkAddr = wStreet || wCity || wRegion || wZip || wCountry;
    if (hasWorkAddr) {
    lines.push(
        `ADR;TYPE=WORK:;;${escapeV(wStreet)};${escapeV(wCity)};${escapeV(wRegion)};${escapeV(wZip)};${escapeV(wCountry)}`
    );
    }

    if (tz) lines.push(`TZ:${escapeV(tz)}`);

    // Web / socials
    if (website)  lines.push(`URL:${escapeV(website)}`);
    if (linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${escapeV(linkedin)}`);
    if (instagram)lines.push(`X-SOCIALPROFILE;TYPE=instagram:${escapeV(instagram)}`);

    // Tagline and Notes get merged into NOTE so phones don't lose them
    const extraNotes = [];
    if (tagline) extraNotes.push("Tagline: " + tagline);
    if (anniv)   extraNotes.push("Anniversary: " + anniv);
    if (instagram) extraNotes.push("Instagram: " + instagram);
    if (linkedin)  extraNotes.push("LinkedIn: " + linkedin);
    if (note)    extraNotes.push(note);

    if (extraNotes.length > 0) {
    lines.push(`NOTE:${escapeV(extraNotes.join(" | "))}`);
    }

    lines.push("END:VCARD");
    return lines.join("\r\n");
}

function normalizeUrl(u) {
    const s = (u || "").trim();
    if (!s) return "";
    if (/^[a-z]+:/i.test(s)) return s;
    return "https://" + s;
}

function currentData() {
    const mode = [...modeRadios].find(r => r.checked)?.value || "url";
    if (mode === "url") {
    return normalizeUrl($("urlInput").value);
    } else {
    return buildVCard();
    }
}

// QR init
const qr = new QRCodeStyling({
    width: Number($("size").value) || 320,
    height: Number($("size").value) || 320,
    type: "svg",
    data: "https://example.com",
    margin: Number($("margin").value) || 2,
    qrOptions: { errorCorrectionLevel: $("ecc").value || "Q" },
    dotsOptions: { type: "square" },
    backgroundOptions: { color: "#ffffff" }
});

const mount = $("qrPreview");
qr.append(mount);

function refreshQR() {
    const data = currentData();
    const size = Math.max(120, Math.min(1024, Number($("size").value) || 320));
    const margin = Math.max(0, Math.min(8, Number($("margin").value) || 2));
    const ecc = $("ecc").value;

    qr.update({
    data,
    width: size,
    height: size,
    margin,
    qrOptions: { errorCorrectionLevel: ecc }
    });
}

function toggleForms() {
    const mode = [...modeRadios].find(r => r.checked)?.value || "url";
    $("urlForm").classList.toggle("hide", mode !== "url");
    $("contactForm").classList.toggle("hide", mode !== "contact");
    refreshQR();
}

modeRadios.forEach(r => r.addEventListener("change", toggleForms));
$("refresh").addEventListener("click", refreshQR);

// Live updates
const inputs = document.querySelectorAll("input, textarea, select");
inputs.forEach(el => el.addEventListener("input", () => {
    clearTimeout(window.__qrUpdateTimer);
    window.__qrUpdateTimer = setTimeout(refreshQR, 120);
}));

// Export
document.querySelectorAll("button[data-ext]").forEach(btn => {
    btn.addEventListener("click", async () => {
    const ext = btn.getAttribute("data-ext");
    const name = ($("fileName").value || "qr-code").replace(/[^\w\-\.]+/g, "_");
    await qr.download({ name, extension: ext });
    });
});

// Initial paint
refreshQR();
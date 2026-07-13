// Utility
const $ = (id) => document.getElementById(id);
const modeRadios = document.querySelectorAll('input[name="mode"]');

// Build vCard by collecting DOM values and delegating to the pure builder (if available)
function buildVCard() {
    const data = {
        prefix: $("namePrefix").value.trim(),
        first: $("firstName").value.trim(),
        last: $("lastName").value.trim(),
        suffix: $("nameSuffix").value.trim(),
        org: $("org").value.trim(),
        dept: $("dept").value.trim(),
        title: $("title").value.trim(),
        role: $("role").value.trim(),
        bday: $("bday").value,
        anniv: $("anniversary").value,
        gender: $("gender").value.trim(),
        photo: $("photo").value.trim(),

        mob: $("phoneMobile").value.trim(),
        work: $("phoneWork").value.trim(),
        home: $("phoneHome").value.trim(),
        fax: $("fax").value.trim(),
        im: $("imHandle").value.trim(),

        emailP: $("emailPersonal").value.trim(),
        emailW: $("emailWork").value.trim(),

        hStreet: $("addrHomeStreet").value.trim(),
        hCity: $("addrHomeCity").value.trim(),
        hRegion: $("addrHomeRegion").value.trim(),
        hZip: $("addrHomeZip").value.trim(),
        hCountry: $("addrHomeCountry").value.trim(),
        hGeo: $("geoHome").value.trim(),

        wStreet: $("addrWorkStreet").value.trim(),
        wCity: $("addrWorkCity").value.trim(),
        wRegion: $("addrWorkRegion").value.trim(),
        wZip: $("addrWorkZip").value.trim(),
        wCountry: $("addrWorkCountry").value.trim(),
        tz: $("tz").value.trim(),

        website: $("urlWebsite").value.trim(),
        linkedin: $("linkedin").value.trim(),
        instagram: $("instagram").value.trim(),
        tagline: $("tagline").value.trim(),

        note: $("note").value,
    };

    if (typeof vcard !== 'undefined' && typeof vcard.buildVCardFromData === 'function') {
        return vcard.buildVCardFromData(data);
    }

    // Fallback: if the pure builder isn't loaded, build inline (minimal fallback)
    // This mirrors the previous behaviour but keeps the code small for reliability.
    const fnParts = [];
    if (data.prefix) fnParts.push(data.prefix);
    if (data.first || data.last) fnParts.push([data.first, data.last].filter(Boolean).join(" "));
    if (!data.first && !data.last && data.org) fnParts.push(data.org);
    if (data.suffix) fnParts.push(data.suffix);
    const fn = fnParts.join(" ").trim() || "Contact";

    return `BEGIN:VCARD\r\nVERSION:3.0\r\nN:${data.last};${data.first};;${data.prefix};${data.suffix}\r\nFN:${fn}\r\nEND:VCARD`;
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
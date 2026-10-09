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

function currentMode() {
    return [...modeRadios].find(r => r.checked)?.value || "url";
}

function sanitizeFileName(name) {
    return (name || "qr-code").replace(/[^\w\-\.]+/g, "_");
}

// Batch mode: one QR per code line, URL = prefix + code + suffix
let batchQrs = [];

function batchSettings() {
    return {
        width: Math.max(120, Math.min(1024, Number($("size").value) || 320)),
        height: Math.max(120, Math.min(1024, Number($("size").value) || 320)),
        type: "canvas",
        margin: Math.max(0, Math.min(8, Number($("margin").value) || 2)),
        qrOptions: { errorCorrectionLevel: $("ecc").value || "Q" },
        dotsOptions: { type: "square" },
        backgroundOptions: { color: "#ffffff" }
    };
}

function renderBatch() {
    const container = $("batchPreview");
    container.innerHTML = "";
    batchQrs = [];

    const prefix = $("batchPrefix").value.trim();
    const suffix = $("batchSuffix").value.trim();
    const codes = $("batchCodes").value.split("\n").map(s => s.trim()).filter(Boolean);

    if (!prefix || codes.length === 0) {
        container.innerHTML = '<p class="muted">Enter a URL prefix and at least one code (one per line) to preview the batch.</p>';
        return;
    }

    const grid = document.createElement("div");
    grid.className = "batch-grid";

    codes.forEach(code => {
        const url = normalizeUrl(prefix) + code + suffix;

        const item = document.createElement("div");
        item.className = "batch-item";
        item.title = url;

        const instance = new QRCodeStyling({ ...batchSettings(), data: url });
        instance.append(item);
        batchQrs.push({ code, instance, item });

        const label = document.createElement("div");
        label.className = "batch-label";
        label.textContent = code;
        item.appendChild(label);

        item.addEventListener("click", () => {
            instance.download({ name: sanitizeFileName(code), extension: "png" });
        });

        grid.appendChild(item);
    });

    container.appendChild(grid);
}

async function exportBatch(ext) {
    if (ext === "svg") {
        alert("Batch SVG export is not supported. Use PNG or JPEG (delivered as a ZIP).");
        return;
    }
    if (batchQrs.length === 0) {
        alert("No QR codes to download. Enter a URL prefix and at least one code first.");
        return;
    }
    try {
        const zip = new JSZip();
        const mime = ext === "jpeg" ? "image/jpeg" : "image/png";
        for (const { code, item } of batchQrs) {
            const canvas = item.querySelector("canvas");
            if (!canvas) continue;
            const dataUrl = canvas.toDataURL(mime);
            zip.file(sanitizeFileName(code) + "." + ext, dataUrl.split(",")[1], { base64: true });
        }
        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.download = "qrgen-batch.zip";
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    } catch (err) {
        console.error("Batch export failed:", err);
        alert("Batch export failed. Check the browser console (F12) for details.");
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
    const mode = currentMode();
    $("urlForm").classList.toggle("hide", mode !== "url");
    $("batchForm").classList.toggle("hide", mode !== "batch");
    $("contactForm").classList.toggle("hide", mode !== "contact");
    $("qrPreview").classList.toggle("hide", mode === "batch");
    $("batchPreview").classList.toggle("hide", mode !== "batch");
    render();
}

modeRadios.forEach(r => r.addEventListener("change", toggleForms));

function render() {
    if (currentMode() === "batch") renderBatch();
    else refreshQR();
}

$("refresh").addEventListener("click", render);
$("downloadAllBatch").addEventListener("click", () => exportBatch("png"));

// Live updates
const inputs = document.querySelectorAll("input, textarea, select");
inputs.forEach(el => el.addEventListener("input", () => {
    clearTimeout(window.__qrUpdateTimer);
    window.__qrUpdateTimer = setTimeout(render, 120);
}));

// Export
document.querySelectorAll("button[data-ext]").forEach(btn => {
    btn.addEventListener("click", async () => {
    const ext = btn.getAttribute("data-ext");
    if (currentMode() === "batch") {
        await exportBatch(ext);
        return;
    }
    const name = sanitizeFileName($("fileName").value);
    await qr.download({ name, extension: ext });
    });
});

// Initial paint
refreshQR();
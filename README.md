
# QRGen

A small, client-side QR code generator web app. It supports two main modes:

- URL - generate a QR that encodes a web address.
- Contact (vCard) - generate a vCard 3.0 QR containing name, phones, emails, addresses, socials and notes.

This project is static (HTML/CSS/JS) and uses the `qr-code-styling` library via CDN to render and export QR codes (PNG, JPEG, SVG).

## Features

- Live preview of the QR code as you edit fields.
- Two content modes: simple URL and detailed Contact (vCard 3.0).
- vCard builder supports prefix/suffix, phones, emails, home/work addresses, geo, socials, photo URI, birthday and notes.
- Adjustable size, quiet zone (margin), and error-correction level (L/M/Q/H).
- Export to PNG, JPEG or SVG using the export buttons.

## How it works

- `index.html` contains the UI and loads `src/js/qr.js` and `src/css/style.css`.
- The app includes the `qr-code-styling` library from jsDelivr CDN:
	`https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0/lib/qr-code-styling.js`.
- In URL mode the value from the `#urlInput` field is normalized and encoded.
- In Contact mode the form fields are converted into a vCard 3.0 string (see `src/js/qr.js` -> `buildVCard()`), which becomes the QR payload.

## File structure

```
index.html           # App entry (UI)
README.md            # This file
src/
	css/style.css      # Styling
	js/qr.js           # App logic and vCard builder
```

## Development notes

- The code is plain HTML/CSS/JS — no build step required.
- Key files to edit:
	- `src/js/qr.js` — main logic, vCard builder and QR config.
	- `index.html` — form layout and element IDs referenced by the JS.
	- `src/css/style.css` — styles and responsive layout.
- The vCard builder outputs vCard 3.0 with a few extended properties (e.g., `X-SOCIALPROFILE`, `X-ANNIVERSARY` in `NOTE`). Many phones will import common fields (FN, ORG, TEL, EMAIL, ADR, PHOTO).

### Quick dev workflow

1. Open the project in your editor.
2. Edit `src/js/qr.js` or `index.html`.
3. Reload the page in the browser to see changes.

## Security & Privacy

- Everything runs client-side in the browser. No data is sent to external servers by the app itself (the only external call is the CDN script for the QR library).
- If you enter personal contact information in the Contact mode, it remains local to your browser session unless you choose to export/share the generated QR image or data.

## Contributing

Feel free to open issues or submit pull requests. If you add features that change public behavior, please include a short example and tests if applicable.

## License

This project is licensed under the MIT License — see the accompanying `LICENSE` file for details.

Copyright (c) 2025 Giacomo Giorgi
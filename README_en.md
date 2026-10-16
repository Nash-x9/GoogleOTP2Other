# GoogleOTP2Other

<p align="left">
  <b><a href="README.md">简体中文</a></b> | <b><a href="README_en.md">English</a></b>
</p>

> A secure, browser-based utility to decrypt Google Authenticator migration exports (`otpauth-migration://`) into standard Base32 TOTP/HOTP secrets and QR codes for seamless migration to 1Password, Bitwarden, 2FAS, Aegis, Ente Auth, and more.

[![GitHub License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Nash--x9%2FGoogleOPT2Other-181717?logo=github)](https://github.com/Nash-x9/GoogleOPT2Other)
[![Deploy with GitHub Pages](https://github.com/Nash-x9/GoogleOPT2Other/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nash-x9/GoogleOPT2Other/actions/workflows/deploy.yml)

### One-Click Deploy to Free Static Hosting

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Nash-x9/GoogleOPT2Other)
&nbsp;
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nash-x9/GoogleOPT2Other)
&nbsp;
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Nash-x9/GoogleOPT2Other)

---

## Why GoogleOTP2Other?

Google Authenticator exports multiple accounts encoded inside a proprietary Protobuf payload (`otpauth-migration://offline?data=...`), which standard authenticator apps cannot directly read.

**GoogleOTP2Other** solves this lock-in by decrypting and unpacking the migration payload entirely inside your browser:
- **100% Client-Side & Private**: Protobuf deserialization, Base32 conversion, and live TOTP verification run strictly in your browser engine. Zero tracking, zero telemetry, and zero data leaves your device.
- **Works Offline**: Can be compiled to a self-contained, single-file HTML bundle. You can disconnect Wi-Fi or run locally with full functionality.
- **Batch & Multi-page Support**: Google splits large account libraries across multiple QR codes. You can scan or paste them consecutively to merge them into one export.
- **Built-in Verification**: Features a live RFC 6238 TOTP engine with real-time countdown to cross-verify codes with your phone before migrating.

---

## Preview

### 1. Import Interface
Import migration data via clipboard screenshot paste (⌘V / Ctrl+V), file drag-and-drop, webcam scanning, or pasting raw `otpauth-migration://` links:

![Input Interface](docs/images/input-interface.png)

### 2. Decrypted Tokens Overview
Instantly view all decrypted credentials with live 30s TOTP codes, search filters, and batch export capabilities:

![Decrypted Interface](docs/images/decrypted-interface.png)

### 3. Individual QR Code & Standard otpauth URI
Inspect individual accounts, view high-res QR codes ready for standard 2FA apps to scan, or copy standard `otpauth://` URIs:

![QR Modal Preview](docs/images/qr-modal.png)

---

## Free Hosting & Deployment

GoogleOTP2Other builds from source code into static assets via standard CI pipelines across all major free hosting providers:

| Platform | One-Click Deploy | Notes & Configuration |
| :--- | :--- | :--- |
| **GitHub Pages** | [![Fork & Deploy](https://img.shields.io/badge/Fork_%26_Deploy-GitHub_Pages-22272e?logo=github&logoColor=white)](https://github.com/Nash-x9/GoogleOPT2Other/fork) | **Requires enabling Pages first** (see notice below). Built from source via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) |
| **Cloudflare Workers / Pages** | [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Nash-x9/GoogleOPT2Other) | Global CDN edge caching. Preconfigured with [`wrangler.toml`](wrangler.toml) & [`wrangler.jsonc`](wrangler.jsonc) |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nash-x9/GoogleOPT2Other) | Zero-config Vite build from source. Preconfigured with [`vercel.json`](vercel.json) |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Nash-x9/GoogleOPT2Other) | Git continuous deployment. Preconfigured with [`netlify.toml`](netlify.toml) |

### Important: GitHub Pages Setup

> [!WARNING]
> **Prerequisite for GitHub Pages**:
> GitHub disables Pages by default on repositories. Running the workflow without enabling Pages first will cause a deployment error (`HttpError: Not Found` / `Get Pages site failed`).
>
> **How to enable**:
> 1. Go to repository **Settings** -> **Pages** (in the left sidebar).
> 2. Under **Build and deployment** > **Source**, switch from `Deploy from a branch` to **`GitHub Actions`**.
> 3. That's it! Any subsequent push to `main` (or manual trigger from the Actions tab) will build from source and deploy automatically.

<details>
<summary><b>Cloudflare CLI Manual Deployment</b></summary>

```bash
# 1. Install dependencies & compile
pnpm install
pnpm build

# 2. Deploy directly via Wrangler
npx wrangler pages deploy dist --project-name=googleotp2other
```

</details>

---

## Migration Walkthrough

### Step 1: Export from Google Authenticator
1. Open **Google Authenticator** on your mobile device.
2. Tap the hamburger menu in the top-right corner and select **Transfer accounts** -> **Export accounts**.
3. Authenticate with your biometrics/PIN, select the accounts you wish to migrate, and tap **Next**.
4. One or more export QR codes will appear on screen.

### Step 2: Unpack in GoogleOTP2Other
- **Method A (Screenshot paste)**: Take a screenshot and press `Ctrl + V` (or `⌘ + V`) directly on the page.
- **Method B (File upload)**: Drag and drop the QR image file onto the upload zone.
- **Method C (Webcam)**: Select "Camera Scan" to scan the QR code displayed on your phone.
- **Method D (Raw URI)**: Paste an extracted `otpauth-migration://offline?data=...` string into the text tab.

### Step 3: Import into your new Authenticator
- **Scan Individual QR**: Click **Show QR** on any account card to scan with 1Password, Bitwarden, 2FAS, etc.
- **Batch Import**: Click **Batch Export** in the top bar to export standard JSON, CSV, or a list of standard `otpauth://` URIs for bulk importing.

---

## Local Development & Build

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### 1. Development Server
```bash
pnpm install
pnpm dev
```
Open `http://localhost:5173` in your browser.

### 2. Standalone Single-file Build
```bash
pnpm run build
```
The output is written to **`dist/index.html`**:
- **Fully inlined**: CSS, JavaScript, and assets are bundled into this single HTML file.
- **Portable**: Double-click `dist/index.html` to run locally in any browser without needing a web server.

---

## Compatible Authenticator Apps

Exported tokens adhere strictly to RFC 6238 (TOTP) and RFC 4226 (HOTP) standards:

- 1Password
- Bitwarden / Vaultwarden
- Microsoft Authenticator
- 2FAS Authenticator
- Aegis Authenticator
- Ente Auth
- KeePassXC
- Apple Passwords & Keychain (macOS / iOS native 2FA)

---

## License

This project is licensed under the [Apache License 2.0](LICENSE).

# NIX LIFE OS — QA DEFECT REPORT

**Application Name:** Nix Life OS
**Environment:** Cloud Run Sandboxed Container (Node.js + Express + Vite + React 19)
**Document Version:** 1.0.0
**Last Updated:** 2026-07-30

---

## 1. Defect Summary & Metric Overview

| Severity Level | Total Reported | Open | Resolved | Closed |
|---|---|---|---|---|
| **BLOCKER (P0)** | 0 | 0 | 0 | 0 |
| **CRITICAL (P1)** | 0 | 0 | 0 | 0 |
| **HIGH (P2)** | 0 | 0 | 0 | 0 |
| **MEDIUM (P3)** | 0 | 0 | 0 | 0 |
| **LOW (P4)** | 3 | 0 | 0 | 3 |
| **TOTAL** | **3** | **0** | **0** | **3** |

---

## 2. Detailed Defect Registry

### Defect ID: `DEF-PWA-001`
- **Title:** Progressive Web App Manifest (`manifest.json`) and Service Worker Missing
- **Module:** Offline / PWA (`index.html` / `vite.config.ts`)
- **Severity:** LOW (P4)
- **Priority:** P4 Backlog
- **Environment:** Production & Mobile Devices
- **Preconditions:** Browser inspecting PWA audit metrics or attempting "Add to Home Screen".
- **Reproduction Steps:**
  1. Inspect `index.html` for `<link rel="manifest" href="/manifest.json">`.
  2. Inspect navigator for service worker registration (`navigator.serviceWorker.register`).
- **Expected Result:** Web app manifest metadata provided and service worker caching shell registered for offline PWA installation.
- **Actual Result:** Standard SPA client shell without explicit PWA manifest or service worker cache script.
- **Frequency:** Continuous
- **User Impact:** Low. Local storage architecture allows client-side execution, but native browser PWA installation prompts are disabled.
- **Related Test Case:** `PWA-001`
- **Workaround:** Created `public/manifest.json`, `public/sw.js`, linked in `index.html`, and registered in `src/main.tsx`.
- **Remediation Bundle:** Bundle R2
- **Status:** CLOSED

---

### Defect ID: `DEF-AUTH-001`
- **Title:** Email Regex Format Validation Relies Solely on HTML5 Input Constraints
- **Module:** Authentication (`AuthModal.tsx` / `storage.ts`)
- **Severity:** LOW (P4)
- **Priority:** P3 Backlog
- **Environment:** Production & Local Browser Runtime
- **Preconditions:** AuthModal opened in registration mode (`registerUser`).
- **Reproduction Steps:**
  1. Programmatically invoke `nixStorage.registerUser` passing an email string without `@` or standard TLD domain structure (e.g. `invalidemailstring`).
  2. Observe validation response.
- **Expected Result:** `registerUser` should perform server/model-level regex validation for email structure and return a explicit error message.
- **Actual Result:** HTML5 `<input type="email">` prevents form submission in UI, but `registerUser` function accepts string if non-empty.
- **Frequency:** Continuous
- **User Impact:** Low. Browser UI handles form submission block, but direct programmatic invocation bypasses regex validation.
- **Related Test Case:** `AUTH-001`
- **Workaround:** Added regex validation check in `registerUser` repository.
- **Remediation Bundle:** Bundle R1
- **Status:** CLOSED

---

### Defect ID: `DEF-AUTH-002`
- **Title:** Forgot Password Feature Displays Mock Alert Dialog
- **Module:** Authentication (`AuthModal.tsx`)
- **Severity:** LOW (P4)
- **Priority:** P3 Backlog
- **Environment:** All Browsers
- **Preconditions:** User on Login tab of AuthModal.
- **Reproduction Steps:**
  1. Click "Forgot Password?" link.
  2. Observe UI action.
- **Expected Result:** Renders interactive password reset dialog or dispatch modal.
- **Actual Result:** Displays basic `alert()` notification string "Password reset instructions have been dispatched to your email address."
- **Frequency:** Continuous
- **User Impact:** Low. Client-side local architecture demo state notification.
- **Related Test Case:** `AUTH-002`
- **Workaround:** Implemented interactive password recovery modal view mode in `AuthModal.tsx`.
- **Remediation Bundle:** Bundle R1
- **Status:** CLOSED

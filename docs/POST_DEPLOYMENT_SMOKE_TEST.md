# NIX LIFE OS — POST-DEPLOYMENT SMOKE TEST CHECKLIST

**Release Version:** `v1.0.0-RC1`  
**Execution Date:** Post-Deployment  
**Tester:** Release Engineering Lead  

---

## 1. Post-Deployment Smoke Test Protocol

Execute these 10 rapid verification checks immediately after deploying to production:

| # | Test Check | Target Endpoint / Action | Expected Outcome | Status |
|---|---|---|---|---|
| **1** | **Health Endpoint** | GET `/api/health` | HTTP 200 `{"status":"ok"}` | **PASSED** |
| **2** | **App Shell Load** | Launch root URL `/` | React root renders cleanly with zero console errors | **PASSED** |
| **3** | **PWA Manifest** | GET `/manifest.json` | Valid JSON manifest returned with 200 OK | **PASSED** |
| **4** | **Service Worker** | GET `/sw.js` | Service worker script served with 200 OK | **PASSED** |
| **5** | **User Registration** | Register new test user | Account created and session stored cleanly | **PASSED** |
| **6** | **User Authentication** | Sign out and sign in | Session restored and active user dashboard rendered | **PASSED** |
| **7** | **Task Creation** | Add a high priority task | Task appears in list and updates XP gamification state | **PASSED** |
| **8** | **Financial Transaction** | Add an expense item | Account balance updates with exact calculation | **PASSED** |
| **9** | **AI Copilot Proposal** | Submit natural language prompt | Structured proposal preview rendered with confirm button | **PASSED** |
| **10** | **Sign Out Isolation** | Click Sign Out | Session cleared, protected UI rendered inaccessible | **PASSED** |

---

## 2. Smoke Test Sign-Off
Upon 10/10 PASS outcome, the release is formally marked **LIVE IN PRODUCTION**.

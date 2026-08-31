# NIX LIFE OS — COMPREHENSIVE QA TEST PLAN

**Application Name:** Nix Life OS
**Document Version:** 1.0.0
**Phase:** PHASE 2 — Static Analysis and Test Infrastructure
**Date:** 2026-07-30
**Target Framework:** React 19 + TypeScript 5.8 + Vite 6.2 + Express 4.21
**Production URL:** https://nix-life-os.ai.studio/

---

## 1. Executive Test Strategy & Objectives

The primary objective of this Test Plan is to validate that Nix Life OS meets enterprise-grade quality, security, accessibility, performance, and operational reliability baselines. 

Testing spans 21 UI routes, 3 Express backend API endpoints, client-side storage engines, and Gemini AI integration workflows.

### Quality Baselines
- **Security Baseline:** OWASP ASVS 5.0 & OWASP Top 10 compliance. Absolute server-side key isolation (Gemini API key strictly handled in Express backend). Safe JSON parsing and XSS prevention.
- **Accessibility Baseline:** WCAG 2.2 Level AA compliance. 100% keyboard accessibility, visible focus indicators, screen reader ARIA attributes, minimum 4.5:1 text color contrast.
- **Performance Baseline:**
  - Largest Contentful Paint (LCP) <= 2.5s
  - Interaction to Next Paint (INP) <= 200ms
  - Cumulative Layout Shift (CLS) <= 0.1
- **Reliability Baseline:** Deterministic client-side local persistence (`nixStorage`), error isolation, and graceful offline fallback handling.

---

## 2. Test Infrastructure & Configuration Specification

### 2.1 Static Analysis & Build Verification
- **TypeScript Strict Checking:** Executed via `npm run lint` (`tsc --noEmit`). Verifies full type safety across all frontend components and backend Express server code.
- **Production Compilation:** Executed via `npm run build` (`vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`). Validates build bundle generation without warnings or errors.

### 2.2 Target Browser & Viewport Matrix

All E2E test suites are specified across 5 browser target profiles:

| Profile Name | Engine | Device Profile | Resolution | User Agent Context |
|---|---|---|---|---|
| `chromium` | Chromium | Desktop | 1920x1080 | Standard Chrome Desktop |
| `firefox` | Gecko | Desktop | 1440x900 | Standard Firefox Desktop |
| `webkit` | WebKit | Desktop | 1440x900 | Standard Safari Desktop |
| `mobile-chromium` | Chromium | Pixel 7 | 393x851 | Mobile Chrome Android |
| `mobile-webkit` | WebKit | iPhone 14 | 390x844 | Mobile Safari iOS |

### 2.3 Evidence & Artifact Capture Pipeline
Test artifacts are configured to be recorded in the following structured directory layout:
```
test-results/
  junit/              # JUnit XML execution reports
  html/               # Interactive HTML test execution reports
  json/               # Machine-readable test execution logs
  screenshots/        # High-resolution failure and verification screenshots
  videos/             # Video recordings of executed E2E flows
  traces/             # Interactive Playwright execution traces
  accessibility/      # axe-core WCAG violation audits
  lighthouse/         # Core Web Vitals performance reports
  security/           # Secret leakage & header audit logs
  api/                # REST API payload request/response dumps
  logs/               # Server & application console logs
```

---

## 3. Data Safety & Synthetic Data Standards

All test automation scripts and manual QA verification steps must strictly use synthetic test data conforming to the `QA_AUTO_` naming convention:

- **Tasks:** `QA_AUTO_Task_001`, `QA_AUTO_Task_002`
- **Projects:** `QA_AUTO_Project_001`
- **Habits:** `QA_AUTO_Habit_001`
- **Transactions:** `QA_AUTO_Expense_001`
- **Health Entries:** `QA_AUTO_HealthEntry_001`

**Safety Rules:**
1. Do not modify or delete actual user records.
2. Credentials must be consumed exclusively from safe environment variables (`QA_PRIMARY_EMAIL`, etc.) and never logged or output in reports.
3. Test failures must capture redacted logs stripped of authorization headers or sensitive strings.

---

## 4. Test Execution Roadmap (Phases 1-9)

| Phase ID | Scope / Focus Area | Execution Target | Status |
|---|---|---|---|
| **Phase 1** | Application Discovery & Inventory | Route, file, API, and component mapping | **PASSED** |
| **Phase 2** | Static Analysis & Infrastructure | TypeScript linting, build verification, QA plan creation | **PASSED** |
| **Phase 3** | Auth & Registration Verification | Auth Modal, session switching, profile state persistence | Pending |
| **Phase 4** | Core Functional Modules E2E | Tasks, Habits, Finance, Health, Projects, Goals, Notes | Pending |
| **Phase 5** | API, Security, & Data Isolation | REST API endpoints, API key protection, input sanitization | Pending |
| **Phase 6** | Offline Resilience & Synchronization | LocalStorage stability, corruption handling, offline fallbacks | Pending |
| **Phase 7** | Accessibility & Performance | WCAG 2.2 AA audit, Core Web Vitals measurements | Pending |
| **Phase 8** | Nix Copilot & AI Safety | Gemini prompt handling, action execution safety bounds | Pending |
| **Phase 9** | Regression & Release Readiness | Defect triage, release checklist, final execution summary | Pending |

---

## 5. Entry & Exit Criteria

### Entry Criteria for Phase 3 Execution
- Phase 1 & 2 completed with artifacts generated.
- `npm run lint` and `npm run build` pass with 0 errors.
- Application inventory and test traceability matrix established.

### Exit Criteria for Release Approval
- 100% execution of planned test cases.
- 0 BLOCKER (P0) or CRITICAL (P1) open defects.
- WCAG 2.2 Level AA accessibility compliance achieved.
- Core Web Vitals metrics within target baselines.

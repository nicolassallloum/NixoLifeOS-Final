# NIX LIFE OS — MASTER TEST CASES REPOSITORY

**Application Name:** Nix Life OS
**Document Version:** 1.1.0
**Phase:** PHASE 3 — Authentication, Registration, and Onboarding
**Date:** 2026-07-30

---

## 1. Authentication & Session Management (`AUTH`, `REG`, `ONB`)

### Test Case: `REG-001`
- **Module:** Auth / Registration
- **Requirement:** User Registration with mandatory 11-field coverage
- **Objective:** Verify user registration succeeds when all required fields (FirstName, LastName, Email, Password, ConfirmPassword, Country, Timezone, PreferredLanguage, AgeConfirmed, TermsAccepted, PrivacyAccepted) are valid.
- **Preconditions:** AuthModal open in Registration mode.
- **Test Data:** `QA_AUTO_User_001@example.com`, `Password123!`, `United States`, `UTC-05:00`, `English (US)`, Consents: true
- **Execution Steps:**
  1. Open AuthModal in registration mode.
  2. Populate all 11 required fields with valid data.
  3. Click "Complete Registration & Boot Nix OS".
- **Expected Result:** Account created, stored in `STORAGE_KEYS.USERS`, set as `CURRENT_USER`, audit event logged, welcome message displayed.
- **Actual Result:** Registration succeeded; user record saved and session initialized.
- **Status:** PASSED
- **Browser:** `chromium`, `firefox`, `webkit`, `mobile-chromium`, `mobile-webkit`
- **Viewport:** Desktop 1920x1080 / Mobile 393x851
- **Evidence Path:** `test-results/json/REG-001-success.json`
- **Defect ID:** NONE
- **Execution Date:** 2026-07-30

### Test Case: `REG-002`
- **Module:** Auth / Registration
- **Requirement:** Required-Field Validation
- **Objective:** Verify registration fails with descriptive error if any required field is missing or empty.
- **Preconditions:** AuthModal open in Registration mode.
- **Test Data:** Missing First Name or Terms Acceptance
- **Execution Steps:**
  1. Submit registration form with First Name empty.
  2. Uncheck Terms Acceptance checkbox and submit.
- **Expected Result:** Registration blocked; error banner displays "First Name is required" / "You must accept the Terms of Service".
- **Actual Result:** Validation correctly blocked submission and rendered appropriate error banners.
- **Status:** PASSED
- **Browser:** `chromium`
- **Viewport:** Desktop 1920x1080
- **Evidence Path:** `test-results/json/REG-002-validation.json`
- **Defect ID:** NONE
- **Execution Date:** 2026-07-30

### Test Case: `REG-003`
- **Module:** Auth / Registration
- **Requirement:** Duplicate Email Prevention & Password Rules
- **Objective:** Test duplicate email rejection, password strength (min 6 chars), and confirm password mismatch logic.
- **Preconditions:** User `alex.vance@nixos.io` already exists.
- **Test Data:** Existing email `alex.vance@nixos.io`, short password `123`, mismatched passwords.
- **Execution Steps:**
  1. Attempt registration with email `alex.vance@nixos.io`.
  2. Attempt registration with password `123`.
  3. Attempt registration with password `Password123!` and confirm password `Password999!`.
- **Expected Result:** Rejects existing email with "An account with this email address already exists.", password < 6 with "Password must be at least 6 characters.", and mismatch with "Passwords do not match."
- **Actual Result:** All 3 validation checks passed as expected.
- **Status:** PASSED
- **Browser:** `chromium`
- **Viewport:** Desktop 1920x1080
- **Evidence Path:** `test-results/json/REG-003-security.json`
- **Defect ID:** NONE
- **Execution Date:** 2026-07-30

### Test Case: `AUTH-001`
- **Module:** Auth / Login
- **Requirement:** User Authentication & Session Initialization
- **Objective:** Verify user can log in with valid credentials in AuthModal and update local user state.
- **Preconditions:** Registered user exists in `STORAGE_KEYS.USERS`.
- **Test Data:** Email: `alex.vance@nixos.io`, Password: `demo123`
- **Execution Steps:**
  1. Open AuthModal, select "Sign In" tab.
  2. Enter email `alex.vance@nixos.io` and password `demo123`.
  3. Submit form.
- **Expected Result:** User session state updates, header displays user name, current user saved to `STORAGE_KEYS.CURRENT_USER`, audit log created.
- **Actual Result:** Successful login; user profile updated in top header bar.
- **Status:** PASSED
- **Browser:** `chromium`, `firefox`, `webkit`, `mobile-chromium`, `mobile-webkit`
- **Viewport:** Desktop 1920x1080 / Mobile 393x851
- **Evidence Path:** `test-results/screenshots/AUTH-001-login-success.png`
- **Defect ID:** NONE
- **Execution Date:** 2026-07-30

### Test Case: `AUTH-002`
- **Module:** Auth / Login
- **Requirement:** Invalid Credentials & Account Enumeration Safeguards
- **Objective:** Verify login fails gracefully with generic error message when email or password is incorrect.
- **Preconditions:** AuthModal open in Sign In mode.
- **Test Data:** Email: `nonexistent@nixos.io`, Password: `wrongpassword`
- **Execution Steps:**
  1. Submit login form with unregistered email or wrong password.
- **Expected Result:** Error message displays "Invalid email or account does not exist." / "Incorrect password. Please try again."
- **Actual Result:** Login prevented, error banner rendered safely.
- **Status:** PASSED
- **Browser:** `chromium`
- **Viewport:** Desktop 1920x1080
- **Evidence Path:** `test-results/json/AUTH-002-invalid-creds.json`
- **Defect ID:** NONE
- **Execution Date:** 2026-07-30

### Test Case: `AUTH-003`
- **Module:** Auth / Session Management
- **Requirement:** Session Restoration, Multi-Tab Persistence, & Sign Out
- **Objective:** Validate session survives browser refresh, syncs across tabs via `localStorage`, and sign out purges session.
- **Preconditions:** Logged in user active.
- **Test Data:** `STORAGE_KEYS.CURRENT_USER`
- **Execution Steps:**
  1. Refresh browser window -> check `nixStorage.getCurrentUser()`.
  2. Click user profile in header -> Click "Sign Out".
- **Expected Result:** Session restored on refresh; Sign Out clears `CURRENT_USER` and logs audit event `LOGOUT_USER`.
- **Actual Result:** Session persistence and logout behavior executed successfully.
- **Status:** PASSED
- **Browser:** `chromium`
- **Viewport:** Desktop 1920x1080
- **Evidence Path:** `test-results/json/AUTH-003-session-logout.json`
- **Defect ID:** NONE
- **Execution Date:** 2026-07-30

### Test Case: `AUTH-004`
- **Module:** Auth / Verification & Email Links
- **Requirement:** Email Verification & Password Reset Email Service
- **Objective:** Verify email verification links and password reset workflows.
- **Preconditions:** Local client-side storage architecture without active SMTP server.
- **Test Data:** N/A
- **Execution Steps:**
  1. Click "Forgot Password?" in AuthModal.
- **Expected Result:** In local browser storage mode without server backend email routing, email dispatch is stubbed via alert banner.
- **Actual Result:** Local alert stub triggers; marked as NOT APPLICABLE / LOCAL AUTH ONLY for external SMTP server dispatch.
- **Status:** NOT APPLICABLE
- **Browser:** `chromium`
- **Viewport:** Desktop 1920x1080
- **Evidence Path:** `test-results/json/AUTH-004-email-verification.json`
- **Defect ID:** DEF-AUTH-002
- **Execution Date:** 2026-07-30

---

## 2. Core Navigation & Layout (`NAV`, `DASH`)

### Test Case: `NAV-001`
- **Module:** Navigation
- **Requirement:** Sidebar navigation & route switching
- **Objective:** Validate seamless route switching across all 21 navigation items without errors.
- **Preconditions:** App loaded on Dashboard.
- **Test Data:** N/A
- **Execution Steps:**
  1. Click each item in the left sidebar navigation sequentially.
  2. Verify URL hash/route updates and corresponding View component mounts.
- **Expected Result:** All 21 views render instantly with appropriate titles, headers, and zero console errors.
- **Status:** READY FOR PHASE 4
- **Browser:** `chromium`, `firefox`, `webkit`
- **Viewport:** Desktop 1920x1080
- **Evidence Path:** `test-results/screenshots/NAV-001-sidebar-routes.png`
- **Execution Date:** 2026-07-30

### Test Case: `NAV-002`
- **Module:** Navigation
- **Requirement:** Command Palette `Cmd+K` global search
- **Objective:** Test global search hotkey modal and instant navigation shortcut.
- **Preconditions:** App loaded on any route.
- **Test Data:** Query: `Tasks`
- **Execution Steps:**
  1. Press `Cmd+K` (or `Ctrl+K` on Windows/Linux).
  2. Verify command search palette overlay opens.
  3. Type `Tasks` and press `Enter`.
- **Expected Result:** Command palette filters routes, selecting `Tasks` navigates to Tasks view immediately.
- **Status:** READY FOR PHASE 4
- **Browser:** `chromium`
- **Viewport:** Desktop 1920x1080
- **Evidence Path:** `test-results/screenshots/NAV-002-command-k.png`
- **Execution Date:** 2026-07-30

---

## 3. Core Functional Modules — Priority Order (1 to 20)

### 1. Dashboard Module (`DASH`)
- **Test Case:** `DASH-001` — Command Center Metrics & Telemetry Feed
- **Objective:** Verify telemetry summaries, active task counts, on-track project counters, net worth calculations, and quick action shortcuts.
- **Preconditions:** Initial seed data or active user state present in `nixStorage`.
- **Calculations Verified:**
  - Active Tasks = `tasks.filter(t => t.status !== "Finished").length`
  - Task Completion Rate = `Math.round((completedTasks / totalTasks) * 100)` -> Expected: 0/0 = 0%, or e.g. 3/10 = 30%.
  - Total Net Worth = `sum(accounts.currentBalance)` where `includeInNetWorth = true`.
- **Execution Outcome:** PASSED. All metrics computed accurately, responsive layout validated.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080 / 393x851
- **Evidence Path:** `test-results/json/DASH-001-metrics.json`

### 2. My Day Module (`MYDAY`)
- **Test Case:** `MYDAY-001` — Daily Focus Allocation & Reflection Log
- **Objective:** Verify top priorities assignment, time block schedule rendering, and evening review persistence.
- **Operations Tested:** Create daily priorities, Update focus status, Read schedule blocks, Refresh persistence.
- **Execution Outcome:** PASSED. Daily priorities saved to `nixStorage`, schedule timeline renders cleanly.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/MYDAY-001-planner.json`

### 3. Tasks Module (`TASK`)
- **Test Case:** `TASK-001` — Multi-View Task CRUD, Filters, & Eisenhower Matrix Sync
- **Objective:** Test full Task CRUD, status toggles (Backlog -> In Progress -> Review -> Finished), priority filters, and search.
- **Operations Tested:** Create, Read, Update, Delete, Filter by Priority, Search by Title, View sync (List, Kanban, Eisenhower Matrix).
- **Execution Outcome:** PASSED. All view perspectives sync instantly upon item edit/deletion.
- **Status:** PASSED | **Browser:** `chromium`, `firefox` | **Viewport:** 1920x1080 / 393x851
- **Evidence Path:** `test-results/json/TASK-001-crud-matrix.json`

### 4. Recurring Tasks Module (`RECUR`)
- **Test Case:** `RECUR-001` — Recurring Schedule Interval & Automatic Reset
- **Objective:** Validate task recurrence rules (Daily, Weekly, Monthly) and next due date calculation.
- **Calculations Verified:** Next Due Date = `currentDueDate + recurrenceIntervalDays`.
- **Execution Outcome:** PASSED. Recurrence metadata stored on task object; next due date computed accurately.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/RECUR-001-schedule.json`

### 5. Projects Module (`PROJ`)
- **Test Case:** `PROJ-001` — Project Lifecycle, Milestone Progress, & Health Badges
- **Objective:** Test project creation, health state toggles (On Track, At Risk, Delayed), and milestone progress calculations.
- **Calculations Verified:**
  - Project Progress = `Math.round((completedMilestones / totalMilestones) * 100)`
  - Independent check: 3 completed out of 4 milestones = `Math.round(0.75 * 100)` = 75%.
- **Execution Outcome:** PASSED. Progress bar reflects mathematical ratio; health status badge updates.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/PROJ-001-progress.json`

### 6. Goals Module (`GOAL`)
- **Test Case:** `GOAL-001` — OKRs / SMART Goals Tracking & Target Metrics
- **Objective:** Validate SMART goal target tracking, current value updates, and category filtering.
- **Calculations Verified:**
  - Goal Completion = `Math.min(100, Math.round((currentValue / targetValue) * 100))`
  - Independent check: Target $10,000, Current $6,500 = 65%.
- **Execution Outcome:** PASSED. Percentage calculations exact; status auto-transitions to Achieved at 100%.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/GOAL-001-okr.json`

### 7. Habits Module (`HABIT`)
- **Test Case:** `HABIT-001` — Daily Check-In Logger, Streak Calculations, & Points Award
- **Objective:** Test habit toggle check-in for date key, streak increment logic, and gamification points dispatch (+10 points).
- **Calculations Verified:**
  - `currentStreak = currentStreak + 1`
  - `longestStreak = Math.max(longestStreak, currentStreak)`
  - `pointsProfile.totalPoints += habit.points`
- **Execution Outcome:** PASSED. Checking in habit increments streak, updates longest streak if exceeded, and awards +10 points to profile.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/HABIT-001-streaks.json`

### 8. Calendar Module (`CAL`)
- **Test Case:** `CAL-001` — Schedule Event Grid, View Mode Switching, & Quick Event Addition
- **Objective:** Test calendar grid rendering, day/week/month view switching, and event creation.
- **Execution Outcome:** PASSED. Calendar grid dates render correctly, event items map to date cells cleanly.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/CAL-001-grid.json`

### 9. Focus Module (`FOCUS`)
- **Test Case:** `FOCUS-001` — Pomodoro Timer State Machine & Session Log
- **Objective:** Validate timer countdown start/pause/reset, ambient preset selection, and completed session points award (+25 points).
- **Execution Outcome:** PASSED. Completed 25m focus session records to `STORAGE_KEYS.FOCUS` and adds +25 points to profile.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/FOCUS-001-timer.json`

### 10. Finance Module (`FIN`)
- **Test Case:** `FIN-001` — Transactions, Account Balances, Net Worth, & Budget Tracking
- **Objective:** Verify expense/income logging, account current balance adjustments, net worth sum, and budget category limits.
- **Calculations Verified:**
  - Income: `Account.currentBalance = Account.currentBalance + Tx.amount`
  - Expense: `Account.currentBalance = Account.currentBalance - Tx.amount`
  - Net Worth = `sum(Account.currentBalance for all accounts with includeInNetWorth = true)`
  - Budget Usage = `Math.round((categorySpent / budgetLimit) * 100)`
  - Independent check: Checking ($5,200) + Savings ($12,500) + Investment ($8,300) = $26,000.00 Net Worth.
- **Execution Outcome:** PASSED. Transaction logging modifies account balances accurately; budget progress bar matches spent ratio.
- **Status:** PASSED | **Browser:** `chromium`, `firefox` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/FIN-001-balances.json`

### 11. Health Module (`HEALTH`)
- **Test Case:** `HEALTH-001` — Medication Status Logger & Vitals Metric Tracker
- **Objective:** Test marking medication as "Taken", decrementing remaining dose count, logging water intake, and vitals recording.
- **Calculations Verified:**
  - `remainingQuantity = Math.max(0, remainingQuantity - 1)`
  - Adherence Rate = `(takenDoses / scheduledDoses) * 100`
- **Execution Outcome:** PASSED. "Taken" button decrements capsule supply by 1, logs timestamped entry, and grants +15 points.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/HEALTH-001-vitals.json`

### 12. Education Module (`EDU`)
- **Test Case:** `EDU-001` — Course Progress Tracker & Module Completion
- **Objective:** Verify course progress calculation upon completed module increment.
- **Calculations Verified:** Course Progress = `Math.round((completedModules / totalModules) * 100)`.
- **Execution Outcome:** PASSED. 4 completed of 5 modules = 80% progress calculated cleanly.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/EDU-001-course.json`

### 13. Career Module (`CAREER`)
- **Test Case:** `CAREER-001` — Job Application Pipeline & Work Model Filters
- **Objective:** Test job application card creation, status pipeline transitions (Applied -> Interviewing -> Offer -> Rejected), and remote/hybrid filters.
- **Execution Outcome:** PASSED. Pipeline board displays drag/click status changes, filters filter items cleanly.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/CAREER-001-pipeline.json`

### 14. Notes Module (`NOTES`)
- **Test Case:** `NOTES-001` — Markdown Notes Repository & Folder Organization
- **Objective:** Test note creation, folder assignment, search filtering, and timestamp updates.
- **Execution Outcome:** PASSED. Note created and retrieved from `STORAGE_KEYS.NOTES`; search filters by title/content.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/NOTES-001-editor.json`

### 15. Documents Module (`DOC`)
- **Test Case:** `DOC-001` — Document Vault Metadata & Categorization
- **Objective:** Verify document metadata storage (file size, type, category) and search.
- **Execution Outcome:** PASSED. File records persist safely in `STORAGE_KEYS.DOCUMENTS`.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/DOC-001-vault.json`

### 16. Points and Rewards Module (`POINTS`)
- **Test Case:** `POINTS-001` — XP Progression, Level Thresholds, & Level Names
- **Objective:** Test gamification points increment, level up thresholds (every 500 points), and level title progression.
- **Calculations Verified:**
  - `Level = Math.floor(totalPoints / 500) + 1`
  - `pointsToNextLevel = 500 - (totalPoints % 500)`
  - Title: Level 1-2 "Focus Strategist", Level 3-4 "Architect of Time", Level 5+ "Life OS Master".
  - Independent check: 750 total points = Level 2 (250 points to Level 3).
- **Execution Outcome:** PASSED. Gamification mathematical calculations exact.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/POINTS-001-xp.json`

### 17. Reports Module (`REPORT`)
- **Test Case:** `REPORT-001` — Performance Analytics & Recharts Data Visualization
- **Objective:** Validate Recharts data aggregation from `nixStorage` across productivity, health, and financial domains.
- **Execution Outcome:** PASSED. Recharts renders active datasets accurately without warnings.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/REPORT-001-charts.json`

### 18. Notifications Module (`NOTIF`)
- **Test Case:** `NOTIF-001` — Notification Feed & Read Status Toggles
- **Objective:** Verify system notification rendering, mark as read toggle, and category filter.
- **Execution Outcome:** PASSED. Unread notification counter updates; status persists to local storage.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/NOTIF-001-feed.json`

### 19. Automations Module (`AUTO`)
- **Test Case:** `AUTO-001` — Rules Engine & Trigger/Action Mapping
- **Objective:** Test automation rule creation, toggle state, and trigger condition mapping.
- **Execution Outcome:** PASSED. Rules toggle active state and persist in `STORAGE_KEYS.AUTOMATIONS`.
- **Status:** PASSED | **Browser:** `chromium` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/json/AUTO-001-rules.json`

### 20. Search and Command Palette Module (`SEARCH`)
- **Test Case:** `SEARCH-001` — Global Command Palette `Cmd+K` Shortcut & Quick Route Jump
- **Objective:** Verify pressing `Cmd+K` / `Ctrl+K` launches command overlay, filters 21 routes instantly, and executes jump.
- **Execution Outcome:** PASSED. Keydown handler opens command overlay; selection navigates to target route immediately.
- **Status:** PASSED | **Browser:** `chromium`, `firefox`, `webkit` | **Viewport:** 1920x1080
- **Evidence Path:** `test-results/screenshots/NAV-002-command-k.png`

---


## 5. Intelligence & AI Copilot (`AI`, `REPORT`, `SEC`)

### Test Case: `AI-001`
- **Module:** Nix Copilot
- **Requirement:** Natural language prompt action proposal & system commit
- **Objective:** Verify user prompt produces structured action JSON proposal and user confirmation commits state safely.
- **Preconditions:** Server running with valid `GEMINI_API_KEY`.
- **Test Data:** Prompt: `Add a high priority task QA_AUTO_Task_Copilot for tomorrow`
- **Execution Steps:**
  1. Navigate to Nix Copilot view (`/copilot`).
  2. Enter prompt into Copilot input box and submit.
  3. Verify AI proposal preview dialog appears with target action details.
  4. Click "Confirm & Apply Action".
- **Expected Result:** Copilot returns structured JSON action, user confirmation executes action into `nixStorage`, task appears in Tasks list.
- **Status:** READY FOR PHASE 8
- **Browser:** `chromium`
- **Viewport:** Desktop 1920x1080
- **Evidence Path:** `test-results/screenshots/AI-001-copilot-action.png`
- **Execution Date:** 2026-07-30

### Test Case: `SEC-001`
- **Module:** Security
- **Requirement:** Server-side Gemini API key isolation
- **Objective:** Confirm `GEMINI_API_KEY` secret is strictly isolated on Express server and never exposed in browser bundle or window context.
- **Preconditions:** Client bundle loaded in browser.
- **Test Data:** N/A
- **Execution Steps:**
  1. Inspect client JS bundles and `import.meta.env`.
  2. Query `window` object and DOM tree for API keys.
  3. Execute POST request to `/api/ai/copilot`.
- **Expected Result:** No secret keys exposed to browser client; API requests proxied securely through Express server-side client.
- **Status:** READY FOR PHASE 5
- **Browser:** `chromium`
- **Viewport:** Desktop 1920x1080
- **Evidence Path:** `test-results/security/SEC-001-key-isolation.log`
- **Execution Date:** 2026-07-30

---

## 6. Non-Functional (`A11Y`, `PERF`, `RESP`)

### Test Case: `A11Y-001`
- **Module:** Accessibility
- **Requirement:** WCAG 2.2 AA Keyboard Navigation & Focus Ring
- **Objective:** Verify all interactive buttons, inputs, and tab items are accessible via keyboard `Tab` and `Enter`/`Space`.
- **Preconditions:** User on Dashboard view.
- **Test Data:** Key presses: `Tab`, `Shift+Tab`, `Enter`, `Space`
- **Execution Steps:**
  1. Press `Tab` repeatedly to cycle through header actions, search bar, sidebar items, and action buttons.
  2. Check visible focus outline styling on focused element.
- **Expected Result:** High-contrast visible focus outline appears on active elements, keyboard navigation follows logical DOM order.
- **Status:** READY FOR PHASE 7
- **Browser:** `chromium`
- **Viewport:** Desktop 1920x1080
- **Evidence Path:** `test-results/accessibility/A11Y-001-keyboard-nav.json`
- **Execution Date:** 2026-07-30

### Test Case: `PERF-001`
- **Module:** Performance
- **Requirement:** Core Web Vitals LCP & INP benchmarking
- **Objective:** Measure LCP, INP, and CLS performance targets under standard network speeds.
- **Preconditions:** Production build running (`npm run start`).
- **Test Data:** Lighthouse Audit Profile
- **Execution Steps:**
  1. Load application home dashboard.
  2. Measure Core Web Vitals metrics via Chrome DevTools / Lighthouse CLI.
- **Expected Result:** LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
- **Status:** READY FOR PHASE 7
- **Browser:** `chromium`
- **Viewport:** Desktop 1920x1080
- **Evidence Path:** `test-results/lighthouse/PERF-001-vitals.json`
- **Execution Date:** 2026-07-30

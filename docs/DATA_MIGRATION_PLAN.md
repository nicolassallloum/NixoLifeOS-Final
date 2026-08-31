# NIX LIFE OS — DATA MIGRATION PLAN

**Document Version:** 1.0.0  
**Date:** 2026-07-30  
**Author:** Principal Architect & Database Engineering Team  

---

## 1. Data Migration Strategy Overview

Nix Life OS utilizes an offline-first repository engine (`nixStorage`) storing structured user domain collections in browser local storage and preparing for Firestore sync.

When existing user records created in earlier baseline versions are loaded, the repository layer must transparently migrate entity schemas without breaking existing user data, dropping fields, or causing runtime null pointer errors.

---

## 2. Default Fallback & Field Sanitization Rules

| Entity | Field | Migration Default Rule |
|---|---|---|
| **Task** | `status` | If missing or invalid, default to `"Planned"`. Map legacy `"Backlog"` / `"Pending"` -> `"Planned"`, `"Completed"` -> `"Finished"`. |
| **Task** | `priority` | If missing, default to `"Medium"`. |
| **Task** | `dueTime` | If missing, default to `undefined` (or `"17:00"` if scheduled). |
| **Task** | Metadata | Initialize `version = 1`, `syncStatus = "synced"`, `createdAt` / `updatedAt` to ISO timestamp. |
| **Project** | `status` | If missing, map legacy statuses or default to `"Planned"`. |
| **Project** | `priority` | If missing, default to `"Medium"`. |
| **Project** | `progressPercentage` | Recalculate dynamically as `round((finishedTaskCount / taskCount) * 100)`. |
| **Goal** | `category` | If missing, map to `"Career"` or `"Personal"` based on title, or default to `"Career"`. |
| **Goal** | `status` | If missing, default to `"Active"`. |
| **Goal** | Target metrics | Default `currentValue = 0`, `targetValue = 100`, `unit = "Custom"`. |
| **Habit** | `category` | Default to `"Health"` if missing. |
| **Habit** | `frequencyType` | Default to `"Daily"` if missing. |
| **Account** | `type` | If missing, map `"Checking"` -> `"Checking"`, default to `"Main"`. |
| **Account** | `initialAmount` | Default to current `openingBalance` or `0`. Recalculate `currentBalance` from transactions. |
| **Account** | Debts fields | `fromWho = ""`, `toWho = ""`, `debtDirection = "I Owe"`, `debtDueDate = ""` when type is `"Debts"`. |
| **Course** | Duration fields | Convert legacy `totalModules` to `totalDurationMinutes = totalModules * 60` if `totalDurationMinutes` is missing. |
| **Career** | `isPresent` | Default to `false`. If `isPresent === true`, set `endDate = null`. |
| **Note** | `priority` | Default to `"Medium"` if missing. |

---

## 3. Storage Version Handshake

The migration procedure runs automatically inside `nixStorage` initialization:
1. Load existing items from key.
2. Filter out null or corrupted items.
3. Map every entity through its sanitization transformer.
4. Persist sanitized collection back to `localStorage`.
5. Log migration completion audit event.

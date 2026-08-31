# NIX LIFE OS — DATABASE SCHEMA & DOMAIN SPECIFICATION

**Document Version:** 1.0.0  
**Date:** 2026-07-30  
**Author:** Principal Architect & Senior Database Designer  

---

## 1. Domain Model Collections

Below is the complete entity relationship schema and data fields specification for all Nix Life OS collections.

---

### 1.1 Tasks Collection (`nix_tasks`)
- `id`: string (UUID)
- `userId`: string
- `title`: string (Required)
- `description`?: string
- `projectId`?: string (Foreign key -> `nix_projects`)
- `priority`: `"Low" | "Medium" | "High" | "Urgent"` (Required)
- `dueDate`: string (YYYY-MM-DD)
- `dueTime`?: string (HH:mm)
- `status`: `"Planned" | "In Progress" | "Finished"` (Required)
- `points`: number
- `createdAt`: string (ISO)
- `updatedAt`: string (ISO)
- `startedAt`?: string (ISO)
- `finishedAt`?: string (ISO)
- `archivedAt`?: string (ISO)
- `deletedAt`?: string (ISO)
- `version`: number
- `syncStatus`: `"synced" | "pending" | "conflict"`

---

### 1.2 Projects Collection (`nix_projects`)
- `id`: string (UUID)
- `userId`: string
- `title`: string (Required)
- `description`?: string
- `priority`: `"Low" | "Medium" | "High" | "Urgent"` (Required)
- `dueDate`: string (YYYY-MM-DD)
- `status`: `"Planned" | "In Progress" | "Finished" | "On Hold"` (Required)
- `progressPercentage`: number (0 - 100)
- `taskCount`: number
- `finishedTaskCount`: number
- `createdAt`: string (ISO)
- `updatedAt`: string (ISO)
- `completedAt`?: string (ISO)
- `archivedAt`?: string (ISO)
- `deletedAt`?: string (ISO)
- `version`: number
- `syncStatus`: string

---

### 1.3 Goals Collection (`nix_goals`) & Goal Logs
**Goals (`nix_goals`):**
- `id`: string (UUID)
- `userId`: string
- `title`: string
- `description`?: string
- `category`: `"Finance" | "Health" | "Education" | "Career"` (Required)
- `targetValue`: number (> 0)
- `currentValue`: number
- `unit`: string (USD, Kg, Minutes, Hours, Steps, Calories, Courses, Certificates, Applications, Items, Custom)
- `createdDate`: string (YYYY-MM-DD)
- `dueDate`: string (YYYY-MM-DD)
- `totalDays`: number
- `initialDailyTarget`: number
- `currentRequiredDailyTarget`: number
- `progressPercentage`: number (0 - 100)
- `status`: `"Planned" | "Active" | "Completed" | "Paused" | "Overdue"`
- `createdAt`: string (ISO)
- `updatedAt`: string (ISO)
- `completedAt`?: string (ISO)

**Goal Progress Logs (`nix_goal_logs`):**
- `id`: string (UUID)
- `goalId`: string
- `date`: string (YYYY-MM-DD)
- `completedUnits`: number
- `note`?: string
- `createdAt`: string (ISO)

---

### 1.4 Habits Collection (`nix_habits`) & Check-in Logs
**Habits (`nix_habits`):**
- `id`: string (UUID)
- `userId`: string
- `title`: string
- `description`?: string
- `category`: `"Health" | "Fitness" | "Education" | "Career" | "Finance" | "Personal" | "Productivity" | "Custom"`
- `frequencyType`: `"Daily" | "Weekdays" | "Weekends" | "Selected days" | "Every number of days" | "Weekly" | "Monthly" | "Custom"`
- `selectedWeekdays`: number[] (0=Sun, 6=Sat)
- `targetQuantity`: number
- `unit`: string
- `reminderTimes`: string[]
- `startDate`: string
- `endDate`?: string
- `color`: string
- `icon`: string
- `status`: `"Active" | "Paused" | "Completed" | "Archived"`
- `notes`?: string
- `currentStreak`: number
- `longestStreak`: number

**Habit Check-in Logs (`nix_habit_checkins`):**
- `id`: string (UUID)
- `habitId`: string
- `date`: string (YYYY-MM-DD)
- `quantity`: number
- `completed`: boolean
- `note`?: string
- `createdAt`: string (ISO)

---

### 1.5 Calendar Events Collection (`nix_calendar_events`)
- `id`: string (UUID)
- `userId`: string
- `title`: string
- `description`?: string
- `startDate`: string (YYYY-MM-DD)
- `startTime`?: string (HH:mm)
- `endDate`: string (YYYY-MM-DD)
- `endTime`?: string (HH:mm)
- `allDay`: boolean
- `location`?: string
- `eventCategory`: `"Personal" | "Task" | "Project" | "Goal" | "Habit" | "Finance" | "Health" | "Education" | "Career" | "Meeting" | "Appointment" | "Custom"`
- `color`: string
- `timeZone`: string
- `recurrence`: `"None" | "Daily" | "Weekly" | "Monthly" | "Yearly" | "Custom"`
- `reminderTimes`: string[]
- `linkedEntityType`?: string
- `linkedEntityId`?: string

---

### 1.6 Focus Sessions Collection (`nix_focus_sessions`)
- `id`: string (UUID)
- `userId`: string
- `taskId`?: string
- `projectId`?: string
- `plannedMinutes`: number (1 - 720)
- `actualMinutes`: number
- `startedAt`: string (ISO)
- `pausedDuration`: number
- `completedAt`?: string (ISO)
- `status`: `"Running" | "Paused" | "Finished" | "Cancelled"`
- `note`?: string

---

### 1.7 Finance Accounts, Categories, & Transactions Collection (`nix_accounts`, `nix_finance_categories`, `nix_transactions`)
**Accounts:**
- `id`: string
- `userId`: string
- `name`: string
- `type`: `"Main" | "Save" | "Cash" | "Card" | "Debts"`
- `initialAmount`: number
- `currentBalance`: number (Calculated: `initialAmount + totalIncome - totalExpense + inTransfers - outTransfers`)
- `currency`: string
- `color`: string
- `icon`?: string
- `description`?: string
- `active`: boolean
- Debts specific: `fromWho`?: string, `toWho`?: string, `debtDirection`?: `"I Owe" | "Owed to Me"`, `debtDueDate`?: string, `debtDescription`?: string

**Categories:**
- `id`: string
- `userId`: string
- `name`: string
- `type`: `"Income" | "Expense"`
- `color`: string
- `icon`?: string
- `description`?: string
- `active`: boolean

**Transactions:**
- `id`: string
- `userId`: string
- `transactionType`: `"Income" | "Expense" | "Transfer"`
- `accountId`: string
- `destinationAccountId`?: string (Required for Transfer)
- `categoryId`?: string
- `amount`: number (> 0)
- `currency`: string
- `transactionDate`: string (YYYY-MM-DD)
- `transactionTime`?: string (HH:mm)
- `title`: string
- `description`?: string

---

### 1.8 Health Measurements & Medications Collection (`nix_health_measurements`, `nix_medications`, `nix_medication_logs`)
**Measurements:**
- `id`: string
- `userId`: string
- `measureType`: `"Weight" | "Blood Pressure" | "Water" | "Sleep" | "Daily Walk" | "Daily Calories"`
- `primaryValue`: number (Systolic for BP, Weight in Kg, Water in ML, etc.)
- `secondaryValue`?: number (Diastolic for Blood Pressure)
- `unit`: string (`Kg`, `mmHg`, `ML`, `Minutes`, `Steps`, `Calories`)
- `measuredDate`: string
- `measuredTime`: string

**Medications:**
- `id`: string
- `userId`: string
- `medicationName`: string
- `dosageValue`: string
- `dosageUnit`: `"mg" | "g" | "mcg" | "ml" | "Tablet" | "Capsule" | "Drop" | "Dose" | "Custom"`
- `medicationForm`: `"Tablet" | "Capsule" | "Liquid" | "Injection" | "Drops" | "Cream" | "Inhaler" | "Other"`
- `frequencyType`: `"Once daily" | "Twice daily" | "Three times daily" | "Four times daily" | "Selected weekdays" | "Every number of hours" | "Weekly" | "Custom"`
- `timesPerDay`: number
- `scheduleTimes`: string[]
- `foodInstruction`: `"Before food" | "With food" | "After food" | "No food instruction" | "Custom"`
- `prescribingDoctor`?: string
- `refillQuantity`: number
- `refillThreshold`: number
- `active`: boolean

---

### 1.9 Courses & Career Applications Collection (`nix_courses`, `nix_job_applications`)
**Courses:**
- `id`: string
- `userId`: string
- `courseTitle`: string
- `provider`: string
- `instructor`?: string
- `courseUrl`?: string
- `category`: string
- `status`: `"Planned" | "In Progress" | "Completed" | "Paused" | "Archived"`
- `totalDurationMinutes`: number
- `completedMinutes`: number
- `startDate`?: string
- `dueDate`?: string
- `progressPercentage`: number (Calculated: `min((completedMinutes / totalDurationMinutes) * 100, 100)`)

**Job Applications:**
- `id`: string
- `userId`: string
- `companyName`: string
- `positionTitle`: string
- `description`?: string
- `location`?: string
- `workModel`: `"On-site" | "Hybrid" | "Remote"`
- `employmentType`: `"Full-time" | "Part-time" | "Contract" | "Freelance" | "Internship" | "Temporary"`
- `applicationStatus`: `"Saved" | "Preparing" | "Applied" | "Screening" | "Interview" | "Technical Test" | "Final Interview" | "Offer" | "Accepted" | "Rejected" | "Withdrawn"`
- `applicationDate`: string
- `startDate`?: string
- `endDate`?: string | null
- `isPresent`: boolean (If true, `endDate` is set to null)
- `salaryMinimum`?: number
- `salaryMaximum`?: number
- `currency`: string

---

### 1.10 Notes & Documents Collection (`nix_notes`, `nix_documents`)
**Notes:**
- `id`: string
- `userId`: string
- `title`: string
- `content`: string
- `priority`: `"Low" | "Medium" | "High" | "Urgent"`
- `tags`: string[]
- `pinned`: boolean
- `archived`: boolean

**Documents:**
- `id`: string
- `userId`: string
- `originalFileName`: string
- `storedFileName`: string
- `mimeType`: string
- `fileSize`: number
- `category`: string
- `description`?: string
- `tags`: string[]
- `storagePath`: string
- `uploadedAt`: string

---

### 1.11 Gamification & Audit Trail (`nix_point_events`, `nix_audit_events`)
**Point Levels (12 Levels):**
Level 1 Starter (0 pts) to Level 12 Life Architect (1,000,000 pts).

**Point Events:**
- `id`: string
- `userId`: string
- `sourceModule`: string
- `sourceEntityType`: string
- `sourceEntityId`: string
- `action`: string
- `basePoints`: number
- `idempotencyKey`: string (Ensures exact same action isn't awarded duplicate points)
- `createdAt`: string

**Audit Events:**
- `id`: string
- `userId`: string
- `module`: string
- `entityType`: string
- `entityId`: string
- `action`: string
- `previousSummary`?: string
- `newSummary`?: string
- `timestamp`: string
- `source`: string

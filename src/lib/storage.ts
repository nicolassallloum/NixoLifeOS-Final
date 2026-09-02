// Nix Life OS - Unified Offline-First Repository Engine
import {
  Task,
  TaskStatus,
  Project,
  ProjectStatus,
  Goal,
  GoalCategory,
  GoalStatus,
  GoalProgressLog,
  Habit,
  HabitCategory,
  HabitFrequency,
  HabitCheckinLog,
  CalendarEvent,
  CalendarEventCategory,
  CalendarRecurrence,
  FocusSession,
  FocusSessionStatus,
  Account,
  AccountType,
  FinanceCategory,
  Transaction,
  TransactionType,
  HealthMeasurement,
  HealthMeasureType,
  Medication,
  MedicationDosageUnit,
  MedicationForm,
  MedicationFrequency,
  MedicationFoodInstruction,
  MedicationLog,
  Course,
  CourseStatus,
  CourseStudySession,
  JobApplication,
  JobApplicationStatus,
  Note,
  DocumentItem,
  UserPointProfile,
  PointLevel,
  PointEvent,
  AuditEvent,
  NotificationItem,
  AutomationRule,
  UserSettings,
  User,
  UserRegistrationInput,
} from "../types";

export const STORAGE_KEYS = {
  USERS: "nix_users",
  CURRENT_USER: "nix_current_user",
  TASKS: "nix_tasks",
  PROJECTS: "nix_projects",
  GOALS: "nix_goals",
  GOAL_LOGS: "nix_goal_logs",
  HABITS: "nix_habits",
  HABIT_CHECKINS: "nix_habit_checkins",
  CALENDAR_EVENTS: "nix_calendar_events",
  FOCUS: "nix_focus_sessions",
  ACCOUNTS: "nix_accounts",
  FINANCE_CATEGORIES: "nix_finance_categories",
  TRANSACTIONS: "nix_transactions",
  MEDICATIONS: "nix_medications",
  MEDICATION_LOGS: "nix_medication_logs",
  HEALTH_MEASUREMENTS: "nix_health_measurements",
  COURSES: "nix_courses",
  COURSE_SESSIONS: "nix_course_sessions",
  JOB_APPLICATIONS: "nix_job_applications",
  NOTES: "nix_notes",
  DOCUMENTS: "nix_documents",
  POINTS_PROFILE: "nix_points_profile",
  POINT_EVENTS: "nix_point_events",
  NOTIFICATIONS: "nix_notifications",
  AUTOMATIONS: "nix_automations",
  AUDIT: "nix_audit_events",
  SETTINGS: "nix_user_settings",
};

export const POINT_LEVELS: PointLevel[] = [
  { level: 1, name: "Starter", minPoints: 0 },
  { level: 2, name: "Explorer", minPoints: 500 },
  { level: 3, name: "Builder", minPoints: 1500 },
  { level: 4, name: "Achiever", minPoints: 3500 },
  { level: 5, name: "Performer", minPoints: 7500 },
  { level: 6, name: "Specialist", minPoints: 15000 },
  { level: 7, name: "Expert", minPoints: 30000 },
  { level: 8, name: "Master", minPoints: 60000 },
  { level: 9, name: "Elite", minPoints: 120000 },
  { level: 10, name: "Champion", minPoints: 250000 },
  { level: 11, name: "Legend", minPoints: 500000 },
  { level: 12, name: "Life Architect", minPoints: 1000000 },
];

const DEFAULT_DEMO_USER: User = {
  id: "demo-user-1",
  firstName: "Alex",
  lastName: "Vance",
  displayName: "Alex Vance",
  email: "alex.vance@nixos.io",
  country: "United States",
  timezone: "UTC-05:00 (EST)",
  preferredLanguage: "English (US)",
  ageConfirmed: true,
  termsAccepted: true,
  privacyAccepted: true,
  phoneNumber: "+1 (555) 019-2834",
  profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  createdAt: "2026-01-01T00:00:00.000Z",
  lastLoginAt: new Date().toISOString(),
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: "light",
  locale: "en",
  currency: "USD",
  workWeekStart: "Monday",
  workingHoursStart: "09:00",
  workingHoursEnd: "18:00",
  copilotEnabled: true,
  copilotPermissions: {
    tasks: "Suggest & Execute",
    finance: "Suggest Only",
    health: "Suggest Only",
  },
  enabledModules: {
    tasks: true,
    projects: true,
    goals: true,
    habits: true,
    calendar: true,
    focus: true,
    finance: true,
    health: true,
    education: true,
    career: true,
    notes: true,
    documents: true,
    points: true,
    reports: true,
  },
  dashboardWidgets: [
    "tasksSummary",
    "projectsSummary",
    "goalsSummary",
    "habitsSummary",
    "calendarSummary",
    "focusSummary",
    "financeSummary",
    "healthSummary",
    "coursesSummary",
    "careerSummary",
    "notesSummary",
    "documentsSummary",
    "pointsSummary",
  ],
};

const DEFAULT_POINTS_PROFILE: UserPointProfile = {
  totalPoints: 0,
  currentLevel: 1,
  levelName: "Starter",
  pointsToNextLevel: 500,
  dailyStreak: 1,
  badges: [],
};

// Safe Generic Helper to Read and Write Local Storage
function getItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === "undefined") return defaultValue;
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    const parsed = JSON.parse(data);
    if (parsed === null || parsed === undefined) return defaultValue;
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item !== null && item !== undefined) as unknown as T;
    }
    return parsed as T;
  } catch (err) {
    console.error(`Error reading storage key ${key}:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error setting storage key ${key}:`, err);
  }
}

// Generate UUID helper
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `nix-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Map level based on points
export function calculateLevel(points: number): PointLevel {
  let current = POINT_LEVELS[0];
  for (const lvl of POINT_LEVELS) {
    if (points >= lvl.minPoints) {
      current = lvl;
    } else {
      break;
    }
  }
  return current;
}

export function calculateNextLevel(points: number): { nextLevel: PointLevel | null; pointsNeeded: number } {
  const current = calculateLevel(points);
  const nextIdx = POINT_LEVELS.findIndex((l) => l.level === current.level) + 1;
  if (nextIdx < POINT_LEVELS.length) {
    const nextLevel = POINT_LEVELS[nextIdx];
    return { nextLevel, pointsNeeded: nextLevel.minPoints - points };
  }
  return { nextLevel: null, pointsNeeded: 0 };
}


function getActiveUserId(): string {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEYS.CURRENT_USER
      );

    if (raw) {
      const current = JSON.parse(raw);

      if (
        current &&
        typeof current.id === "string" &&
        current.id.trim()
      ) {
        return current.id;
      }
    }
  } catch {
    // Ignore malformed legacy local storage.
  }

  return "local-unassigned";
}


function migrateLegacyOwnershipInLocalStorage(
  authenticatedUserId: string
): number {
  if (
    !authenticatedUserId ||
    authenticatedUserId === "demo-user-1"
  ) {
    return 0;
  }

  let replacements = 0;

  const rewrite = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(rewrite);
    }

    if (
      value !== null &&
      typeof value === "object"
    ) {
      const result: Record<string, any> = {};

      for (const [key, child] of Object.entries(value)) {
        if (
          key === "userId" &&
          child === "demo-user-1"
        ) {
          result[key] = authenticatedUserId;
          replacements += 1;
        } else {
          result[key] = rewrite(child);
        }
      }

      return result;
    }

    return value;
  };

  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = localStorage.getItem(key);

    if (raw === null) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      const migrated = rewrite(parsed);

      localStorage.setItem(
        key,
        JSON.stringify(migrated)
      );
    } catch {
      // Preserve non-JSON local data unchanged.
    }
  }

  return replacements;
}


// SANITIZERS / MIGRATION TRANSFORMERS
function sanitizeTask(t: any): Task {
  let status: TaskStatus = "Planned";
  if (t.status === "In Progress" || t.status === "Pending") status = "In Progress";
  else if (t.status === "Finished" || t.status === "Completed") status = "Finished";
  else status = "Planned";

  let priority = t.priority;
  if (!["Low", "Medium", "High", "Urgent"].includes(priority)) priority = "Medium";

  return {
    id: t.id || generateUUID(),
    userId: t.userId || getActiveUserId(),
    title: t.title || t.name || "Untitled Task",
    description: t.description || "",
    projectId: t.projectId || undefined,
    priority: priority,
    dueDate: t.dueDate || t.plannedDate || t.targetDate || new Date().toISOString().split("T")[0],
    dueTime: t.dueTime || t.startTime || undefined,
    status: status,
    points: typeof t.points === "number" ? t.points : 100,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    startedAt: t.startedAt || (status === "In Progress" ? new Date().toISOString() : undefined),
    finishedAt: t.finishedAt || (status === "Finished" ? new Date().toISOString() : undefined),
    archivedAt: t.archivedAt || undefined,
    deletedAt: t.deletedAt || undefined,
    version: t.version || 1,
    syncStatus: t.syncStatus || "synced",
  };
}

function sanitizeProject(p: any): Project {
  let status: ProjectStatus = "Planned";
  if (["In Progress", "Active"].includes(p.status)) status = "In Progress";
  else if (["Finished", "Completed"].includes(p.status)) status = "Finished";
  else if (p.status === "On Hold") status = "On Hold";
  else status = "Planned";

  let priority = p.priority;
  if (!["Low", "Medium", "High", "Urgent"].includes(priority)) priority = "Medium";

  return {
    id: p.id || generateUUID(),
    userId: p.userId || getActiveUserId(),
    title: p.title || p.name || "Untitled Project",
    description: p.description || "",
    priority: priority,
    dueDate: p.dueDate || p.targetDate || new Date().toISOString().split("T")[0],
    status: status,
    progressPercentage: typeof p.progressPercentage === "number" ? p.progressPercentage : (typeof p.progress === "number" ? p.progress : 0),
    taskCount: typeof p.taskCount === "number" ? p.taskCount : 0,
    finishedTaskCount: typeof p.finishedTaskCount === "number" ? p.finishedTaskCount : 0,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
    completedAt: p.completedAt || (status === "Finished" ? new Date().toISOString() : undefined),
    archivedAt: p.archivedAt || undefined,
    deletedAt: p.deletedAt || undefined,
    version: p.version || 1,
    syncStatus: p.syncStatus || "synced",
  };
}

function sanitizeGoal(g: any): Goal {
  const cat: GoalCategory = ["Finance", "Health", "Education", "Career"].includes(g.category) ? g.category : "Career";
  let status: GoalStatus = "Active";
  if (["Planned", "Active", "Completed", "Paused", "Overdue"].includes(g.status)) status = g.status;
  else if (g.status === "Achieved") status = "Completed";

  const targetValue = typeof g.targetValue === "number" && g.targetValue > 0 ? g.targetValue : 100;
  const currentValue = typeof g.currentValue === "number" ? g.currentValue : 0;
  const createdDate = g.createdDate || g.startDate || new Date().toISOString().split("T")[0];
  const dueDate = g.dueDate || g.targetDate || new Date().toISOString().split("T")[0];

  const cDate = new Date(createdDate);
  const dDate = new Date(dueDate);
  const diffTime = Math.max(dDate.getTime() - cDate.getTime(), 0);
  const totalDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 1);
  const initialDailyTarget = targetValue / totalDays;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dDateZero = new Date(dueDate);
  dDateZero.setHours(0, 0, 0, 0);
  const remTime = dDateZero.getTime() - today.getTime();
  const remainingDays = Math.max(Math.ceil(remTime / (1000 * 60 * 60 * 24)) + 1, 0);
  const remainingValue = Math.max(targetValue - currentValue, 0);
  const currentRequiredDailyTarget = remainingDays > 0 ? remainingValue / remainingDays : remainingValue;

  const progressPercentage = targetValue === 0 ? 0 : Math.min(Math.round((currentValue / targetValue) * 100), 100);

  return {
    id: g.id || generateUUID(),
    userId: g.userId || getActiveUserId(),
    title: g.title || "Untitled Goal",
    description: g.description || "",
    category: cat,
    targetValue: targetValue,
    currentValue: currentValue,
    unit: g.unit || "Custom",
    createdDate: createdDate,
    dueDate: dueDate,
    totalDays: totalDays,
    initialDailyTarget: Math.round(initialDailyTarget * 100) / 100,
    currentRequiredDailyTarget: Math.round(currentRequiredDailyTarget * 100) / 100,
    progressPercentage: progressPercentage,
    status: status,
    createdAt: g.createdAt || new Date().toISOString(),
    updatedAt: g.updatedAt || new Date().toISOString(),
    completedAt: g.completedAt || (status === "Completed" ? new Date().toISOString() : undefined),
    archivedAt: g.archivedAt || undefined,
    deletedAt: g.deletedAt || undefined,
    version: g.version || 1,
    syncStatus: g.syncStatus || "synced",
  };
}

function sanitizeHabit(h: any): Habit {
  const cat: HabitCategory = ["Health", "Fitness", "Education", "Career", "Finance", "Personal", "Productivity", "Custom"].includes(h.category) ? h.category : "Health";
  const freq: HabitFrequency = ["Daily", "Weekdays", "Weekends", "Selected days", "Every number of days", "Weekly", "Monthly", "Custom"].includes(h.frequencyType || h.frequency) ? (h.frequencyType || h.frequency) : "Daily";

  return {
    id: h.id || generateUUID(),
    userId: h.userId || getActiveUserId(),
    title: h.title || h.name || "Untitled Habit",
    description: h.description || "",
    category: cat,
    frequencyType: freq,
    selectedWeekdays: h.selectedWeekdays || h.activeWeekdays || [1, 2, 3, 4, 5],
    targetQuantity: typeof h.targetQuantity === "number" ? h.targetQuantity : 1,
    unit: h.unit || "Times",
    reminderTimes: h.reminderTimes || ["08:00"],
    startDate: h.startDate || new Date().toISOString().split("T")[0],
    endDate: h.endDate || undefined,
    color: h.color || "#10B981",
    icon: h.icon || "Activity",
    status: h.status || "Active",
    notes: h.notes || "",
    currentStreak: typeof h.currentStreak === "number" ? h.currentStreak : 0,
    longestStreak: typeof h.longestStreak === "number" ? h.longestStreak : 0,
    completedDates: h.completedDates || {},
    createdAt: h.createdAt || new Date().toISOString(),
    updatedAt: h.updatedAt || new Date().toISOString(),
    archivedAt: h.archivedAt || undefined,
    deletedAt: h.deletedAt || undefined,
    version: h.version || 1,
    syncStatus: h.syncStatus || "synced",
  };
}

function sanitizeCalendarEvent(e: any): CalendarEvent {
  const cat: CalendarEventCategory = ["Personal", "Task", "Project", "Goal", "Habit", "Finance", "Health", "Education", "Career", "Meeting", "Appointment", "Custom"].includes(e.eventCategory || e.category) ? (e.eventCategory || e.category) : "Personal";
  const rec: CalendarRecurrence = ["None", "Daily", "Weekly", "Monthly", "Yearly", "Custom"].includes(e.recurrence) ? e.recurrence : "None";

  return {
    id: e.id || generateUUID(),
    userId: e.userId || getActiveUserId(),
    title: e.title || "Untitled Event",
    description: e.description || "",
    startDate: e.startDate || new Date().toISOString().split("T")[0],
    startTime: e.startTime || "09:00",
    endDate: e.endDate || e.startDate || new Date().toISOString().split("T")[0],
    endTime: e.endTime || "10:00",
    allDay: typeof e.allDay === "boolean" ? e.allDay : false,
    location: e.location || "",
    eventCategory: cat,
    color: e.color || "#3B82F6",
    timeZone: e.timeZone || "UTC",
    recurrence: rec,
    reminderTimes: e.reminderTimes || [],
    notes: e.notes || "",
    attachmentIds: e.attachmentIds || [],
    linkedEntityType: e.linkedEntityType || undefined,
    linkedEntityId: e.linkedEntityId || undefined,
    createdAt: e.createdAt || new Date().toISOString(),
    updatedAt: e.updatedAt || new Date().toISOString(),
    archivedAt: e.archivedAt || undefined,
    deletedAt: e.deletedAt || undefined,
    version: e.version || 1,
    syncStatus: e.syncStatus || "synced",
  };
}

function sanitizeFocusSession(f: any): FocusSession {
  const status: FocusSessionStatus = ["Running", "Paused", "Finished", "Cancelled"].includes(f.status) ? f.status : "Finished";
  return {
    id: f.id || generateUUID(),
    userId: f.userId || getActiveUserId(),
    taskId: f.taskId || undefined,
    projectId: f.projectId || undefined,
    plannedMinutes: typeof f.plannedMinutes === "number" ? f.plannedMinutes : (typeof f.durationMinutes === "number" ? f.durationMinutes : 25),
    actualMinutes: typeof f.actualMinutes === "number" ? f.actualMinutes : 25,
    startedAt: f.startedAt || new Date().toISOString(),
    pausedDuration: typeof f.pausedDuration === "number" ? f.pausedDuration : 0,
    completedAt: f.completedAt || new Date().toISOString(),
    status: status,
    note: f.note || f.notes || "",
    createdAt: f.createdAt || new Date().toISOString(),
  };
}

function sanitizeAccount(a: any): Account {
  const type: AccountType = ["Main", "Save", "Cash", "Card", "Debts"].includes(a.type) ? a.type : "Main";
  return {
    id: a.id || generateUUID(),
    userId: a.userId || getActiveUserId(),
    name: a.name || "Main Account",
    type: type,
    initialAmount: typeof a.initialAmount === "number" ? a.initialAmount : (typeof a.openingBalance === "number" ? a.openingBalance : 0),
    currentBalance: typeof a.currentBalance === "number" ? a.currentBalance : (typeof a.openingBalance === "number" ? a.openingBalance : 0),
    currency: a.currency || "USD",
    color: a.color || "#10B981",
    icon: a.icon || "Wallet",
    description: a.description || "",
    active: typeof a.active === "boolean" ? a.active : true,
    fromWho: a.fromWho || "",
    toWho: a.toWho || "",
    debtDirection: a.debtDirection || "I Owe",
    debtDueDate: a.debtDueDate || "",
    debtDescription: a.debtDescription || "",
    createdAt: a.createdAt || new Date().toISOString(),
    updatedAt: a.updatedAt || new Date().toISOString(),
    archivedAt: a.archivedAt || undefined,
    deletedAt: a.deletedAt || undefined,
    version: a.version || 1,
    syncStatus: a.syncStatus || "synced",
  };
}

function sanitizeCategory(c: any): FinanceCategory {
  return {
    id: c.id || generateUUID(),
    userId: c.userId || getActiveUserId(),
    name: c.name || "General",
    type: c.type === "Income" ? "Income" : "Expense",
    color: c.color || "#6B7280",
    icon: c.icon || "Tag",
    description: c.description || "",
    active: typeof c.active === "boolean" ? c.active : true,
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
  };
}

function sanitizeTransaction(t: any): Transaction {
  const type: TransactionType = ["Income", "Expense", "Transfer"].includes(t.transactionType || t.type) ? (t.transactionType || t.type) : "Expense";
  return {
    id: t.id || generateUUID(),
    userId: t.userId || getActiveUserId(),
    transactionType: type,
    accountId: t.accountId || "acc-main",
    destinationAccountId: t.destinationAccountId || undefined,
    categoryId: t.categoryId || t.category || undefined,
    amount: typeof t.amount === "number" ? Math.abs(t.amount) : 0,
    currency: t.currency || "USD",
    transactionDate: t.transactionDate || t.date || new Date().toISOString().split("T")[0],
    transactionTime: t.transactionTime || "12:00",
    title: t.title || t.description || "Transaction",
    description: t.description || "",
    notes: t.notes || "",
    attachmentIds: t.attachmentIds || [],
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    archivedAt: t.archivedAt || undefined,
    deletedAt: t.deletedAt || undefined,
    version: t.version || 1,
    syncStatus: t.syncStatus || "synced",
  };
}

function sanitizeHealthMeasurement(m: any): HealthMeasurement {
  const type: HealthMeasureType = ["Weight", "Blood Pressure", "Water", "Sleep", "Daily Walk", "Daily Calories"].includes(m.measureType || m.type) ? (m.measureType || m.type) : "Weight";
  return {
    id: m.id || generateUUID(),
    userId: m.userId || getActiveUserId(),
    measureType: type,
    primaryValue: typeof m.primaryValue === "number" ? m.primaryValue : (typeof m.value === "number" ? m.value : 0),
    secondaryValue: typeof m.secondaryValue === "number" ? m.secondaryValue : undefined,
    unit: m.unit || "Kg",
    measuredDate: m.measuredDate || m.date || new Date().toISOString().split("T")[0],
    measuredTime: m.measuredTime || m.time || "08:00",
    note: m.note || "",
    createdAt: m.createdAt || new Date().toISOString(),
    updatedAt: m.updatedAt || new Date().toISOString(),
  };
}

function sanitizeMedication(m: any): Medication {
  const dUnit: MedicationDosageUnit = ["mg", "g", "mcg", "ml", "Tablet", "Capsule", "Drop", "Dose", "Custom"].includes(m.dosageUnit) ? m.dosageUnit : "mg";
  const mForm: MedicationForm = ["Tablet", "Capsule", "Liquid", "Injection", "Drops", "Cream", "Inhaler", "Other"].includes(m.medicationForm) ? m.medicationForm : "Tablet";
  const freq: MedicationFrequency = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "Selected weekdays", "Every number of hours", "Weekly", "Custom"].includes(m.frequencyType || m.frequency) ? (m.frequencyType || m.frequency) : "Once daily";
  const food: MedicationFoodInstruction = ["Before food", "With food", "After food", "No food instruction", "Custom"].includes(m.foodInstruction || m.foodInstructions) ? (m.foodInstruction || m.foodInstructions) : "With food";

  return {
    id: m.id || generateUUID(),
    userId: m.userId || getActiveUserId(),
    medicationName: m.medicationName || m.name || "Medication",
    dosageValue: m.dosageValue || m.dose || "1",
    dosageUnit: dUnit,
    medicationForm: mForm,
    frequencyType: freq,
    timesPerDay: typeof m.timesPerDay === "number" ? m.timesPerDay : 1,
    selectedWeekdays: m.selectedWeekdays || [1, 2, 3, 4, 5],
    scheduleTimes: m.scheduleTimes || m.times || ["08:00"],
    startDate: m.startDate || new Date().toISOString().split("T")[0],
    endDate: m.endDate || undefined,
    foodInstruction: food,
    prescribingDoctor: m.prescribingDoctor || m.prescriber || "",
    pharmacy: m.pharmacy || "",
    reminderEnabled: typeof m.reminderEnabled === "boolean" ? m.reminderEnabled : true,
    refillQuantity: typeof m.refillQuantity === "number" ? m.refillQuantity : (typeof m.remainingQuantity === "number" ? m.remainingQuantity : 30),
    refillThreshold: typeof m.refillThreshold === "number" ? m.refillThreshold : 5,
    notes: m.notes || "",
    active: typeof m.active === "boolean" ? m.active : true,
    logs: m.logs || {},
    createdAt: m.createdAt || new Date().toISOString(),
    updatedAt: m.updatedAt || new Date().toISOString(),
  };
}

function sanitizeCourse(c: any): Course {
  const status: CourseStatus = ["Planned", "In Progress", "Completed", "Paused", "Archived"].includes(c.status) ? c.status : (c.status === "Active" ? "In Progress" : "Planned");
  const totalDurationMinutes = typeof c.totalDurationMinutes === "number" && c.totalDurationMinutes > 0 ? c.totalDurationMinutes : (typeof c.totalModules === "number" ? c.totalModules * 60 : 300);
  const completedMinutes = typeof c.completedMinutes === "number" ? c.completedMinutes : (typeof c.completedModules === "number" ? c.completedModules * 60 : 0);
  const progressPercentage = totalDurationMinutes === 0 ? 0 : Math.min(Math.round((completedMinutes / totalDurationMinutes) * 100), 100);

  return {
    id: c.id || generateUUID(),
    userId: c.userId || getActiveUserId(),
    courseTitle: c.courseTitle || c.title || "Untitled Course",
    provider: c.provider || "Online",
    instructor: c.instructor || "",
    courseUrl: c.courseUrl || c.url || "",
    description: c.description || "",
    category: c.category || "General",
    status: status,
    totalDurationMinutes: totalDurationMinutes,
    completedMinutes: completedMinutes,
    startDate: c.startDate || new Date().toISOString().split("T")[0],
    dueDate: c.dueDate || c.targetCompletionDate || undefined,
    progressPercentage: progressPercentage,
    certificateDocumentId: c.certificateDocumentId || undefined,
    notes: c.notes || "",
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
  };
}

function sanitizeJobApplication(j: any): JobApplication {
  const status: JobApplicationStatus = ["Saved", "Preparing", "Applied", "Screening", "Interview", "Technical Test", "Final Interview", "Offer", "Accepted", "Rejected", "Withdrawn"].includes(j.applicationStatus || j.status) ? (j.applicationStatus || j.status) : "Applied";
  const isPresent = typeof j.isPresent === "boolean" ? j.isPresent : false;

  return {
    id: j.id || generateUUID(),
    userId: j.userId || getActiveUserId(),
    companyName: j.companyName || j.company || "Company",
    positionTitle: j.positionTitle || j.position || "Position",
    description: j.description || "",
    location: j.location || "Remote",
    workModel: j.workModel || "Remote",
    employmentType: j.employmentType || "Full-time",
    applicationStatus: status,
    applicationDate: j.applicationDate || j.appliedDate || new Date().toISOString().split("T")[0],
    startDate: j.startDate || undefined,
    endDate: isPresent ? null : (j.endDate || undefined),
    isPresent: isPresent,
    salaryMinimum: typeof j.salaryMinimum === "number" ? j.salaryMinimum : j.salaryMin,
    salaryMaximum: typeof j.salaryMaximum === "number" ? j.salaryMaximum : j.salaryMax,
    currency: j.currency || "USD",
    applicationUrl: j.applicationUrl || "",
    contactName: j.contactName || "",
    contactEmail: j.contactEmail || "",
    notes: j.notes || "",
    createdAt: j.createdAt || new Date().toISOString(),
    updatedAt: j.updatedAt || new Date().toISOString(),
  };
}

function sanitizeNote(n: any): Note {
  let priority = n.priority;
  if (!["Low", "Medium", "High", "Urgent"].includes(priority)) priority = "Medium";

  return {
    id: n.id || generateUUID(),
    userId: n.userId || getActiveUserId(),
    title: n.title || "Untitled Note",
    content: n.content || "",
    priority: priority,
    tags: Array.isArray(n.tags) ? n.tags : [],
    pinned: typeof n.pinned === "boolean" ? n.pinned : false,
    archived: typeof n.archived === "boolean" ? n.archived : false,
    createdAt: n.createdAt || new Date().toISOString(),
    updatedAt: n.updatedAt || new Date().toISOString(),
    deletedAt: n.deletedAt || undefined,
  };
}

function sanitizeDocument(d: any): DocumentItem {
  return {
    id: d.id || generateUUID(),
    userId: d.userId || getActiveUserId(),
    originalFileName: d.originalFileName || d.name || "document.pdf",
    storedFileName: d.storedFileName || `${generateUUID()}.pdf`,
    mimeType: d.mimeType || d.fileType || "application/pdf",
    fileSize: typeof d.fileSize === "number" ? d.fileSize : (typeof d.sizeBytes === "number" ? d.sizeBytes : 1024),
    category: d.category || "Personal",
    description: d.description || "",
    tags: Array.isArray(d.tags) ? d.tags : [],
    storagePath: d.storagePath || d.url || "",
    uploadedAt: d.uploadedAt || d.createdAt || new Date().toISOString(),
    updatedAt: d.updatedAt || new Date().toISOString(),
  };
}

// MAIN STORAGE EXPORT
export const nixStorage = {
  // Settings
  getSettings: (): UserSettings => getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (settings: UserSettings): void => setItem(STORAGE_KEYS.SETTINGS, settings),

  // Points & Levels Engine
  getPointsProfile: (): UserPointProfile => {
    const profile = getItem(STORAGE_KEYS.POINTS_PROFILE, DEFAULT_POINTS_PROFILE);
    const lvl = calculateLevel(profile.totalPoints);
    const next = calculateNextLevel(profile.totalPoints);
    profile.currentLevel = lvl.level;
    profile.levelName = lvl.name;
    profile.pointsToNextLevel = next.pointsNeeded;
    return profile;
  },

  getPointEvents: (): PointEvent[] => getItem(STORAGE_KEYS.POINT_EVENTS, []),

  awardPoints: (params: {
    userId?: string;
    sourceModule: string;
    sourceEntityType: string;
    sourceEntityId: string;
    action: string;
    basePoints: number;
    bonusPoints?: number;
    idempotencyKey: string;
  }): PointEvent | null => {
    const events = nixStorage.getPointEvents();
    // Idempotency check: prevent duplicate point awards
    const existing = events.find((e) => e.idempotencyKey === params.idempotencyKey && !e.reversedAt);
    if (existing) {
      return null; // Already awarded!
    }

    const total = params.basePoints + (params.bonusPoints || 0);
    const event: PointEvent = {
      id: generateUUID(),
      userId: params.userId || getActiveUserId(),
      sourceModule: params.sourceModule,
      sourceEntityType: params.sourceEntityType,
      sourceEntityId: params.sourceEntityId,
      action: params.action,
      basePoints: params.basePoints,
      bonusPoints: params.bonusPoints || 0,
      totalPoints: total,
      idempotencyKey: params.idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    events.unshift(event);
    setItem(STORAGE_KEYS.POINT_EVENTS, events);

    // Update Profile
    const profile = nixStorage.getPointsProfile();
    profile.totalPoints += total;
    const lvl = calculateLevel(profile.totalPoints);
    const next = calculateNextLevel(profile.totalPoints);
    profile.currentLevel = lvl.level;
    profile.levelName = lvl.name;
    profile.pointsToNextLevel = next.pointsNeeded;
    setItem(STORAGE_KEYS.POINTS_PROFILE, profile);

    // Log Audit
    nixStorage.addAuditEvent({
      module: "Points",
      entityType: "PointEvent",
      entityId: event.id,
      action: "AWARD_POINTS",
      newSummary: `Awarded +${total} pts (${params.action})`,
      source: params.sourceModule,
    });

    return event;
  },

  // Audit Log Engine
  getAuditEvents: (): AuditEvent[] => getItem(STORAGE_KEYS.AUDIT, []),
  addAuditEvent: (event: {
    module: string;
    entityType: string;
    entityId: string;
    action: string;
    previousSummary?: string;
    newSummary?: string;
    source?: string;
    correlationId?: string;
  }): AuditEvent => {
    const events = nixStorage.getAuditEvents();
    const newEvent: AuditEvent = {
      id: generateUUID(),
      userId: getActiveUserId(),
      module: event.module,
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
      previousSummary: event.previousSummary,
      newSummary: event.newSummary,
      timestamp: new Date().toISOString(),
      source: event.source || "System",
      correlationId: event.correlationId,
    };
    events.unshift(newEvent);
    if (events.length > 200) events.pop();
    setItem(STORAGE_KEYS.AUDIT, events);
    return newEvent;
  },

  // TASKS REPOSITORY
  getTasks: (): Task[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.TASKS, []);
    return raw.map(sanitizeTask).filter((t) => !t.deletedAt);
  },

  saveTask: (taskInput: Partial<Task>): Task => {
    const tasks = nixStorage.getTasks();
    const existingIndex = tasks.findIndex((t) => t.id === taskInput.id);
    const now = new Date().toISOString();

    let task: Task;
    if (existingIndex >= 0) {
      const prev = tasks[existingIndex];
      task = sanitizeTask({ ...prev, ...taskInput, updatedAt: now });

      // Status transition handling
      if (prev.status !== task.status) {
        if (task.status === "In Progress" && !task.startedAt) {
          task.startedAt = now;
        } else if (task.status === "Finished") {
          task.finishedAt = now;
          // Award points idempotently
          const pts = task.priority === "Urgent" ? 200 : task.priority === "High" ? 150 : task.priority === "Medium" ? 125 : 100;
          nixStorage.awardPoints({
            sourceModule: "Tasks",
            sourceEntityType: "Task",
            sourceEntityId: task.id,
            action: `Finished ${task.priority} Task`,
            basePoints: pts,
            idempotencyKey: `task-finish-${task.id}-${now.substring(0, 10)}`,
          });
        }
      }
      tasks[existingIndex] = task;
    } else {
      task = sanitizeTask({
        ...taskInput,
        id: taskInput.id || generateUUID(),
        createdAt: now,
        updatedAt: now,
      });
      tasks.unshift(task);
    }

    setItem(STORAGE_KEYS.TASKS, tasks);

    // Update Linked Project Progress if linked
    if (task.projectId) {
      nixStorage.recalculateProjectProgress(task.projectId);
    }

    nixStorage.addAuditEvent({
      module: "Tasks",
      entityType: "Task",
      entityId: task.id,
      action: existingIndex >= 0 ? "UPDATE_TASK" : "CREATE_TASK",
      newSummary: `Saved task "${task.title}" [${task.status}]`,
      source: "TasksView",
    });

    return task;
  },

  deleteTask: (taskId: string): void => {
    const tasks = nixStorage.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    const updated = tasks.filter((t) => t.id !== taskId);
    setItem(STORAGE_KEYS.TASKS, updated);

    if (task && task.projectId) {
      nixStorage.recalculateProjectProgress(task.projectId);
    }

    nixStorage.addAuditEvent({
      module: "Tasks",
      entityType: "Task",
      entityId: taskId,
      action: "DELETE_TASK",
      previousSummary: task ? task.title : undefined,
      source: "TasksView",
    });
  },

  // PROJECTS REPOSITORY
  getProjects: (): Project[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.PROJECTS, []);
    return raw.map(sanitizeProject).filter((p) => !p.deletedAt);
  },

  recalculateProjectProgress: (projectId: string): Project | null => {
    const projects = nixStorage.getProjects();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return null;

    const allTasks = nixStorage.getTasks();
    const linkedTasks = allTasks.filter((t) => t.projectId === projectId && !t.deletedAt && !t.archivedAt);
    const finishedCount = linkedTasks.filter((t) => t.status === "Finished").length;
    const totalCount = linkedTasks.length;

    project.taskCount = totalCount;
    project.finishedTaskCount = finishedCount;
    project.progressPercentage = totalCount === 0 ? 0 : Math.round((finishedCount / totalCount) * 100);
    project.updatedAt = new Date().toISOString();

    if (project.progressPercentage === 100 && project.status !== "Finished") {
      // Suggest status finished or update
      project.status = "Finished";
      project.completedAt = new Date().toISOString();
      nixStorage.awardPoints({
        sourceModule: "Projects",
        sourceEntityType: "Project",
        sourceEntityId: project.id,
        action: "Completed Project 100%",
        basePoints: 1000,
        idempotencyKey: `project-complete-${project.id}`,
      });
    }

    setItem(STORAGE_KEYS.PROJECTS, projects);
    return project;
  },

  saveProject: (projectInput: Partial<Project>): Project => {
    const projects = nixStorage.getProjects();
    const existingIndex = projects.findIndex((p) => p.id === projectInput.id);
    const now = new Date().toISOString();

    let project: Project;
    if (existingIndex >= 0) {
      project = sanitizeProject({ ...projects[existingIndex], ...projectInput, updatedAt: now });
      projects[existingIndex] = project;
    } else {
      project = sanitizeProject({
        ...projectInput,
        id: projectInput.id || generateUUID(),
        createdAt: now,
        updatedAt: now,
      });
      projects.unshift(project);
    }

    setItem(STORAGE_KEYS.PROJECTS, projects);
    nixStorage.recalculateProjectProgress(project.id);

    nixStorage.addAuditEvent({
      module: "Projects",
      entityType: "Project",
      entityId: project.id,
      action: existingIndex >= 0 ? "UPDATE_PROJECT" : "CREATE_PROJECT",
      newSummary: `Saved project "${project.title}" [${project.progressPercentage}%]`,
      source: "ProjectsView",
    });

    return project;
  },

  deleteProject: (projectId: string): void => {
    const projects = nixStorage.getProjects().filter((p) => p.id !== projectId);
    setItem(STORAGE_KEYS.PROJECTS, projects);
    nixStorage.addAuditEvent({
      module: "Projects",
      entityType: "Project",
      entityId: projectId,
      action: "DELETE_PROJECT",
      source: "ProjectsView",
    });
  },

  // GOALS REPOSITORY
  getGoals: (): Goal[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.GOALS, []);
    return raw.map(sanitizeGoal).filter((g) => !g.deletedAt);
  },

  getGoalLogs: (goalId?: string): GoalProgressLog[] => {
    const logs = getItem<GoalProgressLog[]>(STORAGE_KEYS.GOAL_LOGS, []);
    if (goalId) return logs.filter((l) => l.goalId === goalId);
    return logs;
  },

  logGoalProgress: (goalId: string, completedUnits: number, note?: string): Goal | null => {
    const goals = nixStorage.getGoals();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return null;

    goal.currentValue += completedUnits;
    const sanitized = sanitizeGoal(goal);
    sanitized.updatedAt = new Date().toISOString();

    const goalsIndex = goals.findIndex((g) => g.id === goalId);
    goals[goalsIndex] = sanitized;
    setItem(STORAGE_KEYS.GOALS, goals);

    // Save Log
    const logs = nixStorage.getGoalLogs();
    const newLog: GoalProgressLog = {
      id: generateUUID(),
      goalId: goalId,
      date: new Date().toISOString().split("T")[0],
      completedUnits: completedUnits,
      note: note || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setItem(STORAGE_KEYS.GOAL_LOGS, logs);

    // Award Points
    nixStorage.awardPoints({
      sourceModule: "Goals",
      sourceEntityType: "Goal",
      sourceEntityId: goalId,
      action: "Log Goal Progress",
      basePoints: 150,
      idempotencyKey: `goal-log-${goalId}-${newLog.date}`,
    });

    if (sanitized.progressPercentage >= 100) {
      nixStorage.awardPoints({
        sourceModule: "Goals",
        sourceEntityType: "Goal",
        sourceEntityId: goalId,
        action: "Achieved 100% Goal Target",
        basePoints: 2000,
        idempotencyKey: `goal-complete-${goalId}`,
      });
    }

    return sanitized;
  },

  saveGoal: (goalInput: Partial<Goal>): Goal => {
    const goals = nixStorage.getGoals();
    const existingIndex = goals.findIndex((g) => g.id === goalInput.id);
    const now = new Date().toISOString();

    let goal: Goal;
    if (existingIndex >= 0) {
      goal = sanitizeGoal({ ...goals[existingIndex], ...goalInput, updatedAt: now });
      goals[existingIndex] = goal;
    } else {
      goal = sanitizeGoal({
        ...goalInput,
        id: goalInput.id || generateUUID(),
        createdAt: now,
        updatedAt: now,
      });
      goals.unshift(goal);
    }

    setItem(STORAGE_KEYS.GOALS, goals);
    nixStorage.addAuditEvent({
      module: "Goals",
      entityType: "Goal",
      entityId: goal.id,
      action: existingIndex >= 0 ? "UPDATE_GOAL" : "CREATE_GOAL",
      newSummary: `Saved goal "${goal.title}" [${goal.progressPercentage}%]`,
      source: "GoalsView",
    });

    return goal;
  },

  deleteGoal: (goalId: string): void => {
    const goals = nixStorage.getGoals().filter((g) => g.id !== goalId);
    setItem(STORAGE_KEYS.GOALS, goals);
    nixStorage.addAuditEvent({
      module: "Goals",
      entityType: "Goal",
      entityId: goalId,
      action: "DELETE_GOAL",
      source: "GoalsView",
    });
  },

  // HABITS REPOSITORY
  getHabits: (): Habit[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.HABITS, []);
    return raw.map(sanitizeHabit).filter((h) => !h.deletedAt);
  },

  getHabitCheckins: (habitId?: string): HabitCheckinLog[] => {
    const logs = getItem<HabitCheckinLog[]>(STORAGE_KEYS.HABIT_CHECKINS, []);
    if (habitId) return logs.filter((l) => l.habitId === habitId);
    return logs;
  },

  saveHabit: (habitInput: Partial<Habit>): Habit => {
    const habits = nixStorage.getHabits();
    const existingIndex = habits.findIndex((h) => h.id === habitInput.id);
    const now = new Date().toISOString();

    let habit: Habit;
    if (existingIndex >= 0) {
      habit = sanitizeHabit({ ...habits[existingIndex], ...habitInput, updatedAt: now });
      habits[existingIndex] = habit;
    } else {
      habit = sanitizeHabit({
        ...habitInput,
        id: habitInput.id || generateUUID(),
        createdAt: now,
        updatedAt: now,
      });
      habits.unshift(habit);
    }

    setItem(STORAGE_KEYS.HABITS, habits);
    return habit;
  },

  toggleHabitCheckin: (habitId: string, dateStr: string, note?: string): Habit | null => {
    const habits = nixStorage.getHabits();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return null;

    if (!habit.completedDates) habit.completedDates = {};
    const currentQty = habit.completedDates[dateStr] || 0;
    const isNowCompleted = currentQty <= 0;

    if (isNowCompleted) {
      habit.completedDates[dateStr] = habit.targetQuantity || 1;
      habit.currentStreak = (habit.currentStreak || 0) + 1;
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }

      // Record Checkin Log
      const logs = nixStorage.getHabitCheckins();
      logs.unshift({
        id: generateUUID(),
        habitId: habitId,
        date: dateStr,
        quantity: habit.targetQuantity,
        completed: true,
        note: note || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setItem(STORAGE_KEYS.HABIT_CHECKINS, logs);

      // Award Points Idempotently per day
      nixStorage.awardPoints({
        sourceModule: "Habits",
        sourceEntityType: "Habit",
        sourceEntityId: habitId,
        action: `Completed Habit: ${habit.title}`,
        basePoints: 50,
        idempotencyKey: `habit-checkin-${habitId}-${dateStr}`,
      });
    } else {
      delete habit.completedDates[dateStr];
      habit.currentStreak = Math.max(0, habit.currentStreak - 1);
    }

    habit.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.HABITS, habits);
    return habit;
  },

  deleteHabit: (habitId: string): void => {
    const habits = nixStorage.getHabits().filter((h) => h.id !== habitId);
    setItem(STORAGE_KEYS.HABITS, habits);
  },

  // CALENDAR REPOSITORY
  getCalendarEvents: (): CalendarEvent[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.CALENDAR_EVENTS, []);
    return raw.map(sanitizeCalendarEvent).filter((e) => !e.deletedAt);
  },

  saveCalendarEvent: (eventInput: Partial<CalendarEvent>): CalendarEvent => {
    const events = nixStorage.getCalendarEvents();
    const existingIndex = events.findIndex((e) => e.id === eventInput.id);
    const now = new Date().toISOString();

    let event: CalendarEvent;
    if (existingIndex >= 0) {
      event = sanitizeCalendarEvent({ ...events[existingIndex], ...eventInput, updatedAt: now });
      events[existingIndex] = event;
    } else {
      event = sanitizeCalendarEvent({
        ...eventInput,
        id: eventInput.id || generateUUID(),
        createdAt: now,
        updatedAt: now,
      });
      events.unshift(event);
    }

    setItem(STORAGE_KEYS.CALENDAR_EVENTS, events);
    return event;
  },

  deleteCalendarEvent: (eventId: string): void => {
    const events = nixStorage.getCalendarEvents().filter((e) => e.id !== eventId);
    setItem(STORAGE_KEYS.CALENDAR_EVENTS, events);
  },

  // FOCUS SESSIONS REPOSITORY
  getFocusSessions: (): FocusSession[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.FOCUS, []);
    return raw.map(sanitizeFocusSession);
  },

  saveFocusSession: (sessionInput: Partial<FocusSession>): FocusSession => {
    const sessions = nixStorage.getFocusSessions();
    const session = sanitizeFocusSession({
      ...sessionInput,
      id: sessionInput.id || generateUUID(),
      createdAt: new Date().toISOString(),
    });
    sessions.unshift(session);
    setItem(STORAGE_KEYS.FOCUS, sessions);

    // Award 2 points per focus minute
    const pts = Math.min(session.actualMinutes * 2, 120);
    nixStorage.awardPoints({
      sourceModule: "Focus",
      sourceEntityType: "FocusSession",
      sourceEntityId: session.id,
      action: `Completed ${session.actualMinutes}m Focus Session`,
      basePoints: pts,
      idempotencyKey: `focus-${session.id}`,
    });

    return session;
  },

  // FINANCE REPOSITORY
  getAccounts: (): Account[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.ACCOUNTS, []);
    const accounts = raw.map(sanitizeAccount).filter((a) => !a.deletedAt);

    // Recalculate balance from transactions
    const txs = nixStorage.getTransactions();
    return accounts.map((acc) => {
      let calcBalance = acc.initialAmount;
      txs.forEach((tx) => {
        if (tx.accountId === acc.id) {
          if (tx.transactionType === "Income") calcBalance += tx.amount;
          else if (tx.transactionType === "Expense") calcBalance -= tx.amount;
          else if (tx.transactionType === "Transfer") calcBalance -= tx.amount;
        } else if (tx.destinationAccountId === acc.id && tx.transactionType === "Transfer") {
          calcBalance += tx.amount;
        }
      });
      acc.currentBalance = Math.round(calcBalance * 100) / 100;
      return acc;
    });
  },

  saveAccount: (accountInput: Partial<Account>): Account => {
    const accounts = nixStorage.getAccounts();
    const existingIndex = accounts.findIndex((a) => a.id === accountInput.id);
    const now = new Date().toISOString();

    let account: Account;
    if (existingIndex >= 0) {
      account = sanitizeAccount({ ...accounts[existingIndex], ...accountInput, updatedAt: now });
      accounts[existingIndex] = account;
    } else {
      account = sanitizeAccount({
        ...accountInput,
        id: accountInput.id || generateUUID(),
        createdAt: now,
        updatedAt: now,
      });
      accounts.unshift(account);
    }

    setItem(STORAGE_KEYS.ACCOUNTS, accounts);
    return account;
  },

  deleteAccount: (accountId: string): void => {
    const accounts = nixStorage.getAccounts().filter((a) => a.id !== accountId);
    setItem(STORAGE_KEYS.ACCOUNTS, accounts);
  },

  getFinanceCategories: (): FinanceCategory[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.FINANCE_CATEGORIES, []);
    if (raw.length === 0) {
      // Seed default categories
      const defaults: FinanceCategory[] = [
        { id: "cat-sal", userId: getActiveUserId(), name: "Salary", type: "Income", color: "#10B981", active: true },
        { id: "cat-inv", userId: getActiveUserId(), name: "Investments", type: "Income", color: "#3B82F6", active: true },
        { id: "cat-fre", userId: getActiveUserId(), name: "Freelance", type: "Income", color: "#8B5CF6", active: true },
        { id: "cat-gro", userId: getActiveUserId(), name: "Groceries", type: "Expense", color: "#F59E0B", active: true },
        { id: "cat-ren", userId: getActiveUserId(), name: "Rent & Housing", type: "Expense", color: "#EF4444", active: true },
        { id: "cat-uti", userId: getActiveUserId(), name: "Utilities", type: "Expense", color: "#EC4899", active: true },
        { id: "cat-ent", userId: getActiveUserId(), name: "Entertainment", type: "Expense", color: "#06B6D4", active: true },
      ];
      setItem(STORAGE_KEYS.FINANCE_CATEGORIES, defaults);
      return defaults;
    }
    return raw.map(sanitizeCategory);
  },

  saveFinanceCategory: (catInput: Partial<FinanceCategory>): FinanceCategory => {
    const categories = nixStorage.getFinanceCategories();
    const idx = categories.findIndex((c) => c.id === catInput.id);
    let cat: FinanceCategory;
    if (idx >= 0) {
      cat = sanitizeCategory({ ...categories[idx], ...catInput, updatedAt: new Date().toISOString() });
      categories[idx] = cat;
    } else {
      cat = sanitizeCategory({ ...catInput, id: catInput.id || generateUUID() });
      categories.unshift(cat);
    }
    setItem(STORAGE_KEYS.FINANCE_CATEGORIES, categories);
    return cat;
  },

  getTransactions: (): Transaction[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.TRANSACTIONS, []);
    return raw.map(sanitizeTransaction).filter((t) => !t.deletedAt);
  },

  saveTransaction: (txInput: Partial<Transaction>): Transaction => {
    const transactions = nixStorage.getTransactions();
    const existingIndex = transactions.findIndex((t) => t.id === txInput.id);
    const now = new Date().toISOString();

    let tx: Transaction;
    if (existingIndex >= 0) {
      tx = sanitizeTransaction({ ...transactions[existingIndex], ...txInput, updatedAt: now });
      transactions[existingIndex] = tx;
    } else {
      tx = sanitizeTransaction({
        ...txInput,
        id: txInput.id || generateUUID(),
        createdAt: now,
        updatedAt: now,
      });
      transactions.unshift(tx);
    }

    setItem(STORAGE_KEYS.TRANSACTIONS, transactions);

    // Award Points for logging valid transaction
    nixStorage.awardPoints({
      sourceModule: "Finance",
      sourceEntityType: "Transaction",
      sourceEntityId: tx.id,
      action: `Logged ${tx.transactionType} Transaction`,
      basePoints: 10,
      idempotencyKey: `tx-${tx.id}`,
    });

    return tx;
  },

  deleteTransaction: (txId: string): void => {
    const txs = nixStorage.getTransactions().filter((t) => t.id !== txId);
    setItem(STORAGE_KEYS.TRANSACTIONS, txs);
  },

  // HEALTH REPOSITORY
  getHealthMeasurements: (): HealthMeasurement[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.HEALTH_MEASUREMENTS, []);
    return raw.map(sanitizeHealthMeasurement);
  },

  saveHealthMeasurement: (mInput: Partial<HealthMeasurement>): HealthMeasurement => {
    const measurements = nixStorage.getHealthMeasurements();
    const idx = measurements.findIndex((m) => m.id === mInput.id);
    let m: HealthMeasurement;
    if (idx >= 0) {
      m = sanitizeHealthMeasurement({ ...measurements[idx], ...mInput, updatedAt: new Date().toISOString() });
      measurements[idx] = m;
    } else {
      m = sanitizeHealthMeasurement({ ...mInput, id: mInput.id || generateUUID() });
      measurements.unshift(m);
    }
    setItem(STORAGE_KEYS.HEALTH_MEASUREMENTS, measurements);

    nixStorage.awardPoints({
      sourceModule: "Health",
      sourceEntityType: "HealthMeasurement",
      sourceEntityId: m.id,
      action: `Logged Health Metric: ${m.measureType}`,
      basePoints: 25,
      idempotencyKey: `health-measure-${m.id}`,
    });

    return m;
  },

  deleteHealthMeasurement: (id: string): void => {
    const list = nixStorage.getHealthMeasurements().filter((m) => m.id !== id);
    setItem(STORAGE_KEYS.HEALTH_MEASUREMENTS, list);
  },

  getMedications: (): Medication[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.MEDICATIONS, []);
    return raw.map(sanitizeMedication);
  },

  saveMedication: (medInput: Partial<Medication>): Medication => {
    const meds = nixStorage.getMedications();
    const idx = meds.findIndex((m) => m.id === medInput.id);
    let med: Medication;
    if (idx >= 0) {
      med = sanitizeMedication({ ...meds[idx], ...medInput, updatedAt: new Date().toISOString() });
      meds[idx] = med;
    } else {
      med = sanitizeMedication({ ...medInput, id: medInput.id || generateUUID() });
      meds.unshift(med);
    }
    setItem(STORAGE_KEYS.MEDICATIONS, meds);
    return med;
  },

  logMedicationStatus: (medId: string, timestampKey: string, status: "Scheduled" | "Taken" | "Skipped" | "Missed" | "Snoozed"): void => {
    const meds = nixStorage.getMedications();
    const med = meds.find((m) => m.id === medId);
    if (med) {
      if (!med.logs) med.logs = {};
      med.logs[timestampKey] = status;
      if (status === "Taken") {
        med.refillQuantity = Math.max(0, med.refillQuantity - 1);
        nixStorage.awardPoints({
          sourceModule: "Health",
          sourceEntityType: "Medication",
          sourceEntityId: medId,
          action: `Took Medication: ${med.medicationName}`,
          basePoints: 25,
          idempotencyKey: `med-taken-${medId}-${timestampKey}`,
        });
      }
      setItem(STORAGE_KEYS.MEDICATIONS, meds);
    }
  },

  deleteMedication: (medId: string): void => {
    const meds = nixStorage.getMedications().filter((m) => m.id !== medId);
    setItem(STORAGE_KEYS.MEDICATIONS, meds);
  },

  // COURSES REPOSITORY
  getCourses: (): Course[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.COURSES, []);
    return raw.map(sanitizeCourse);
  },

  getCourseSessions: (courseId?: string): CourseStudySession[] => {
    const sessions = getItem<CourseStudySession[]>(STORAGE_KEYS.COURSE_SESSIONS, []);
    if (courseId) return sessions.filter((s) => s.courseId === courseId);
    return sessions;
  },

  logStudySession: (courseId: string, minutesStudied: number, note?: string): Course | null => {
    const courses = nixStorage.getCourses();
    const course = courses.find((c) => c.id === courseId);
    if (!course) return null;

    course.completedMinutes += minutesStudied;
    const sanitized = sanitizeCourse(course);
    sanitized.updatedAt = new Date().toISOString();

    const idx = courses.findIndex((c) => c.id === courseId);
    courses[idx] = sanitized;
    setItem(STORAGE_KEYS.COURSES, courses);

    // Save Study Session Log
    const sessions = nixStorage.getCourseSessions();
    sessions.unshift({
      id: generateUUID(),
      courseId: courseId,
      sessionDate: new Date().toISOString().split("T")[0],
      minutesStudied: minutesStudied,
      note: note || "",
      createdAt: new Date().toISOString(),
    });
    setItem(STORAGE_KEYS.COURSE_SESSIONS, sessions);

    // Award 1 point per minute studied
    nixStorage.awardPoints({
      sourceModule: "Education",
      sourceEntityType: "Course",
      sourceEntityId: courseId,
      action: `Studied ${minutesStudied}m for ${course.courseTitle}`,
      basePoints: minutesStudied,
      idempotencyKey: `study-${courseId}-${Date.now()}`,
    });

    if (sanitized.progressPercentage >= 100 && sanitized.status !== "Completed") {
      sanitized.status = "Completed";
      nixStorage.awardPoints({
        sourceModule: "Education",
        sourceEntityType: "Course",
        sourceEntityId: courseId,
        action: `Completed Course: ${course.courseTitle}`,
        basePoints: 1000,
        idempotencyKey: `course-complete-${courseId}`,
      });
    }

    return sanitized;
  },

  saveCourse: (courseInput: Partial<Course>): Course => {
    const courses = nixStorage.getCourses();
    const idx = courses.findIndex((c) => c.id === courseInput.id);
    let course: Course;
    if (idx >= 0) {
      course = sanitizeCourse({ ...courses[idx], ...courseInput, updatedAt: new Date().toISOString() });
      courses[idx] = course;
    } else {
      course = sanitizeCourse({ ...courseInput, id: courseInput.id || generateUUID() });
      courses.unshift(course);
    }
    setItem(STORAGE_KEYS.COURSES, courses);
    return course;
  },

  deleteCourse: (courseId: string): void => {
    const courses = nixStorage.getCourses().filter((c) => c.id !== courseId);
    setItem(STORAGE_KEYS.COURSES, courses);
  },

  // CAREER REPOSITORY
  getJobApplications: (): JobApplication[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.JOB_APPLICATIONS, []);
    return raw.map(sanitizeJobApplication);
  },

  saveJobApplication: (jobInput: Partial<JobApplication>): JobApplication => {
    const jobs = nixStorage.getJobApplications();
    const idx = jobs.findIndex((j) => j.id === jobInput.id);
    let job: JobApplication;
    if (idx >= 0) {
      job = sanitizeJobApplication({ ...jobs[idx], ...jobInput, updatedAt: new Date().toISOString() });
      jobs[idx] = job;
    } else {
      job = sanitizeJobApplication({ ...jobInput, id: jobInput.id || generateUUID() });
      jobs.unshift(job);
    }
    setItem(STORAGE_KEYS.JOB_APPLICATIONS, jobs);

    nixStorage.awardPoints({
      sourceModule: "Career",
      sourceEntityType: "JobApplication",
      sourceEntityId: job.id,
      action: `Logged Job Application: ${job.positionTitle} at ${job.companyName}`,
      basePoints: 50,
      idempotencyKey: `job-app-${job.id}`,
    });

    return job;
  },

  deleteJobApplication: (id: string): void => {
    const jobs = nixStorage.getJobApplications().filter((j) => j.id !== id);
    setItem(STORAGE_KEYS.JOB_APPLICATIONS, jobs);
  },

  // NOTES REPOSITORY
  getNotes: (): Note[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.NOTES, []);
    return raw.map(sanitizeNote).filter((n) => !n.deletedAt);
  },

  saveNote: (noteInput: Partial<Note>): Note => {
    const notes = nixStorage.getNotes();
    const idx = notes.findIndex((n) => n.id === noteInput.id);
    let note: Note;
    if (idx >= 0) {
      note = sanitizeNote({ ...notes[idx], ...noteInput, updatedAt: new Date().toISOString() });
      notes[idx] = note;
    } else {
      note = sanitizeNote({ ...noteInput, id: noteInput.id || generateUUID() });
      notes.unshift(note);
    }
    setItem(STORAGE_KEYS.NOTES, notes);

    nixStorage.awardPoints({
      sourceModule: "Notes",
      sourceEntityType: "Note",
      sourceEntityId: note.id,
      action: `Created Note: ${note.title}`,
      basePoints: 20,
      idempotencyKey: `note-${note.id}`,
    });

    return note;
  },

  deleteNote: (id: string): void => {
    const notes = nixStorage.getNotes().filter((n) => n.id !== id);
    setItem(STORAGE_KEYS.NOTES, notes);
  },

  // DOCUMENTS REPOSITORY
  getDocuments: (): DocumentItem[] => {
    const raw = getItem<any[]>(STORAGE_KEYS.DOCUMENTS, []);
    return raw.map(sanitizeDocument);
  },

  saveDocument: (docInput: Partial<DocumentItem>): DocumentItem => {
    const docs = nixStorage.getDocuments();
    const idx = docs.findIndex((d) => d.id === docInput.id);
    let doc: DocumentItem;
    if (idx >= 0) {
      doc = sanitizeDocument({ ...docs[idx], ...docInput, updatedAt: new Date().toISOString() });
      docs[idx] = doc;
    } else {
      doc = sanitizeDocument({ ...docInput, id: docInput.id || generateUUID() });
      docs.unshift(doc);
    }
    setItem(STORAGE_KEYS.DOCUMENTS, docs);

    nixStorage.awardPoints({
      sourceModule: "Documents",
      sourceEntityType: "DocumentItem",
      sourceEntityId: doc.id,
      action: `Uploaded Document: ${doc.originalFileName}`,
      basePoints: 20,
      idempotencyKey: `doc-${doc.id}`,
    });

    return doc;
  },

  deleteDocument: (id: string): void => {
    const docs = nixStorage.getDocuments().filter((d) => d.id !== id);
    setItem(STORAGE_KEYS.DOCUMENTS, docs);
  },

  // AUTH & USER REPOSITORY
  getUsers: (): User[] => getItem(STORAGE_KEYS.USERS, []),
  getCurrentUser: (): User | null => getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null),

  saveAuthenticatedUser: (user: User): void => {
    // Never persist legacy password fields in browser storage.
    const { passwordHash: _passwordHash, ...safeUser } = user as any;

    const users = nixStorage
      .getUsers()
      .filter(
        (u) =>
          u.id !== safeUser.id &&
          u.id !== "demo-user-1"
      );

    users.unshift(safeUser as User);

    setItem(STORAGE_KEYS.USERS, users);
    setItem(STORAGE_KEYS.CURRENT_USER, safeUser as User);

    migrateLegacyOwnershipInLocalStorage(
      safeUser.id
    );
  },

  purgeLegacyAuthSecrets: (): void => {
    const users = getItem<any[]>(STORAGE_KEYS.USERS, []).map((u) => {
      const { passwordHash, password, ...safe } = u || {};
      return safe;
    });

    setItem(STORAGE_KEYS.USERS, users);

    const current = getItem<any | null>(
      STORAGE_KEYS.CURRENT_USER,
      null
    );

    if (current) {
      const {
        passwordHash,
        password,
        ...safeCurrent
      } = current;

      setItem(
        STORAGE_KEYS.CURRENT_USER,
        safeCurrent
      );
    }
  },

  registerUser: (_input: UserRegistrationInput): { success: boolean; user?: User; error?: string } => {
    return {
      success: false,
      error: "Local password authentication is disabled. Use Supabase Auth.",
    };
  },

  loginUser: (_email: string, _password: string): { success: boolean; user?: User; error?: string } => {
    return {
      success: false,
      error: "Local password authentication is disabled. Use Supabase Auth.",
    };
  },

  logoutUser: (): void => {
    setItem(STORAGE_KEYS.CURRENT_USER, null);
  },

  updateUserProfile: (userId: string, updates: Partial<User>): User | null => {
    const users = nixStorage.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    let updated: User;
    if (idx >= 0) {
      updated = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
      users[idx] = updated;
    } else {
      const current = nixStorage.getCurrentUser();
      updated = { ...(current || DEFAULT_DEMO_USER), ...updates };
    }
    setItem(STORAGE_KEYS.USERS, users);
    setItem(STORAGE_KEYS.CURRENT_USER, updated);
    return updated;
  },

  // Notifications Engine
  getNotifications: (): NotificationItem[] => getItem(STORAGE_KEYS.NOTIFICATIONS, []),
  markNotificationRead: (id: string): void => {
    const list = nixStorage.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  // COMPATIBILITY ALIASES
  deleteCareerRecord: (id: string) => nixStorage.deleteJobApplication(id),
  getCareerRecords: () => nixStorage.getJobApplications(),
  saveCareerRecord: (r: Partial<JobApplication>) => nixStorage.saveJobApplication(r),
  getAuditLogs: () => nixStorage.getAuditEvents(),
  addTransaction: (t: Partial<Transaction>) => nixStorage.saveTransaction(t),
  addPoints: (pts: number, reason?: string) => nixStorage.awardPoints({
    sourceModule: "General",
    sourceEntityType: "System",
    sourceEntityId: generateUUID(),
    action: reason || "Bonus Points",
    basePoints: pts,
    idempotencyKey: `pts-${Date.now()}-${Math.random()}`,
  }),
  getEducationItems: () => nixStorage.getCourses(),
  saveEducationItem: (item: Partial<Course>) => nixStorage.saveCourse(item),
  deleteEducationItem: (id: string) => nixStorage.deleteCourse(id),
  getPointHistory: () => nixStorage.getPointEvents(),

  resetToDemoData: (): void => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      localStorage.setItem("nix_clean_v1", "true");
    }
    setItem(STORAGE_KEYS.CURRENT_USER, null);
    setItem(STORAGE_KEYS.USERS, []);
  },
};

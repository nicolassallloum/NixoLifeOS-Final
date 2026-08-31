// Nix Life OS - Central Type Definitions

export type Priority = "Low" | "Medium" | "High" | "Urgent";

// Tasks
export type TaskStatus = "Planned" | "In Progress" | "Finished";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  projectId?: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  status: TaskStatus;
  points: number;
  taskType?: string;
  tags?: string[];
  estimatedMinutes?: number;
  progress?: number;
  position?: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  archivedAt?: string;
  deletedAt?: string;
  version?: number;
  syncStatus?: "synced" | "pending" | "conflict";
}

// Projects
export type ProjectStatus = "Planned" | "In Progress" | "Finished" | "On Hold";

export interface Project {
  id: string;
  userId: string;
  title: string;
  name?: string;
  description?: string;
  priority: Priority;
  dueDate: string;
  status: ProjectStatus;
  progressPercentage: number; // 0 - 100
  progress?: number;
  health?: string;
  taskCount: number;
  finishedTaskCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
  deletedAt?: string;
  version?: number;
  syncStatus?: string;
}

// Goals
export type GoalCategory = "Finance" | "Health" | "Education" | "Career";
export type GoalStatus = "Planned" | "Active" | "Completed" | "Paused" | "Overdue";

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  createdDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  totalDays: number;
  initialDailyTarget: number;
  currentRequiredDailyTarget: number;
  progressPercentage: number; // 0 - 100
  progress?: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
  deletedAt?: string;
  version?: number;
  syncStatus?: string;
}

export interface GoalProgressLog {
  id: string;
  goalId: string;
  date: string; // YYYY-MM-DD
  completedUnits: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// Habits
export type HabitCategory = "Health" | "Fitness" | "Education" | "Career" | "Finance" | "Personal" | "Productivity" | "Custom";
export type HabitFrequency = "Daily" | "Weekdays" | "Weekends" | "Selected days" | "Every number of days" | "Weekly" | "Monthly" | "Custom";

export interface Habit {
  id: string;
  userId: string;
  title: string;
  name?: string;
  description?: string;
  category: HabitCategory;
  frequencyType: HabitFrequency;
  selectedWeekdays?: number[]; // 0-6 (Sun-Sat)
  targetQuantity: number;
  unit: string;
  reminderTimes?: string[];
  startDate: string;
  endDate?: string;
  color: string;
  icon: string;
  status: "Active" | "Paused" | "Completed" | "Archived";
  notes?: string;
  currentStreak: number;
  longestStreak: number;
  completedDates?: Record<string, number>; // "YYYY-MM-DD": quantity
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  deletedAt?: string;
  version?: number;
  syncStatus?: string;
}

export interface HabitCheckinLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  quantity: number;
  completed: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// Calendar Events
export type CalendarEventCategory = "Personal" | "Task" | "Project" | "Goal" | "Habit" | "Finance" | "Health" | "Education" | "Career" | "Meeting" | "Appointment" | "Custom";
export type CalendarRecurrence = "None" | "Daily" | "Weekly" | "Monthly" | "Yearly" | "Custom";

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  allDay: boolean;
  location?: string;
  eventCategory: CalendarEventCategory;
  color: string;
  timeZone: string;
  recurrence: CalendarRecurrence;
  reminderTimes?: string[];
  notes?: string;
  attachmentIds?: string[];
  linkedEntityType?: string;
  linkedEntityId?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  deletedAt?: string;
  version?: number;
  syncStatus?: string;
}

// Focus Sessions
export type FocusSessionStatus = "Running" | "Paused" | "Finished" | "Cancelled";

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  projectId?: string;
  plannedMinutes: number;
  actualMinutes: number;
  startedAt: string;
  pausedDuration: number;
  completedAt?: string;
  status: FocusSessionStatus;
  note?: string;
  createdAt: string;
}

// Finance
export type AccountType = "Main" | "Save" | "Cash" | "Card" | "Debts";
export type TransactionType = "Income" | "Expense" | "Transfer";

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  initialAmount: number;
  currentBalance: number;
  currency: string;
  color: string;
  icon?: string;
  description?: string;
  active: boolean;
  includeInNetWorth?: boolean;
  // Debt fields when type === "Debts"
  fromWho?: string;
  toWho?: string;
  debtDirection?: "I Owe" | "Owed to Me";
  debtDueDate?: string;
  debtDescription?: string;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
  deletedAt?: string;
  version?: number;
  syncStatus?: string;
}

export interface FinanceCategory {
  id: string;
  userId: string;
  name: string;
  type: "Income" | "Expense";
  color: string;
  icon?: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  transactionType: TransactionType;
  type?: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  category?: string;
  merchant?: string;
  tags?: string[];
  amount: number;
  currency: string;
  transactionDate: string; // YYYY-MM-DD
  transactionTime?: string; // HH:mm
  title: string;
  description?: string;
  notes?: string;
  attachmentIds?: string[];
  createdAt: string;
  updatedAt?: string;
  archivedAt?: string;
  deletedAt?: string;
  version?: number;
  syncStatus?: string;
}

// Health
export type HealthMeasureType = "Weight" | "Blood Pressure" | "Water" | "Sleep" | "Daily Walk" | "Daily Calories";

export interface HealthMeasurement {
  id: string;
  userId: string;
  measureType: HealthMeasureType;
  primaryValue: number;
  secondaryValue?: number; // Diastolic for BP
  unit: string;
  measuredDate: string;
  measuredTime: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MedicationDosageUnit = "mg" | "g" | "mcg" | "ml" | "Tablet" | "Capsule" | "Drop" | "Dose" | "Custom";
export type MedicationForm = "Tablet" | "Capsule" | "Liquid" | "Injection" | "Drops" | "Cream" | "Inhaler" | "Other";
export type MedicationFrequency = "Once daily" | "Twice daily" | "Three times daily" | "Four times daily" | "Selected weekdays" | "Every number of hours" | "Weekly" | "Custom";
export type MedicationFoodInstruction = "Before food" | "With food" | "After food" | "No food instruction" | "Custom";
export type MedicationLogStatus = "Scheduled" | "Taken" | "Skipped" | "Missed" | "Snoozed";

export interface Medication {
  id: string;
  userId: string;
  medicationName: string;
  name?: string;
  dosageValue: string;
  dose?: string;
  strength?: string;
  dosageUnit: MedicationDosageUnit;
  medicationForm: MedicationForm;
  frequencyType: MedicationFrequency;
  timesPerDay?: number;
  selectedWeekdays?: number[];
  scheduleTimes: string[]; // ["08:00", "20:00"]
  startDate: string;
  endDate?: string;
  foodInstruction: MedicationFoodInstruction;
  prescribingDoctor?: string;
  pharmacy?: string;
  reminderEnabled: boolean;
  refillQuantity: number;
  refillThreshold: number;
  notes?: string;
  active: boolean;
  logs?: Record<string, MedicationLogStatus>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  timestampKey: string;
  date: string;
  time: string;
  status: MedicationLogStatus;
  note?: string;
  createdAt: string;
}

// Education & Courses
export type CourseStatus = "Planned" | "In Progress" | "Completed" | "Paused" | "Archived";

export interface Course {
  id: string;
  userId: string;
  courseTitle: string;
  title?: string;
  provider: string;
  institution?: string;
  instructor?: string;
  courseUrl?: string;
  description?: string;
  category: string;
  type?: string;
  status: CourseStatus;
  totalDurationMinutes: number;
  completedMinutes: number;
  startDate?: string;
  dueDate?: string;
  progressPercentage: number;
  progress?: number;
  skillsAcquired?: string[];
  certificateDocumentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseStudySession {
  id: string;
  courseId: string;
  sessionDate: string;
  minutesStudied: number;
  note?: string;
  createdAt: string;
}

// Career
export type WorkModel = "On-site" | "Hybrid" | "Remote";
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Freelance" | "Internship" | "Temporary";
export type JobApplicationStatus = "Saved" | "Preparing" | "Applied" | "Screening" | "Interview" | "Technical Test" | "Final Interview" | "Offer" | "Accepted" | "Rejected" | "Withdrawn";

export interface JobApplication {
  id: string;
  userId: string;
  companyName: string;
  company?: string;
  positionTitle: string;
  title?: string;
  recordType?: string;
  description?: string;
  location?: string;
  workModel?: WorkModel;
  employmentType?: EmploymentType;
  applicationStatus: JobApplicationStatus;
  status?: string;
  compensation?: string;
  applicationDate: string;
  startDate?: string;
  endDate?: string | null;
  isPresent: boolean;
  salaryMinimum?: number;
  salaryMaximum?: number;
  currency: string;
  applicationUrl?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Notes
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  folder?: string;
  favorite?: boolean;
  priority: Priority;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Documents
export interface DocumentItem {
  id: string;
  userId: string;
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  fileSize: number;
  category: string;
  description?: string;
  tags: string[];
  storagePath?: string;
  uploadedAt: string;
  updatedAt?: string;

  // UI / legacy alias properties
  title?: string;
  name?: string;
  fileType?: string;
  sizeBytes?: number;
  expirationDate?: string;
  isSensitive?: boolean;
  notes?: string;
}

export type NixDocument = DocumentItem;
export type DocumentCategory = string;
export type DocumentFileType = string;
export type EducationItem = Course;
export type EducationType = string;
export type EducationStatus = CourseStatus;
export type CareerRecord = JobApplication;
export type CareerRecordType = string;
export type CareerStatus = JobApplicationStatus;
export type AuditLogEvent = AuditEvent;

// Points & Gamification
export interface PointLevel {
  level: number;
  name: string;
  minPoints: number;
}

export interface PointEvent {
  id: string;
  userId: string;
  sourceModule: string;
  sourceEntityType: string;
  sourceEntityId: string;
  action: string;
  reason?: string;
  basePoints: number;
  bonusPoints?: number;
  totalPoints: number;
  pointsChange?: number;
  idempotencyKey: string;
  createdAt: string;
  timestamp?: string;
  reversedAt?: string;
  reversalReason?: string;
}

export interface UserPointProfile {
  totalPoints: number;
  currentPoints?: number;
  currentLevel: number;
  levelName: string;
  pointsToNextLevel: number;
  dailyStreak: number;
  badges: { id: string; name: string; icon: string; description: string; unlockedAt?: string }[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  module: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AutomationRule {
  id: string;
  userId: string;
  name: string;
  trigger: string;
  condition?: string;
  action: string;
  active: boolean;
  lastRunAt?: string;
}

export interface AuditEvent {
  id: string;
  userId: string;
  module: string;
  entityType: string;
  entityId: string;
  action: string;
  previousSummary?: string;
  newSummary?: string;
  timestamp: string;
  source: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  locale: "en" | "ar";
  currency: string;
  workWeekStart: "Monday" | "Sunday";
  workingHoursStart: string;
  workingHoursEnd: string;
  copilotEnabled: boolean;
  copilotPermissions: {
    tasks: "Suggest & Execute" | "Suggest Only" | "No Access";
    finance: "Suggest Only" | "No Access";
    health: "Suggest Only" | "No Access";
  };
  enabledModules: Record<string, boolean>;
  dashboardWidgets: string[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  timezone: string;
  preferredLanguage: string;
  ageConfirmed: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;

  displayName?: string;
  profilePhoto?: string;
  phoneNumber?: string;
  referralCode?: string;
  invitationCode?: string;
  productUpdateConsent?: boolean;
  marketingConsent?: boolean;
  analyticsConsent?: boolean;

  passwordHash?: string;
  createdAt: string;
  lastLoginAt: string;
  updatedAt?: string;
}

export interface UserRegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  timezone: string;
  preferredLanguage: string;
  ageConfirmed: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;

  displayName?: string;
  profilePhoto?: string;
  phoneNumber?: string;
  referralCode?: string;
  invitationCode?: string;
  productUpdateConsent?: boolean;
  marketingConsent?: boolean;
  analyticsConsent?: boolean;
}



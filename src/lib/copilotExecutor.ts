import { nixStorage } from "./storage";
import { Priority, TaskStatus, ProjectStatus, GoalCategory, HealthMeasureType } from "../types";

export interface CopilotProposal {
  type:
    | "expense"
    | "income"
    | "finance"
    | "medication"
    | "health"
    | "focus"
    | "project"
    | "task"
    | "goal"
    | "habit"
    | "note"
    | "study"
    | "career";
  title?: string;
  name?: string;
  description?: string;
  content?: string;
  amount?: number;
  currency?: string;
  category?: string;
  account?: string;
  merchant?: string;
  source?: string;
  date?: string;
  dueDate?: string;
  priority?: Priority;
  status?: string;
  estimatedMinutes?: number;
  minutes?: number;
  topic?: string;
  medicationName?: string;
  dose?: string;
  measureType?: HealthMeasureType | string;
  primaryValue?: number;
  secondaryValue?: number;
  unit?: string;
  targetValue?: number;
  habitName?: string;
  quantity?: number;
  courseTitle?: string;
  companyName?: string;
  positionTitle?: string;
  salary?: number | string;
  location?: string;
  confidence?: number;
  note?: string;
  folder?: string;
  tags?: string[];
}

export interface CopilotExecutionResult {
  success: boolean;
  message: string;
  targetModule: string;
  createdEntityId?: string;
  details?: Record<string, any>;
}

export function executeCopilotProposal(proposal: CopilotProposal, rawPrompt?: string): CopilotExecutionResult {
  const todayStr = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);
  const nowIso = new Date().toISOString();

  const type = (proposal.type || "task").toLowerCase();

  // 1. FINANCE: EXPENSE
  if (type === "expense" || (type === "finance" && (proposal.amount || 0) >= 0 && !rawPrompt?.toLowerCase().includes("income") && !rawPrompt?.toLowerCase().includes("salary") && !rawPrompt?.toLowerCase().includes("deposit"))) {
    const accounts = nixStorage.getAccounts();
    const categories = nixStorage.getFinanceCategories();

    // Match or pick default account
    let targetAccount = accounts[0];
    if (proposal.account) {
      const match = accounts.find((a) => a.name.toLowerCase().includes(proposal.account!.toLowerCase()));
      if (match) targetAccount = match;
    }

    // Match or pick default category
    let targetCatId = categories.find((c) => c.type === "Expense")?.id;
    if (proposal.category) {
      const catMatch = categories.find((c) => c.name.toLowerCase().includes(proposal.category!.toLowerCase()));
      if (catMatch) targetCatId = catMatch.id;
    }

    const tx = nixStorage.saveTransaction({
      transactionType: "Expense",
      title: proposal.title || proposal.merchant || proposal.description || "Expense",
      merchant: proposal.merchant || proposal.title || "Vendor",
      amount: Math.abs(proposal.amount || 0) || 10,
      currency: proposal.currency || targetAccount?.currency || "USD",
      accountId: targetAccount?.id || "acc-main",
      categoryId: targetCatId,
      transactionDate: proposal.date || todayStr,
      transactionTime: nowTime,
      description: proposal.description || proposal.note || `Logged via Nix Copilot: ${rawPrompt || ""}`,
      tags: ["Copilot", "Expense"],
    });

    return {
      success: true,
      message: `Recorded expense of $${tx.amount.toFixed(2)} for "${tx.title}" in ${targetAccount ? targetAccount.name : "Main Account"}.`,
      targetModule: "finance",
      createdEntityId: tx.id,
      details: tx,
    };
  }

  // 2. FINANCE: INCOME
  if (type === "income" || (type === "finance" && (rawPrompt?.toLowerCase().includes("income") || rawPrompt?.toLowerCase().includes("salary") || rawPrompt?.toLowerCase().includes("deposit") || rawPrompt?.toLowerCase().includes("earned")))) {
    const accounts = nixStorage.getAccounts();
    const categories = nixStorage.getFinanceCategories();

    let targetAccount = accounts[0];
    if (proposal.account) {
      const match = accounts.find((a) => a.name.toLowerCase().includes(proposal.account!.toLowerCase()));
      if (match) targetAccount = match;
    }

    let targetCatId = categories.find((c) => c.type === "Income")?.id;
    if (proposal.category) {
      const catMatch = categories.find((c) => c.name.toLowerCase().includes(proposal.category!.toLowerCase()));
      if (catMatch) targetCatId = catMatch.id;
    }

    const tx = nixStorage.saveTransaction({
      transactionType: "Income",
      title: proposal.title || proposal.source || proposal.merchant || "Income",
      merchant: proposal.source || proposal.merchant || "Income Source",
      amount: Math.abs(proposal.amount || 0) || 50,
      currency: proposal.currency || targetAccount?.currency || "USD",
      accountId: targetAccount?.id || "acc-main",
      categoryId: targetCatId,
      transactionDate: proposal.date || todayStr,
      transactionTime: nowTime,
      description: proposal.description || proposal.note || `Logged via Nix Copilot: ${rawPrompt || ""}`,
      tags: ["Copilot", "Income"],
    });

    return {
      success: true,
      message: `Recorded income of $${tx.amount.toFixed(2)} ("${tx.title}") to ${targetAccount ? targetAccount.name : "Main Account"}.`,
      targetModule: "finance",
      createdEntityId: tx.id,
      details: tx,
    };
  }

  // 3. HEALTH: MEDICATION INTAKE
  if (type === "medication" || (type === "health" && (rawPrompt?.toLowerCase().includes("medication") || rawPrompt?.toLowerCase().includes("pill") || rawPrompt?.toLowerCase().includes("medicine") || rawPrompt?.toLowerCase().includes("dose") || rawPrompt?.toLowerCase().includes("take") || rawPrompt?.toLowerCase().includes("took")))) {
    const medName = proposal.medicationName || proposal.title || proposal.name || "Daily Medication";
    const medications = nixStorage.getMedications();

    // Try finding existing medication by fuzzy name
    let med = medications.find((m) => m.medicationName.toLowerCase().includes(medName.toLowerCase()) || medName.toLowerCase().includes(m.medicationName.toLowerCase()));

    if (!med) {
      // Create medication if not found
      med = nixStorage.saveMedication({
        medicationName: medName,
        dosageValue: proposal.dose || "1",
        dosageUnit: "Tablet",
        medicationForm: "Tablet",
        frequencyType: "Once daily",
        foodInstruction: "With food",
        refillQuantity: 30,
        refillThreshold: 5,
        scheduleTimes: ["08:00"],
      });
    }

    const timestampKey = `${todayStr} ${nowTime}`;
    nixStorage.logMedicationStatus(med.id, timestampKey, "Taken");

    return {
      success: true,
      message: `Logged medication "${med.medicationName}" as TAKEN today at ${nowTime}. Refill supply updated to ${Math.max(0, med.refillQuantity - 1)} units.`,
      targetModule: "health",
      createdEntityId: med.id,
      details: { medication: med, timestampKey, status: "Taken" },
    };
  }

  // 4. HEALTH: VITALS / MEASUREMENTS
  if (type === "health") {
    let mType: HealthMeasureType = "Weight";
    let unit = proposal.unit || "kg";
    let primaryVal = proposal.primaryValue || proposal.amount || 0;
    let secondaryVal = proposal.secondaryValue;

    const lowerPrompt = (rawPrompt || "").toLowerCase();
    if (lowerPrompt.includes("blood pressure") || lowerPrompt.includes("bp") || proposal.measureType?.toString().toLowerCase().includes("pressure")) {
      mType = "Blood Pressure";
      unit = "mmHg";
      if (!primaryVal) primaryVal = 120;
      if (!secondaryVal) secondaryVal = 80;
    } else if (lowerPrompt.includes("water") || proposal.measureType?.toString().toLowerCase().includes("water")) {
      mType = "Water";
      unit = "ml";
      if (!primaryVal) primaryVal = 500;
    } else if (lowerPrompt.includes("sleep") || proposal.measureType?.toString().toLowerCase().includes("sleep")) {
      mType = "Sleep";
      unit = "hours";
      if (!primaryVal) primaryVal = 8;
    } else if (lowerPrompt.includes("walk") || lowerPrompt.includes("step") || proposal.measureType?.toString().toLowerCase().includes("walk")) {
      mType = "Daily Walk";
      unit = "steps";
      if (!primaryVal) primaryVal = 6000;
    } else if (lowerPrompt.includes("calorie") || proposal.measureType?.toString().toLowerCase().includes("calorie")) {
      mType = "Daily Calories";
      unit = "kcal";
      if (!primaryVal) primaryVal = 2000;
    }

    const meas = nixStorage.saveHealthMeasurement({
      measureType: mType,
      primaryValue: primaryVal,
      secondaryValue: secondaryVal,
      unit: unit,
      measuredDate: proposal.date || todayStr,
      measuredTime: nowTime,
      note: proposal.note || proposal.description || `Logged via Nix Copilot: ${rawPrompt || ""}`,
    });

    return {
      success: true,
      message: `Recorded ${meas.measureType} measurement: ${meas.primaryValue}${meas.secondaryValue ? "/" + meas.secondaryValue : ""} ${meas.unit}.`,
      targetModule: "health",
      createdEntityId: meas.id,
      details: meas,
    };
  }

  // 5. FOCUS TIMER
  if (type === "focus" || (rawPrompt?.toLowerCase().includes("focus") || rawPrompt?.toLowerCase().includes("pomodoro") || rawPrompt?.toLowerCase().includes("timer") || rawPrompt?.toLowerCase().includes("sprint"))) {
    const mins = proposal.minutes || proposal.estimatedMinutes || 25;
    const topic = proposal.topic || proposal.title || "Deep Work Sprint";

    const session = nixStorage.saveFocusSession({
      plannedMinutes: mins,
      actualMinutes: 0,
      startedAt: nowIso,
      status: "Running",
      note: `Focus Session on: ${topic}`,
    });

    // Dispatch global start focus event for FocusView
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nix-start-focus", {
          detail: {
            plannedMinutes: mins,
            topic: topic,
            sessionId: session.id,
          },
        })
      );
    }

    return {
      success: true,
      message: `Started ${mins}-minute Focus Sprint on "${topic}". Timer is actively running!`,
      targetModule: "focus",
      createdEntityId: session.id,
      details: session,
    };
  }

  // 6. PROJECTS
  if (type === "project" || rawPrompt?.toLowerCase().startsWith("create project") || rawPrompt?.toLowerCase().startsWith("new project")) {
    const projTitle = proposal.title || proposal.name || "New Project";
    const proj = nixStorage.saveProject({
      title: projTitle,
      description: proposal.description || `Project initialized via Nix Copilot`,
      priority: proposal.priority || "Medium",
      status: "Planned",
      dueDate: proposal.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    });

    return {
      success: true,
      message: `Created project "${proj.title}" with priority ${proj.priority} and due date ${proj.dueDate}.`,
      targetModule: "projects",
      createdEntityId: proj.id,
      details: proj,
    };
  }

  // 7. GOALS
  if (type === "goal" || rawPrompt?.toLowerCase().includes("set goal") || rawPrompt?.toLowerCase().includes("new goal")) {
    let cat: GoalCategory = "Personal" as any;
    if (proposal.category && ["Finance", "Health", "Education", "Career"].includes(proposal.category)) {
      cat = proposal.category as GoalCategory;
    } else {
      const lower = (rawPrompt || "").toLowerCase();
      if (lower.includes("money") || lower.includes("save") || lower.includes("$")) cat = "Finance";
      else if (lower.includes("health") || lower.includes("weight") || lower.includes("run")) cat = "Health";
      else if (lower.includes("learn") || lower.includes("course") || lower.includes("study")) cat = "Education";
      else if (lower.includes("job") || lower.includes("career") || lower.includes("work")) cat = "Career";
      else cat = "Finance";
    }

    const goal = nixStorage.saveGoal({
      title: proposal.title || "New Goal",
      description: proposal.description || "Goal created via Nix Copilot",
      category: cat,
      targetValue: proposal.targetValue || proposal.amount || 100,
      currentValue: 0,
      unit: proposal.unit || "units",
      dueDate: proposal.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      status: "Active",
    });

    return {
      success: true,
      message: `Created ${goal.category} goal "${goal.title}" (Target: ${goal.targetValue} ${goal.unit}).`,
      targetModule: "goals",
      createdEntityId: goal.id,
      details: goal,
    };
  }

  // 8. HABITS
  if (type === "habit" || rawPrompt?.toLowerCase().includes("habit")) {
    const habitName = proposal.habitName || proposal.title || proposal.name || "Daily Habit";
    const habits = nixStorage.getHabits();
    const existing = habits.find((h) => h.title.toLowerCase().includes(habitName.toLowerCase()));

    if (existing) {
      nixStorage.toggleHabitCheckin(existing.id, todayStr, proposal.note || "Checked in via Nix Copilot");
      return {
        success: true,
        message: `Checked in habit "${existing.title}". Streak is now ${existing.currentStreak + 1} days!`,
        targetModule: "habits",
        createdEntityId: existing.id,
        details: existing,
      };
    } else {
      const newHabit = nixStorage.saveHabit({
        title: habitName,
        category: "Productivity",
        frequencyType: "Daily",
        targetQuantity: proposal.quantity || 1,
        unit: proposal.unit || "times",
        color: "#06B6D4",
        icon: "Repeat",
        status: "Active",
        startDate: todayStr,
      });
      nixStorage.toggleHabitCheckin(newHabit.id, todayStr, "Initial checkin via Nix Copilot");
      return {
        success: true,
        message: `Created and checked in habit "${newHabit.title}".`,
        targetModule: "habits",
        createdEntityId: newHabit.id,
        details: newHabit,
      };
    }
  }

  // 9. NOTES
  if (type === "note" || rawPrompt?.toLowerCase().includes("note")) {
    const note = nixStorage.saveNote({
      title: proposal.title || "Quick Note",
      content: proposal.content || proposal.description || rawPrompt || "Note created with Nix Copilot",
      folder: proposal.folder || "General",
      tags: proposal.tags || ["Copilot"],
      priority: proposal.priority || "Medium",
      pinned: false,
      archived: false,
    });

    return {
      success: true,
      message: `Saved note "${note.title}".`,
      targetModule: "notes",
      createdEntityId: note.id,
      details: note,
    };
  }

  // 10. EDUCATION / STUDY
  if (type === "study" || rawPrompt?.toLowerCase().includes("study") || rawPrompt?.toLowerCase().includes("course")) {
    const courses = nixStorage.getCourses();
    const courseTitle = proposal.courseTitle || proposal.title || (courses[0]?.courseTitle ?? "General Learning");
    let course = courses.find((c) => c.courseTitle.toLowerCase().includes(courseTitle.toLowerCase()));

    if (!course) {
      course = nixStorage.saveCourse({
        courseTitle: courseTitle,
        provider: "Self-paced",
        status: "In Progress",
        totalDurationMinutes: 300,
        completedMinutes: 0,
      });
    }

    const minutes = proposal.minutes || 30;
    nixStorage.logStudySession(course.id, minutes, proposal.note || `Logged study via Nix Copilot`);

    return {
      success: true,
      message: `Logged ${minutes} minutes of study for course "${course.courseTitle}".`,
      targetModule: "education",
      createdEntityId: course.id,
      details: { course, minutes },
    };
  }

  // 11. CAREER / JOB APPLICATION
  if (type === "career" || rawPrompt?.toLowerCase().includes("job application") || rawPrompt?.toLowerCase().includes("applied to")) {
    const app = nixStorage.saveJobApplication({
      companyName: proposal.companyName || proposal.title || "Target Company",
      positionTitle: proposal.positionTitle || "Software Engineer",
      applicationStatus: (proposal.status as any) || "Applied",
      location: proposal.location || "Remote",
      applicationDate: todayStr,
      currency: "USD",
      isPresent: false,
    });

    return {
      success: true,
      message: `Added job application: ${app.positionTitle} at ${app.companyName} (${app.applicationStatus}).`,
      targetModule: "career",
      createdEntityId: app.id,
      details: app,
    };
  }

  // DEFAULT: TASKS
  const task = nixStorage.saveTask({
    title: proposal.title || rawPrompt || "New Task",
    description: proposal.description || `Created via Nix Copilot`,
    taskType: "Daily",
    status: "Planned",
    priority: proposal.priority || "Medium",
    dueDate: proposal.dueDate || todayStr,
    estimatedMinutes: proposal.estimatedMinutes || 30,
    points: 25,
    progress: 0,
    position: 0,
    tags: proposal.tags || ["Copilot"],
  });

  return {
    success: true,
    message: `Created task "${task.title}" with priority ${task.priority} (due ${task.dueDate}).`,
    targetModule: "tasks",
    createdEntityId: task.id,
    details: task,
  };
}

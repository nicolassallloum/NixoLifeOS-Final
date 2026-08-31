import React, { useState } from "react";
import { NixAppShell } from "./components/layout/NixLayout";
import { DashboardView } from "./components/views/DashboardView";
import { MyDayView } from "./components/views/MyDayView";
import { TasksView } from "./components/views/TasksView";
import { FinanceView } from "./components/views/FinanceView";
import { HealthView } from "./components/views/HealthView";
import { CopilotView } from "./components/views/CopilotView";
import {
  ProjectsView,
  GoalsView,
  HabitsView,
  CalendarView,
  FocusView,
  NotesView,
  PointsRewardsView,
  SettingsView,
  EducationView,
  CareerView,
  DocumentsView,
  ReportsView,
  AutomationsView,
  AuditView,
  RecycleBinView,
  NotificationsView,
} from "./components/views/OtherViews";

export default function App() {
  const [currentRoute, setCurrentRoute] = useState("dashboard");

  const renderRouteView = () => {
    switch (currentRoute) {
      case "dashboard":
        return <DashboardView onRouteChange={setCurrentRoute} />;
      case "my-day":
        return <MyDayView onRouteChange={setCurrentRoute} />;
      case "tasks":
        return <TasksView />;
      case "projects":
        return <ProjectsView />;
      case "goals":
        return <GoalsView />;
      case "habits":
        return <HabitsView />;
      case "calendar":
        return <CalendarView />;
      case "focus":
        return <FocusView />;
      case "finance":
        return <FinanceView />;
      case "health":
        return <HealthView />;
      case "education":
        return <EducationView />;
      case "career":
        return <CareerView />;
      case "notes":
        return <NotesView />;
      case "documents":
        return <DocumentsView />;
      case "reports":
        return <ReportsView />;
      case "points":
        return <PointsRewardsView />;
      case "copilot":
        return <CopilotView />;
      case "automations":
        return <AutomationsView />;
      case "audit":
        return <AuditView />;
      case "recycle-bin":
        return <RecycleBinView />;
      case "notifications":
        return <NotificationsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView onRouteChange={setCurrentRoute} />;
    }
  };

  return (
    <NixAppShell currentRoute={currentRoute} onRouteChange={setCurrentRoute}>
      {renderRouteView()}
    </NixAppShell>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { OrganizationProvider } from "@/context/OrganizationContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardLayout from "@/components/layout/DashboardLayout"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import DashboardPage from "@/pages/DashboardPage"
import ProjectsPage from "@/pages/ProjectsPage"
import ProjectDetailPage from "@/pages/ProjectDetailPage"
import TeamsPage from "@/pages/TeamsPage"
import ReportsPage from "@/pages/ReportsPage"
import OrganizationPage from "@/pages/OrganizationPage"
import SettingsPage from "@/pages/SettingsPage"

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <OrganizationProvider>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/organization" element={<OrganizationPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </OrganizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
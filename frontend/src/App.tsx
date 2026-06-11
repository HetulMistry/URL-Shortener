import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/UseAuth";
import { ToastProvider } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/components/ui/shared/ProtectedRoute";
import { DashboardLayout } from "@/components/ui/shared/DashboardLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { DashboardOverview } from "@/pages/dashboard/DashboardOverview";
import { UrlManagementPage } from "@/pages/dashboard/UrlManagementPage";
import { UrlDetailsPage } from "@/pages/dashboard/UrlDetailsPage";
import { SettingsPage } from "@/pages/dashboard/SettingsPage";
import { RedirectPage } from "@/pages/RedirectPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardOverview />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/urls"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <UrlManagementPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/urls/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <UrlDetailsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SettingsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/:shortCode" element={<RedirectPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

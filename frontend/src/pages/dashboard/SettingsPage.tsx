import { useNavigate } from "react-router-dom";
import { User, LogOut, FileText, Stethoscope, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { getBackendOrigin } from "@/lib/config";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const backendOrigin = getBackendOrigin();

  const handleLogout = async () => {
    await logout();
    addToast("Logged out successfully", "success");
    navigate("/auth/login");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-space-grotesk tracking-tight">
          Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your account configurations and view external resources.
        </p>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Account Information</CardTitle>
            <CardDescription>
              Details about your current active session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-black/20 border border-white/4 transition-all">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/25 rounded-lg text-indigo-400">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Account Name
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {user?.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-black/20 border border-white/4 transition-all">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/25 rounded-lg text-cyan-400">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Developer Integrations</CardTitle>
            <CardDescription>
              Connect URL Shortener features into your external scripts and
              projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/1 border border-white/4">
              <div>
                <p className="text-sm font-bold text-white">Swagger API Docs</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Explore standard endpoints, authentication headers, and
                  models.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 w-full sm:w-auto"
                onClick={() =>
                  window.open(`${backendOrigin}/api/v1/docs`, "_blank")
                }
              >
                <FileText className="w-4 h-4" />
                View Swagger Docs
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/1 border border-white/4">
              <div>
                <p className="text-sm font-bold text-white">
                  Console System Status
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Check service responses, Postgres connectivity, and health
                  states.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 w-full sm:w-auto"
                onClick={() => window.open(`${backendOrigin}/health`, "_blank")}
              >
                <Stethoscope className="w-4 h-4" />
                Check System Health
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 shadow-red-500/1">
          <CardHeader>
            <CardTitle className="text-xl text-red-400">Danger Zone</CardTitle>
            <CardDescription>
              Sign out from the account console.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="lg"
              className="flex items-center justify-center gap-2 w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

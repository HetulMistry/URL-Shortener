import { useNavigate } from "react-router-dom";
import { User, LogOut, FileText, Stethoscope } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">
          Manage your account and preferences
        </p>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Name</p>
                <p className="text-white font-medium">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-400 uppercase">Email</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Learn how to use the URL Shortener API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() =>
                window.open(`${backendOrigin}/api/v1/docs`, "_blank")
              }
            >
              <FileText className="w-4 h-4" />
              View API Documentation
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Health Status</CardTitle>
            <CardDescription>Check the system status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => window.open(`${backendOrigin}/health`, "_blank")}
            >
              <Stethoscope className="w-4 h-4" />
              Check Health Status
            </Button>
          </CardContent>
        </Card>
        <Card className="border-red-700/30">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="lg"
              className="flex items-center gap-2 w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

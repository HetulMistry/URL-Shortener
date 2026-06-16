import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { validateEmail, validateLoginPassword } from "@/lib/auth-validation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { DotGridBackground } from "@/components/ui/shared/DotGridBackground";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validateLoginPassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError ?? undefined,
        password: passwordError ?? undefined,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await login(email.trim(), password);
      addToast("Login successful!", "success");
      navigate("/dashboard");
    } catch (error: unknown) {
      addToast(getApiErrorMessage(error, "Login failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <DotGridBackground />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-4 shadow-lg shadow-indigo-500/5 backdrop-blur-xs">
            <LinkIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 font-space-grotesk">
            SwiftLink
          </h1>
          <p className="text-gray-400 text-sm max-w-xs">
            Modern URL shortening with state-of-the-art analytics.
          </p>
        </div>
        <Card className="shadow-2xl shadow-indigo-500/3">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email Address"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                disabled={loading}
                icon={<Mail className="w-4 h-4 text-gray-400" />}
              />
              <Input
                label="Password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                disabled={loading}
                icon={<Lock className="w-4 h-4 text-gray-400" />}
              />
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/auth/register"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

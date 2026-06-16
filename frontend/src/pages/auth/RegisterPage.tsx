import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  validateEmail,
  validateRegisterName,
  validateRegisterPassword,
  validateConfirmPassword,
} from "@/lib/auth-validation";
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

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { register } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateRegisterName(name);
    const emailError = validateEmail(email);
    const passwordError = validateRegisterPassword(password);
    const confirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword,
    );

    if (nameError || emailError || passwordError || confirmPasswordError) {
      setErrors({
        name: nameError ?? undefined,
        email: emailError ?? undefined,
        password: passwordError ?? undefined,
        confirmPassword: confirmPasswordError ?? undefined,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      addToast("Account created successfully!", "success");
      navigate("/dashboard");
    } catch (error: unknown) {
      addToast(getApiErrorMessage(error, "Registration failed"), "error");
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
            Create an account to start shortening links and tracking detailed
            analytics.
          </p>
        </div>
        <Card className="shadow-2xl shadow-indigo-500/3">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Full Name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                disabled={loading}
                icon={<User className="w-4 h-4 text-gray-400" />}
              />
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
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                disabled={loading}
                icon={<Lock className="w-4 h-4 text-gray-400" />}
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
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
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <Link
                  to="/auth/login"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

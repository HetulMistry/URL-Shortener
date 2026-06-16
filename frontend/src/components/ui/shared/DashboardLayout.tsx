import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  Settings,
  Home,
  Link as LinkIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { DotGridBackground } from "@/components/ui/shared/DotGridBackground";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: Home },
    { label: "URL Management", href: "/dashboard/urls", icon: LinkIcon },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <div className="relative flex h-screen text-white overflow-hidden bg-[#0a0a10]">
      <DotGridBackground />
      <aside
        className={`fixed md:relative w-64 bg-[#0e0f14]/80 backdrop-blur-2xl border-r border-white/6 flex flex-col z-40 h-screen transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/6 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <LinkIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-linear-to-r from-white via-white to-gray-400 bg-clip-text text-transparent font-space-grotesk">
              SwiftLink
            </h1>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
              Console
            </p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/4"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${active ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/6 space-y-2 bg-black/15">
          <div className="px-4 py-2 bg-white/2 border border-white/4 rounded-xl mb-2">
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
              Logged in as
            </p>
            <p className="text-sm font-bold text-white truncate mt-0.5">
              {user?.name || user?.email?.split("@")[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/15 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          />
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="bg-[#0e0f14]/40 backdrop-blur-md border-b border-white/6 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-white/5 border border-white/8 rounded-xl transition-all"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-300" />
            )}
          </button>
          <div className="hidden md:block">
            <p className="text-xs text-gray-500 font-medium">
              Console Overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              Welcome,{" "}
              <span className="font-semibold text-white">
                {user?.name || user?.email?.split("@")[0]}
              </span>
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

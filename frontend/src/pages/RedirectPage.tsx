import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  getBackendOrigin,
  SHORT_CODE_PATTERN,
  RESERVED_SHORT_CODES,
} from "@/lib/config";
import { DotGridBackground } from "@/components/ui/shared/DotGridBackground";

export function RedirectPage() {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!shortCode) return;

    const normalized = shortCode.toLowerCase();

    if (
      !SHORT_CODE_PATTERN.test(shortCode) ||
      RESERVED_SHORT_CODES.has(normalized)
    ) {
      navigate("/dashboard", { replace: true });
      return;
    }

    window.location.replace(`${getBackendOrigin()}/${shortCode}`);
  }, [shortCode, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden bg-[#0a0a10]">
      <DotGridBackground />
      <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-sm">
        <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/25 mb-4 shadow-lg shadow-indigo-500/10">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-white font-space-grotesk tracking-tight">
          Redirecting
        </h3>
        <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
          Please wait while we route you safely to your shortened destination...
        </p>
      </div>
    </div>
  );
}

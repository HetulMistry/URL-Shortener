import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBackendOrigin,
  SHORT_CODE_PATTERN,
  RESERVED_SHORT_CODES,
} from "@/lib/config";

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
    <div className="min-h-screen bg-section-shell flex items-center justify-center text-white">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400">Redirecting to your destination...</p>
      </div>
    </div>
  );
}

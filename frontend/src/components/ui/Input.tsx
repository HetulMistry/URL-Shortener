import React from "react";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = "text", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider pl-0.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={clsx(
              "bg-black/30 border border-white/8 rounded-lg w-full py-2.5 text-sm text-white placeholder:text-gray-500 transition-all duration-200",
              icon ? "pl-10 pr-4" : "px-4",
              "focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25",
              "disabled:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed",
              error &&
                "border-red-500/50 focus:border-red-500 focus:ring-red-500/25",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-red-400 mt-1 pl-0.5">{error}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

import { clsx } from "clsx";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "error" | "warning" | "info";
}

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-gray-700 text-gray-100",
    success: "bg-green-900/30 text-green-300 border border-green-700/50",
    error: "bg-red-900/30 text-red-300 border border-red-700/50",
    warning: "bg-yellow-900/30 text-yellow-300 border border-yellow-700/50",
    info: "bg-blue-900/30 text-blue-300 border border-blue-700/50",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

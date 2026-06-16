import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/35 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:via-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/35 border border-indigo-400/20 hover:scale-[1.01]",
        outline:
          "border border-white/[0.08] bg-white/[0.02] text-gray-300 hover:bg-white/[0.06] hover:text-white hover:border-white/[0.15] hover:scale-[1.01]",
        secondary:
          "bg-white/[0.06] text-white border border-white/[0.05] hover:bg-white/[0.1] hover:border-white/[0.1]",
        ghost:
          "text-gray-400 hover:text-white hover:bg-white/[0.05]",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300",
        link: "text-indigo-400 underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-2 px-4 rounded-lg",
        xs: "h-6 gap-1 rounded-[6px] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-[8px] px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-5 rounded-lg text-base",
        icon: "size-9 rounded-lg",
        "icon-xs":
          "size-6 rounded-[6px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[8px]",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

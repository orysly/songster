import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-lemon text-ink shadow-glow hover:-translate-y-0.5 active:translate-y-0",
  secondary: "bg-white/12 text-white ring-1 ring-white/20 hover:bg-white/18",
  ghost: "bg-transparent text-white/80 ring-1 ring-white/15 hover:bg-white/10",
  danger: "bg-coral text-white shadow-glow hover:-translate-y-0.5"
};

export function Button({ children, variant = "primary", icon, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

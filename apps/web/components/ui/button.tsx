import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "lg" | "icon";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-base font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50",
        size === "default" && "min-h-12 px-5",
        size === "lg" && "min-h-14 px-6 text-lg",
        size === "icon" && "size-12",
        variant === "default" &&
          "bg-primary text-primary-foreground shadow-button hover:bg-primary/90 hover:shadow-button-hover",
        variant === "secondary" &&
          "bg-secondary text-secondary-foreground shadow-button hover:bg-secondary/80 hover:shadow-button-hover",
        variant === "outline" &&
          "border border-border bg-transparent shadow-button-outline hover:bg-accent/50",
        variant === "ghost" && "hover:bg-muted",
        variant === "destructive" &&
          "bg-destructive text-destructive-foreground shadow-button hover:bg-destructive/90 hover:shadow-button-hover",
        className
      )}
      {...props}
    />
  );
}

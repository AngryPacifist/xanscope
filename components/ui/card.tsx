import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(15,23,42,0.45)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

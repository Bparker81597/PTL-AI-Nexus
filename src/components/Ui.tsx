import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import {
  GlassPanel,
  PageHeader as PtlPageHeader,
  PtlButton,
  PtlField,
  PtlInput,
  PtlSelect,
  PtlTextarea,
  StatusBadge as PtlStatusBadge,
} from "./ptl";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <PtlPageHeader eyebrow={eyebrow} title={title}>{children}</PtlPageHeader>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <GlassPanel className={className}>{children}</GlassPanel>;
}

export function Button({
  children,
  type = "button",
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <PtlButton type={type} onClick={onClick} variant={variant === "danger" ? "danger" : variant}>
      {children}
    </PtlButton>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <PtlField label={label}>{children}</PtlField>;
}

export const inputClass =
  "focus-ring min-h-11 rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.055] px-3 text-sm text-white placeholder:text-[color:var(--ptl-text-muted)]";
export const textareaClass =
  "focus-ring min-h-28 rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.055] p-3 text-sm text-white placeholder:text-[color:var(--ptl-text-muted)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <PtlInput {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <PtlTextarea {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <PtlSelect {...props} />;
}

export function StatusBadge({ status }: { status: string }) {
  return <PtlStatusBadge status={status} />;
}

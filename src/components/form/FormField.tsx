import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
}

export default function FormField({
  label,
  icon: Icon,
  id,
  className,
  ...inputProps
}: FormFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <div className="input-glow group flex min-h-[48px] items-center gap-2.5 rounded-lg border border-border bg-surface-light px-3 py-3 transition-[border-color,box-shadow] duration-300 ease-out focus-within:border-indigo-400/50 md:min-h-0 md:py-2.5">
        <Icon
          className="h-4 w-4 shrink-0 text-slate-500 transition-colors duration-300 group-focus-within:text-neon"
          aria-hidden="true"
        />
        <input
          id={id}
          className={`w-full bg-transparent text-base text-slate-100 placeholder:text-slate-500 focus:outline-none md:text-sm ${className ?? ""}`}
          {...inputProps}
        />
      </div>
    </label>
  );
}

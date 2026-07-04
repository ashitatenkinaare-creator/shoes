"use client";

interface SelectChipGroupProps {
  label: string;
  description?: string;
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  formatOption?: (value: string) => string;
}

export default function SelectChipGroup({
  label,
  description,
  options,
  selected,
  onChange,
  formatOption = (value) => value,
}: SelectChipGroupProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  };

  return (
    <fieldset>
      <legend className="text-sm font-bold text-white">{label}</legend>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(option)}
              className={`btn-press min-h-[40px] rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-radar-accent bg-radar-accent/15 text-radar-accent"
                  : "border-radar-border bg-radar-surface text-slate-400 hover:border-slate-500 hover:text-white"
              }`}
            >
              {formatOption(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

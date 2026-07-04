interface NotifySwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export default function NotifySwitch({ checked, onChange, label }: NotifySwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors md:h-6 md:w-11 ${
        checked ? "bg-indigo-500 shadow-sm shadow-indigo-500/40" : "bg-slate-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform md:h-4 md:w-4 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

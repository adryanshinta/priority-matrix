// ==========================================
// COMPONENT: CheckControl
// Kontrol centang kustom dengan animasi pop.
// Memakai role="checkbox" agar tetap aksesibel (keyboard & screen reader).
// ==========================================

import { CheckIcon } from "./Icons";

export default function CheckControl({ checked, onToggle, label, size = "md" }) {
  // Ukuran kontrol: sm untuk tampilan padat (list/grid), md untuk form
  const boxClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`grid place-items-center ${boxClass} shrink-0 rounded-md border-2 transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-slate-900 active:scale-90
        ${
          checked
            ? "bg-sage-500 border-sage-500 text-white animate-check-pop"
            : "border-slate-300 dark:border-slate-600 hover:border-sage-400 dark:hover:border-sage-500 hover:scale-105"
        }`}
    >
      {checked && <CheckIcon className="w-3 h-3" strokeWidth={3.2} />}
    </button>
  );
}

/** design/reference/src/App.tsx (Field, lines 83-98) + index.css .field* 그대로 이식. */
export function Field({ label, placeholder, value }: { label: string; placeholder?: string; value?: string }) {
  return (
    <label className="flex flex-1 flex-col gap-1.5 text-[11px] text-v2-ink-soft">
      <span>{label}</span>
      <input
        className="h-[50px] min-w-0 rounded-[11px] border border-v2-line bg-v2-paper px-3.5 text-sm text-v2-ink outline-none focus:border-v2-brand focus:ring-3 focus:ring-v2-brand-soft"
        defaultValue={value}
        placeholder={placeholder}
      />
    </label>
  );
}

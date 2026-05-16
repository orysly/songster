export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} aria-label="Songster logo">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-ink shadow-glow">
        <svg className="h-9 w-9" viewBox="0 0 64 64" role="img" aria-hidden="true">
          <circle cx="28" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="5" />
          <circle cx="28" cy="32" r="4" fill="currentColor" />
          <path d="M42 16v24" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
          <circle cx="38" cy="44" r="5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Minimal footer — this is a utility app (§7).
 */
export function Footer(): React.ReactElement {
  return (
    <footer className="mt-auto border-t border-border-default py-6">
      <div className="mx-auto flex w-full max-w-page flex-col items-center justify-between gap-2 px-4 text-caption text-text-tertiary sm:flex-row sm:px-6">
        <span>Picflow — Drop it. Share it.</span>
        <span className="font-mono text-[11px] uppercase tracking-wide">
          © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}

// A film/polaroid-style frame standing in for a real photo — rounded
// corner, soft shadow, faint warm cast. No AI-generated stand-in image:
// the brief for this site explicitly wants real candid photography, not
// posed product shots, so the honest placeholder is a labeled frame, not
// a fabricated photo of a real person.
export function PhotoPlaceholder({
  caption,
  aspect = "aspect-[4/5]",
}: {
  caption: string;
  aspect?: string;
}) {
  return (
    <figure className="w-full max-w-sm">
      <div
        className={`relative ${aspect} w-full overflow-hidden rounded-sm border border-ink/10 bg-gradient-to-br from-paper-deep to-light-soft/40 shadow-[0_18px_40px_-24px_rgba(34,28,20,0.35)]`}
      >
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <span className="font-hand text-lg text-ink-soft">{caption}</span>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-inset ring-ink/5" />
      </div>
    </figure>
  );
}

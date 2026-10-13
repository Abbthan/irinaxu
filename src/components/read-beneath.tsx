const PAIRS = [
  { surface: "Sent a light for the road.", deeper: "Found it lighting a stove." },
  { surface: "Thought the job was done.", deeper: "It had only just started." },
  { surface: "A tool, handed over.", deeper: "A life, still unseen." },
  { surface: "Gave what she had.", deeper: "Asked what was needed." },
] as const;

// A small perpetual-motion diagram — rsnc.ai's Perception card (a scan-line
// sweeping over dialogue, "read beneath the prompt") reskinned to this
// site's version of the same lesson: the gap between what looks like help
// and what actually helps. The sweep is continuous ambient motion, not a
// scroll-triggered reveal — matching rsnc's own perception-sweep, which
// runs on its own clock (left 7% -> 93%, ~3.8s) regardless of scroll.
export function ReadBeneath() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 sm:px-10 sm:py-32">
      <div className="mb-8 flex items-baseline gap-3">
        <span className="font-hand text-xl text-ink-soft">A study in seeing</span>
      </div>

      <div className="relative overflow-hidden border border-ink/10 bg-paper-deep/40 px-6 py-8 sm:px-10">
        <div
          aria-hidden
          className="read-beneath-sweep pointer-events-none absolute inset-y-0 w-24"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-light) 22%, transparent), transparent)",
          }}
        />
        <ul className="relative flex flex-col gap-6">
          {PAIRS.map((pair) => (
            <li key={pair.surface} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
              <span className="font-body text-[15px] text-ink-soft line-through decoration-ink/25 sm:w-[46%]">
                {pair.surface}
              </span>
              <span className="font-display text-[17px] italic text-ink">{pair.deeper}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

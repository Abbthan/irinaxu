import Image from "next/image";

// A film/polaroid-style frame. When `src` is given, it's real generated
// environment art (village/lamp scenes, not a fabricated likeness of a
// real person) approved by Irina after a style correction pass. When
// `src` is omitted, this falls back to a labeled placeholder card — for
// slots (like a candid photo of Irina, or a Light Talks recording) that
// need an actual photo we don't have yet, not a fabricated stand-in.
export function PhotoPlaceholder({
  caption,
  aspect = "aspect-[4/5]",
  src,
}: {
  caption: string;
  aspect?: string;
  src?: string;
}) {
  return (
    <figure className="w-full max-w-sm">
      <div
        className={`relative ${aspect} w-full overflow-hidden rounded-sm border border-ink/10 shadow-[0_18px_40px_-24px_rgba(34,28,20,0.35)] ${src ? "bg-dusk" : "bg-gradient-to-br from-paper-deep to-light-soft/40"}`}
      >
        {src ? (
          <Image
            src={src}
            alt={caption}
            fill
            sizes="(min-width: 1024px) 24rem, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <span className="font-hand text-lg text-ink-soft">{caption}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-inset ring-ink/5" />
      </div>
    </figure>
  );
}

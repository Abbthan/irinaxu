"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import type { Activity } from "@/content/activities";

interface ActivitySectionProps {
  activity: Activity;
  /** Roman act numeral, e.g. "III" */
  actNumeral: string;
  /** Index within the act, 1-based → displayed as 01, 02… */
  chapterIndex: number;
}

function CoverImage({
  src,
  alt,
  className,
  priority,
  objectPosition,
  objectFit = "cover",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
  objectFit?: "cover" | "contain";
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(
        "absolute inset-0 h-full w-full",
        objectFit === "contain" ? "object-contain" : "object-cover",
        className,
      )}
      style={objectPosition ? { objectPosition } : undefined}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

/** Fixed 9:16 frame — aspect lives on the wrapper, never on <video>. */
function PortraitClip({
  src,
  poster,
  caption,
}: {
  src: string;
  poster?: string;
  caption: string;
}) {
  return (
    <figure className="w-full">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-[#1a1612] shadow-[0_20px_40px_-28px_rgba(34,28,20,0.5)] ring-1 ring-ink/10">
        <video
          className="absolute inset-0 h-full w-full object-contain"
          controls
          playsInline
          preload="metadata"
          poster={poster}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      <figcaption className="mt-2.5 font-display text-[11px] tracking-[0.16em] text-ink/45 uppercase">
        {caption}
      </figcaption>
    </figure>
  );
}

function LandscapeClip({
  src,
  poster,
  caption,
  featured = false,
}: {
  src: string;
  poster?: string;
  caption: string;
  /** Full-width row — keep frame complete, no stretch crop */
  featured?: boolean;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-sm bg-ink/90 shadow-[0_18px_36px_-28px_rgba(34,28,20,0.45)]",
        featured && "sm:col-span-2",
      )}
    >
      <div className={cn("relative bg-ink", featured ? "aspect-[16/9]" : "aspect-video")}>
        <video
          className={cn(
            "absolute inset-0 h-full w-full",
            featured ? "object-contain" : "object-cover",
          )}
          controls
          playsInline
          preload="metadata"
          poster={poster}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      <figcaption className="border-t border-white/10 px-3 py-2 font-body text-[12px] leading-snug text-dusk-ink/75">
        {caption}
      </figcaption>
    </figure>
  );
}

export function ActivitySection({ activity, actNumeral, chapterIndex }: ActivitySectionProps) {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1.03, 1]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "0%"]);

  const hero = activity.imageSrc ?? activity.gallery?.[0];
  const videoPoster = activity.videoPoster;
  const wideSet = new Set(activity.wideGallerySrcs ?? []);
  const containSet = new Set(activity.containGallerySrcs ?? []);
  const featuredSet = new Set(activity.featuredGallerySrcs ?? []);
  const gallery = (activity.gallery ?? []).filter(
    (src) => src !== hero && src !== videoPoster,
  );

  const isPortrait = activity.videoOrientation === "portrait";
  const equalGrid = Boolean(activity.equalVideoGrid);

  const primaryVideo = activity.videoSrc
    ? {
        src: activity.videoSrc,
        poster: videoPoster,
        label: activity.videoLabel ?? `Field recording — ${activity.shortLabel}`,
      }
    : null;

  const extraLimit = equalGrid ? 8 : isPortrait ? 4 : 3;
  const extraVideos = (activity.extraVideos ?? []).slice(0, extraLimit).map((src, i) => ({
    src,
    poster: activity.extraVideoPosters?.[i],
    label: activity.extraVideoLabels?.[i] ?? `Clip ${i + 2}`,
  }));

  const allLandscapeVideos = equalGrid && primaryVideo
    ? [primaryVideo, ...extraVideos]
    : [];
  const allPortraitVideos = isPortrait && primaryVideo
    ? [primaryVideo, ...extraVideos]
    : [];
  const portraitGalleryStart = allPortraitVideos.length % 2 === 1 ? 1 : 0;

  const wideGallery = gallery.filter((src) => wideSet.has(src));
  const featuredGallery = gallery.filter((src) => featuredSet.has(src) && !wideSet.has(src));
  const gridGallery = gallery.filter(
    (src) => !wideSet.has(src) && !featuredSet.has(src),
  );

  return (
    <article
      id={activity.id}
      className="scroll-mt-24 border-b border-ink/8 bg-paper"
    >
      <div
        ref={heroRef}
        data-nav-surface="dusk"
        className="relative aspect-[16/9] w-full overflow-hidden bg-ink/90 sm:min-h-[52vh]"
      >
        {hero ? (
          <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0">
            <CoverImage
              src={hero}
              alt={activity.photoCaption}
              priority={chapterIndex <= 2}
              objectPosition={activity.heroObjectPosition ?? "center center"}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-dusk to-dusk-deep" />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,9,6,0.08) 0%, rgba(11,9,6,0.18) 45%, rgba(11,9,6,0.72) 100%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10 sm:pb-12">
          <div className="mx-auto max-w-6xl">
            <p className="font-display text-[12px] tracking-[0.24em] text-light/90 uppercase [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]">
              Chapter {actNumeral} {String(chapterIndex).padStart(2, "0")}
            </p>
            <h3 className="mt-3 max-w-4xl font-display text-[clamp(1.8rem,4.6vw,3.4rem)] font-light leading-[1.08] text-dusk-ink text-wrap-balance [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]">
              {activity.title}
            </h3>
          </div>
        </div>
      </div>

      <div
        data-nav-surface="paper"
        className="mx-auto grid max-w-6xl items-start gap-10 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14"
      >
        <div className="space-y-10 lg:sticky lg:top-28 lg:self-start">
          {activity.beats.map((beat) => (
            <div key={beat.label} className="max-w-[54ch]">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[11px] tracking-[0.2em] text-ink/40 uppercase">
                  {beat.label}
                </span>
                <span aria-hidden className="h-px flex-1 bg-ink/10" />
              </div>
              <h4
                className={cn(
                  "mt-3 font-display text-[1.15rem] font-light text-ink sm:text-[1.3rem]",
                  beat.label === "The Spectrum" && "text-ember",
                )}
              >
                {beat.title}
              </h4>
              <p className="mt-3 font-body text-[16px] leading-[1.8] text-ink/80 sm:text-[17px]">
                {beat.body}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          {isPortrait && allPortraitVideos.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                {allPortraitVideos.map((video) => (
                  <PortraitClip
                    key={video.src}
                    src={video.src}
                    poster={video.poster}
                    caption={video.label}
                  />
                ))}
                {/* Pair odd last video cell with first still (avatars) */}
                {portraitGalleryStart === 1 && gridGallery[0] ? (
                  <div
                    className={cn(
                      "relative aspect-[9/16] overflow-hidden rounded-2xl ring-1 ring-ink/10",
                      containSet.has(gridGallery[0]) ? "bg-[#f3efe6]" : "bg-[#f3efe6]",
                    )}
                  >
                    <CoverImage
                      src={gridGallery[0]}
                      alt={`${activity.title} — gallery`}
                      objectFit="contain"
                      objectPosition="center center"
                    />
                  </div>
                ) : null}
              </div>
              {gridGallery.slice(portraitGalleryStart).length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  {gridGallery.slice(portraitGalleryStart, portraitGalleryStart + 8).map((src, index) => {
                    const isContain = containSet.has(src);
                    return (
                      <div
                        key={src}
                        className={cn(
                          "relative overflow-hidden rounded-2xl bg-[#f3efe6] ring-1 ring-ink/10",
                          isContain ? "aspect-[9/16]" : "aspect-[4/5]",
                        )}
                      >
                        <CoverImage
                          src={src}
                          alt={`${activity.title} — ${index + 1}`}
                          objectFit="contain"
                          objectPosition="center center"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : equalGrid && allLandscapeVideos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              {allLandscapeVideos.map((video, index) => (
                <LandscapeClip
                  key={video.src}
                  src={video.src}
                  poster={video.poster}
                  caption={video.label}
                  featured={
                    index === allLandscapeVideos.length - 1 &&
                    allLandscapeVideos.length % 2 === 1
                  }
                />
              ))}
            </div>
          ) : (
            <>
              {primaryVideo ? (
                <LandscapeClip
                  src={primaryVideo.src}
                  poster={primaryVideo.poster}
                  caption={primaryVideo.label}
                />
              ) : null}

              {extraVideos.length > 0 ? (
                <div
                  className={cn(
                    "grid gap-3",
                    extraVideos.length >= 3 ? "grid-cols-3" : "grid-cols-2",
                  )}
                >
                  {extraVideos.map((video) => (
                    <LandscapeClip
                      key={video.src}
                      src={video.src}
                      poster={video.poster}
                      caption={video.label}
                    />
                  ))}
                </div>
              ) : null}
            </>
          )}

          {!isPortrait &&
          (wideGallery.length > 0 || featuredGallery.length > 0 || gridGallery.length > 0) ? (
            <div className="grid grid-cols-2 gap-4">
              {wideGallery.map((src) => (
                <div
                  key={src}
                  className="relative col-span-2 aspect-[21/9] overflow-hidden rounded-sm bg-[#f3efe6]"
                >
                  <CoverImage
                    src={src}
                    alt={`${activity.title} — logo`}
                    objectFit="contain"
                  />
                </div>
              ))}
              {/* Featured stills: full-width, complete (no crop) — tall enough to fill sparse galleries */}
              {featuredGallery.map((src) => (
                <div
                  key={src}
                  className="relative col-span-2 min-h-[280px] aspect-[4/3] overflow-hidden rounded-sm bg-[#f3efe6] sm:min-h-[360px]"
                >
                  <CoverImage
                    src={src}
                    alt={`${activity.title} — group`}
                    objectFit="contain"
                    objectPosition="center center"
                  />
                </div>
              ))}
              {/* Remaining stills: show complete when marked contain; else fill cleanly */}
              {gridGallery.slice(0, 8).map((src, index) => {
                const isContain = containSet.has(src);
                const items = gridGallery.slice(0, 8);
                const isLastOdd = items.length % 2 === 1 && index === items.length - 1;
                return (
                  <div
                    key={src}
                    className={cn(
                      "relative overflow-hidden rounded-sm bg-[#f3efe6]",
                      isContain
                        ? "aspect-[4/5]"
                        : isLastOdd
                          ? "col-span-2 aspect-[16/10]"
                          : "aspect-[4/5]",
                    )}
                  >
                    <CoverImage
                      src={src}
                      alt={`${activity.title} — ${index + 1}`}
                      objectFit={isContain ? "contain" : "cover"}
                      objectPosition={isContain ? "center center" : "center 28%"}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}

          <p className="font-hand text-lg leading-snug text-ink-soft">{activity.photoCaption}</p>
        </div>
      </div>
    </article>
  );
}

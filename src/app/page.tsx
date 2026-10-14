import { SiteNav } from "@/components/site-nav";
import { VillageParallaxScene } from "@/components/village-parallax-scene";
import { HeroScene } from "@/components/hero-scene";
import { MetricsBand } from "@/components/metrics-band";
import { ChapterIndex } from "@/components/chapter-index";
import { ChapterOpener } from "@/components/chapter-opener";
import { ActivitySection } from "@/components/activity-section";
import { StatementBreak } from "@/components/statement-break";
import { Epilogue } from "@/components/epilogue";
import { SiteFooter } from "@/components/site-footer";
import { ScrollLightLine } from "@/components/scroll-light-line";
import { SCENE_CURTAIN_OVERLAP_VH } from "@/lib/scroll-timing";
import { actIntros, activitiesForAct } from "@/content/activities";

export default function Home() {
  const actI = activitiesForAct("I");
  const actII = activitiesForAct("II");
  const actIII = activitiesForAct("III");

  return (
    <>
      <SiteNav />
      <ScrollLightLine />
      <main>
        <div id="top" />
        <VillageParallaxScene />
        <div
          className="relative z-10"
          style={{ marginTop: `${-SCENE_CURTAIN_OVERLAP_VH}vh` }}
        >
          <HeroScene />

          <div className="relative bg-paper">
            <MetricsBand />
            <ChapterIndex />

            <ChapterOpener
              id="act-i"
              numeral={actIntros.I.numeral}
              label={actIntros.I.label}
              title={actIntros.I.title}
              summary={actIntros.I.paragraphs.join(" ")}
              imageSrc={actIntros.I.photoSrc}
              chapters={actI.map((a) => ({ href: `#${a.id}`, name: a.title }))}
            />
            {actI.map((activity, index) => (
              <ActivitySection
                key={activity.id}
                activity={activity}
                actNumeral="I"
                chapterIndex={index + 1}
              />
            ))}

            <StatementBreak />

            <ChapterOpener
              id="act-ii"
              numeral={actIntros.II.numeral}
              label={actIntros.II.label}
              title={actIntros.II.title}
              summary={actIntros.II.paragraphs.join(" ")}
              imageSrc={actIntros.II.photoSrc}
              chapters={actII.map((a) => ({ href: `#${a.id}`, name: a.title }))}
            />
            {actII.map((activity, index) => (
              <ActivitySection
                key={activity.id}
                activity={activity}
                actNumeral="II"
                chapterIndex={index + 1}
              />
            ))}

            <ChapterOpener
              id="act-iii"
              numeral={actIntros.III.numeral}
              label={actIntros.III.label}
              title={actIntros.III.title}
              summary={actIntros.III.paragraphs.join(" ")}
              imageSrc="/images/activities/harmonia/01.jpg"
              imageObjectPosition="center 72%"
              chapters={actIII.map((a) => ({ href: `#${a.id}`, name: a.title }))}
            />
            {actIII.map((activity, index) => (
              <ActivitySection
                key={activity.id}
                activity={activity}
                actNumeral="III"
                chapterIndex={index + 1}
              />
            ))}

            <Epilogue />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

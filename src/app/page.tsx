import { SiteNav } from "@/components/site-nav";
import { ScrollLightLine } from "@/components/scroll-light-line";
import { VillageParallaxScene } from "@/components/village-parallax-scene";
import { HeroScene } from "@/components/hero-scene";
import { ActSection } from "@/components/act-section";
import { ReadBeneath } from "@/components/read-beneath";
import { StatementBreak } from "@/components/statement-break";
import { Epilogue } from "@/components/epilogue";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteNav />
      <ScrollLightLine />
      <main>
        <div id="top" />
        <VillageParallaxScene />
        <HeroScene />

        <ActSection
          id="act-i"
          numeral="I"
          label="First Light"
          title="A Naive Beginning"
          imageSide="right"
          photoCaption="A single street lamp lighting a quiet lane in the village at night"
          photoSrc="/images/village-lamp.png"
          paragraphs={[
            "I printed my first lamp out of a discarded plastic bottle. I sold it, and used the money to buy headlamps for children in the mountains of Sichuan’s Liangshan — so they could see the road to school in the dark. I thought the job was done.",
            "Later I learned the headlamps weren’t on the road at all. They were hanging by the stove, lighting the cooking.",
            "So I didn’t stop sending lamps — I started teaching the kids to make videos instead. A way to be seen, on their own terms, again and again.",
          ]}
        />

        <ReadBeneath />

        <StatementBreak />

        <ActSection
          id="act-ii"
          numeral="II"
          label="Shared Light"
          title="Building Bridges"
          imageSide="left"
          photoCaption="A hillside village of scattered lights, seen from a distance at night"
          photoSrc="/images/village-constellation.png"
          paragraphs={[
            "One lamp can only light one person. A community can light a city.",
            "I started the Youth Venture Alliance — no family name behind me, just enough stubbornness to connect a thousand high school founders who wanted to build something that mattered.",
            "I stopped being a single point of light. I became a wire, carrying whatever I had toward whoever had an idea worth it.",
          ]}
        />

        <ActSection
          id="act-iii"
          numeral="III"
          label="Lasting Light"
          title="The Inner Light"
          imageSide="right"
          photoCaption="Photo — books laid flat, or a Light Talks recording session"
          paragraphs={[
            "A lamp burns out. A trend passes. A thought doesn’t.",
            "I wrote about animal rights for the John Locke Institute, researched green business through IPQ, and renamed the interview show I ran — once just 17 Interviews — to Light Talks.",
            "Not for the views. For the record of what business could be, if it meant well.",
          ]}
        />

        <Epilogue />
      </main>
      <SiteFooter />
    </>
  );
}

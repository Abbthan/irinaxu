import { SiteNav } from "@/components/site-nav";
import { ScrollLightLine } from "@/components/scroll-light-line";
import { LightBeamHero } from "@/components/light-beam-hero";
import { ActSection } from "@/components/act-section";
import { VillageScene } from "@/components/village-scene";
import { Epilogue } from "@/components/epilogue";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteNav />
      <ScrollLightLine />
      <main>
        <LightBeamHero />

        <ActSection
          id="act-i"
          numeral="I"
          label="First Light"
          title="A Naive Beginning"
          imageSide="right"
          photoCaption="Photo — Irina holding the first printed lamp"
          paragraphs={[
            "I printed my first lamp out of a discarded plastic bottle. I sold it, and used the money to buy headlamps for children in the mountains of Sichuan’s Liangshan — so they could see the road to school in the dark. I thought the job was done.",
            "Later I learned the headlamps weren’t on the road at all. They were hanging by the stove, lighting the cooking.",
            "I had thought I was giving light. What they needed was to be seen.",
            "So I didn’t stop sending lamps — I started teaching the kids to make videos instead. Not another tool for them to use once. A way to be seen, on their own terms, again and again.",
          ]}
        />

        <VillageScene />

        <ActSection
          id="act-ii"
          numeral="II"
          label="Shared Light"
          title="Building Bridges"
          imageSide="left"
          photoCaption="Photo — Irina speaking at a YVA event"
          paragraphs={[
            "One lamp can only light one person. A community can light a city.",
            "I started the Youth Venture Alliance. No family name behind me, no head start — just enough stubbornness to connect a thousand high school founders who wanted to build something that mattered.",
            "I stopped being a single point of light. I became a wire — carrying whatever I had toward whoever had an idea worth it.",
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
            "I wrote about animal rights for the John Locke Institute. I researched green business through IPQ. And I renamed the interview show I ran — once just called 17 Interviews — to Light Talks, because I realized what I actually wanted was for two people’s thinking to strike against each other and catch.",
            "Not for the views. For the record of what business could be, if it meant well.",
          ]}
        />

        <Epilogue />
      </main>
      <SiteFooter />
    </>
  );
}

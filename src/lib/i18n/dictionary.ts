// Flat English -> Chinese map, central and grep-able. Every string here is
// hand-written (not machine-translated at request time) — see
// docs/i18n-language-system.md for why. Proper nouns (Irina, Light Talks)
// are deliberately left out so they pass through untranslated.
const zh: Record<string, string> = {
  // Nav
  "Contact": "联系",

  // Prologue / hero
  "What is light?":
    "什么是光？",
  "I used to think it was a bulb. Then I thought it was warmth. Now I think it’s the ability to see someone else.":
    "我曾以为那是灯泡，后来发现是温度，最后才明白——那是看见他人的能力。",
  "Scroll to begin": "向下滚动，故事开始",

  // Act I — A Naive Beginning
  "First Light": "初光",
  "A Naive Beginning": "天真的开始",
  "I printed my first lamp out of a discarded plastic bottle. I sold it, and used the money to buy headlamps for children in the mountains of Sichuan’s Liangshan — so they could see the road to school in the dark. I thought the job was done.":
    "我用废弃的塑料瓶打印出了第一盏灯，把它卖掉，换成头灯送给四川大凉山的孩子——让他们能看清夜里上学的路。我以为，我的任务完成了。",
  "Later I learned the headlamps weren’t on the road at all. They were hanging by the stove, lighting the cooking.":
    "后来我才知道，那些头灯根本没有出现在上学路上，而是被挂在灶台前，用来照亮做饭。",
  "I had thought I was giving light. What they needed was to be seen.":
    "我以为我在给予光明，但她们真正需要的，或许是被看见的生活。",
  "So I didn’t stop sending lamps — I started teaching the kids to make videos instead. Not another tool for them to use once. A way to be seen, on their own terms, again and again.":
    "于是我没有停止送灯，而是开始教山里的孩子拍视频、做自媒体。这不再是一件用完即弃的工具，而是一种能让他们被看见的方式——一次又一次，以自己的方式。",
  "Photo — Irina holding the first printed lamp": "照片 — Irina 手持第一盏打印的灯",

  // Act II — Building Bridges
  "Shared Light": "共光",
  "Building Bridges": "搭建桥梁",
  "One lamp can only light one person. A community can light a city.":
    "一盏灯只能照亮一个人，而一个社区，可以照亮一座城。",
  "I started the Youth Venture Alliance. No family name behind me, no head start — just enough stubbornness to connect a thousand high school founders who wanted to build something that mattered.":
    "我成立了青年创投联盟（YVA）。没有家庭背景，没有先天优势——凭着一股愣劲儿，我连接了一千位想要做出改变的高中生创业者。",
  "I stopped being a single point of light. I became a wire — carrying whatever I had toward whoever had an idea worth it.":
    "我不再是一个孤独的发光体，而成了一根电线，把我拥有的一切，引向每一个值得被点亮的想法。",
  "Photo — Irina speaking at a YVA event": "照片 — Irina 在 YVA 活动现场",

  // Act III — The Inner Light
  "Lasting Light": "恒光",
  "The Inner Light": "内在之光",
  "A lamp burns out. A trend passes. A thought doesn’t.":
    "灯会熄灭，风口会过去，但思想不会。",
  "I wrote about animal rights for the John Locke Institute. I researched green business through IPQ. And I renamed the interview show I ran — once just called 17 Interviews — to Light Talks, because I realized what I actually wanted was for two people’s thinking to strike against each other and catch.":
    "我在约翰·洛克研究所的比赛里写动物权利，在 IPQ 课题中研究绿色商业。我把自己主理的访谈节目《一七访谈》改名为《光·谈》——因为我发现，我真正想做的，是让两个人的思想在这里碰撞、点燃。",
  "Not for the views. For the record of what business could be, if it meant well.":
    "不是为了流量，而是为了记录下商业向善的可能。",
  "Photo — books laid flat, or a Light Talks recording session": "照片 — 平铺的书籍，或《光·谈》录制现场",

  // Act IV — Becoming the Light
  "Becoming Light": "成为光",
  "Becoming the Light": "成为光",
  "From the smoke over a stove in Sichuan, to the warmth left behind in a stray cat’s shelter, to the conviction in a founder’s eyes when someone finally believes them —":
    "从四川灶台前的一缕炊烟，到流浪猫窝里残留的余温，再到创业者眼中，第一次被认真相信时的坚定——",
  "I think I’ve spent my life chasing light, and slowly becoming it.":
    "我想，我这一生，大概都在追光，也在慢慢地，成为光。",
  "Photo — Irina walking toward the light, or a simple line drawing": "照片 — Irina 迎光而行，或一幅简笔画",

  // Closing quote
  "I used to think leadership meant giving orders.": "我曾以为，领导意味着发号施令。",
  "Now I know it means giving light.": "后来才懂，它意味着给予光。",
  "And sometimes, that light is just listening.": "而有时候，那束光，只是愿意倾听。",
  "Irina — Class of 2031": "Irina — 2031 届",

  // Footer
  "Get in touch": "取得联系",
  "Interviews": "访谈节目",
};

// Leading/trailing whitespace is preserved around the translated core so
// this is safe to run on text nodes that include incidental JSX whitespace.
export function translateEnglishToChinese(value: string): string {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.slice(leading.length, value.length - trailing.length);

  const direct = zh[core];
  if (direct) return `${leading}${direct}${trailing}`;

  // Dynamic/parameterized strings get an explicit regex + template, one per
  // distinct dynamic shape actually used in the product. None yet — this
  // site has no runtime-generated strings — but the ladder stays here so a
  // future one (e.g. a form confirmation) has a home.

  return value; // untranslated strings pass through unchanged, never garbled.
}

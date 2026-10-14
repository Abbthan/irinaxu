export type ActivityBeat = {
  label: "The Shadow" | "The Refraction" | "The Spectrum" | "The Reflection";
  title: string;
  body: string;
};

export type Activity = {
  id: string;
  slug: string;
  title: string;
  shortLabel: string;
  act: "I" | "II" | "III";
  photoCaption: string;
  imageSrc?: string;
  /** CSS object-position for portrait-heavy heroes, e.g. "center 20%". */
  heroObjectPosition?: string;
  gallery?: string[];
  videoSrc?: string;
  /** Distinct still from the video — never the same as imageSrc / gallery. */
  videoPoster?: string;
  /** Caption under the primary video (defaults to “Field recording — …” ). */
  videoLabel?: string;
  extraVideos?: string[];
  extraVideoPosters?: string[];
  extraVideoLabels?: string[];
  /** Portrait clips (e.g. 9:16) — player uses contain so heads aren't cropped. */
  videoOrientation?: "portrait" | "landscape";
  /** Gallery paths rendered as full-width horizontal strips (logos, wide stills). */
  wideGallerySrcs?: string[];
  /** Documents / logos that should sit on a light ground with object-contain. */
  containGallerySrcs?: string[];
  /** Full-width featured stills (group photos) — large, shown complete. */
  featuredGallerySrcs?: string[];
  /** Equal-size landscape video grid (Talks) instead of 1 big + small extras. */
  equalVideoGrid?: boolean;
  beats: ActivityBeat[];
};

export type HomeMetric = {
  value: string;
  label: string;
};

export const homeMetrics: HomeMetric[] = [
  { value: "45,000+", label: "CBPA participants each year" },
  { value: "50,000+", label: "Irina Talks listeners" },
  { value: "200+", label: "YVA cross-school collaborations" },
  { value: "26", label: "countries reached through CBPA" },
  { value: "200K+", label: "RMB net profit — Harmonia Voyage" },
];

export const actIntros: Record<
  "I" | "II" | "III",
  { numeral: string; label: string; title: string; paragraphs: string[]; photoCaption: string; photoSrc?: string }
> = {
  I: {
    numeral: "I",
    label: "Where the Light Lands",
    title: "Echo Fab Begins",
    photoCaption: "Echo Fab — plastic bottles turned into 3D-printed night lamps",
    photoSrc: "/images/village-lamp.png",
    paragraphs: [
      "In 2024, plastic bottles piled up on campus, while kids in Daliangshan walked a long way to school without a single streetlight.",
      "Streetlights can illuminate the main road, but only empowerment can truly light up their future.",
    ],
  },
  II: {
    numeral: "II",
    label: "Sharing Light",
    title: "Building Bridges",
    photoCaption: "Youth Venture Alliance — connecting founders across schools",
    photoSrc: "/images/village-constellation.png",
    paragraphs: [
      "When lights connect, things start to happen.",
      "YVA, CBPA, and a campus business club became the bridges — carrying capital, stages, and mentors to whoever had an idea worth it.",
    ],
  },
  III: {
    numeral: "III",
    label: "The Inner Light",
    title: "Light That Lasts",
    photoCaption: "Conversations, voyages, workshops — light that outlasts a single project",
    paragraphs: [
      "A lamp burns out. A trend passes. A thought doesn’t.",
      "Talks, travel, climate workshops, rockets, and code — each one a way to leave light that others can carry.",
    ],
  },
};

export const activities: Activity[] = [
  {
    id: "echo-fab",
    slug: "echo-fab",
    title: "Echo Fab",
    shortLabel: "Environmental Design Club",
    act: "I",
    photoCaption: "Discarded bottles and warm 3D-printed night lamps",
    imageSrc: "/images/activities/echo-fab/05.jpg",
    gallery: [
      "/images/activities/echo-fab/01.jpg",
      "/images/activities/echo-fab/02.jpg",
      "/images/activities/echo-fab/03.jpg",
      "/images/activities/echo-fab/04.jpg",
      "/images/activities/echo-fab/06.jpg",
      "/images/activities/echo-fab/07.jpg",
      "/images/activities/echo-fab/08.jpg",
      "/images/activities/echo-fab/10.jpg",
      "/images/activities/echo-fab/11.jpg",
    ],
    beats: [
      {
        label: "The Shadow",
        title: "Plastic Waste & Dark Roads",
        body: "In 2024, plastic bottles piled up on campus, while kids in Daliangshan walked a long way to school without a single streetlight. I just naively thought: it would be nice to give them some light.",
      },
      {
        label: "The Refraction",
        title: "Turning Waste into Light",
        body: "I led a team of 14 to recycle over 100 bottles a month, turning them into 3D-printed eco-lamps. We sold them and used the money to buy headlamps and donated streetlights to the village in Sichuan. Back then, I thought my mission was done. I thought I had lit their main roads and given them light.",
      },
      {
        label: "The Spectrum",
        title: "A Discovery That Stopped Me",
        body: "Later, I saw photos from the follow-up visit: the main road was indeed lit by our streetlights, but the headlamps weren't used on the dark walk to school. Instead, they were hung over kitchen stoves for cooking. That's when it hit me: we lit the public road, but what they truly needed was to have their real lives seen. This made me pause and rethink charity. It shouldn't be a handout from above, but empathy from standing in their shoes.",
      },
      {
        label: "The Reflection",
        title: "Lighting Up the Future, Not Just the Stove",
        body: "This became my most profound lesson about \"light.\" I stopped just donating streetlights and tools, and started teaching them to film videos to tell their own stories. Streetlights can illuminate the main road, but only empowerment can truly light up their future.",
      },
    ],
  },
  {
    id: "yva",
    slug: "yva",
    title: "Youth Venture Alliance",
    shortLabel: "YVA",
    act: "II",
    photoCaption: "A constellation of young founders connected across schools",
    imageSrc: "/images/activities/yva/01.jpg",
    gallery: [
      "/images/activities/yva/avatars.jpg",
      "/images/activities/yva/10.jpg",
      "/images/activities/yva/08.jpg",
      "/images/activities/yva/11.jpg",
      "/images/activities/yva/02.jpg",
    ],
    containGallerySrcs: ["/images/activities/yva/avatars.jpg"],
    videoSrc: "/videos/yva.mp4",
    videoPoster: "/images/activities/posters/yva.jpg",
    extraVideos: ["/videos/yva-2.mp4", "/videos/yva-3.mp4"],
    extraVideoPosters: [
      "/images/activities/posters/yva-2.jpg",
      "/images/activities/posters/yva-3.jpg",
    ],
    extraVideoLabels: ["Field clip — salon", "Field clip — gathering"],
    videoOrientation: "portrait",
    beats: [
      {
        label: "The Shadow",
        title: "Trapped in PPTs",
        body: "I saw brilliant young founders with their ventures trapped in PowerPoints. They had plenty of passion, but lacked real capital, mentorship, and a tangible ecosystem. In front of the vast business world, these isolated sparks easily burned out.",
      },
      {
        label: "The Refraction",
        title: "A 20% Threshold and a Bridge to the Top",
        body: "So I founded YVA with a strict 20% admit rate. Only high-quality nodes can create high-density light. I reached out to the top VC firms in China, including ZhenFund, MiraclePlus, Sequoia China, and Tsinghua-affiliated VC. I brought their closed-door salons, lectures, and hackathons directly to high school students. We were no longer waiting to be discovered. We were building the bridge ourselves.",
      },
      {
        label: "The Spectrum",
        title: "200+ Collaborations and 50+ Ventures",
        body: "When lights connect, things start to happen. I facilitated 200+ cross-school collaborations and curated 50+ frontier ventures across AI, EdTech, ESG, and Media. We birthed 3 seed-funded startups with founders from 12 countries. I also bridged N1 AI School and BKTB, securing exclusive fast-track interviews for our members.",
      },
      {
        label: "The Reflection",
        title: "Ecosystem is Light",
        body: "YVA taught me that true leadership is not about being the brightest star. It is about building the whole galaxy. I struck a match, and it illuminated a generation.",
      },
    ],
  },
  {
    id: "cbpa",
    slug: "cbpa",
    title: "Chinese Business Professionals Association",
    shortLabel: "CBPA",
    act: "II",
    photoCaption: "A stage spotlight over a packed audience of young competitors",
    imageSrc: "/images/activities/cbpa/02.jpg",
    gallery: [
      "/images/activities/cbpa/01.jpg",
      "/images/activities/cbpa/03.jpg",
      "/images/activities/cbpa/04.jpg",
      "/images/activities/cbpa/05.jpg",
      "/images/activities/cbpa/06.jpg",
    ],
    videoSrc: "/videos/cbpa.mp4",
    videoPoster: "/images/activities/posters/cbpa.jpg",
    extraVideos: ["/videos/cbpa-2.mp4", "/videos/cbpa-3.mp4"],
    extraVideoPosters: [
      "/images/activities/posters/cbpa-2.jpg",
      "/images/activities/posters/cbpa-3.jpg",
    ],
    beats: [
      {
        label: "The Shadow",
        title: "A Stage Beyond Textbooks",
        body: "Business education shouldn't just be about memorizing theories. Millions of high school students in China craved a stage to test their commercial talents, but they found none. The gap between classroom knowledge and real-world application was a silent barrier.",
      },
      {
        label: "The Refraction",
        title: "From Participant to Leader",
        body: "As President, I took over China's biggest high school business contest platform. I expanded our reach and vision, organizing and managing 50+ national-level events. We shifted from simple competitions to comprehensive professional development, bridging the gap for tens of thousands of students.",
      },
      {
        label: "The Spectrum",
        title: "45,000+ Participants Across 26 Countries",
        body: "We served over 45,000 annual participants from 26 countries. I personally mentored members in case analysis, business strategy, and venture-building. This wasn't just a number. It was a massive global youth business network, and we were powering it.",
      },
      {
        label: "The Reflection",
        title: "Amplifying Micro-Lights",
        body: "One person's light is limited, but a platform's energy is infinite. CBPA taught me how to scale impact. I used my own light to ignite the business dreams of 45,000 youth. The platform didn't just host competitions. It gave every participant the stage to shine.",
      },
    ],
  },
  {
    id: "business-club",
    slug: "business-club",
    title: "School Business Club",
    shortLabel: "Campus Club",
    act: "II",
    photoCaption: "Campus recruitment, classrooms, and the club in motion",
    imageSrc: "/images/activities/business-club/hero.jpg",
    gallery: [
      "/images/activities/business-club/03.jpg",
      "/images/activities/business-club/07.jpg",
      "/images/activities/business-club/01.jpg",
      "/images/activities/business-club/09.jpg",
      "/images/activities/business-club/10.jpg",
    ],
    featuredGallerySrcs: [
      "/images/activities/business-club/03.jpg",
      "/images/activities/business-club/07.jpg",
    ],
    videoSrc: "/videos/business-club.mp4",
    videoPoster: "/images/activities/posters/business-club.jpg",
    beats: [
      {
        label: "The Shadow",
        title: "Clubs in Silos",
        body: "My school had over 150 clubs, but business clubs operated in their own bubbles, disconnected from the real business world. We were just a closed interest group. Passionate, but isolated from the real economy we wanted to understand.",
      },
      {
        label: "The Refraction",
        title: "Making the Circle Bigger",
        body: "I founded the largest business club on campus, gathering 80 active members. We linked 5 schools for a 100+ participant business competition. Using YVA's network, I built a mentor mechanism that connected high school students directly with real founders and investors. The walls of the campus began to dissolve.",
      },
      {
        label: "The Spectrum",
        title: "Breaking the 100+ Barrier",
        body: "That joint competition expanded our influence to over 100 students. It was no longer a closed study group. It became a bridgehead to the real business world. Campus lights started to shine beyond the school gates.",
      },
      {
        label: "The Reflection",
        title: "Gathering as Fire",
        body: "A campus club shouldn't be an island. With the right connections, sparks on campus can gather into a blazing fire. It taught me that the smallest light, when connected, has the power to ignite an entire generation.",
      },
    ],
  },
  {
    id: "harmonia",
    slug: "harmonia",
    title: "Harmonia Voyage",
    shortLabel: "Cultural Exchange",
    act: "III",
    photoCaption: "Faces and routes from travelers meeting the real China",
    imageSrc: "/images/activities/harmonia/02.jpg",
    heroObjectPosition: "center 28%",
    gallery: [
      "/images/activities/harmonia/05.jpg",
      "/images/activities/harmonia/09.jpg",
      "/images/activities/harmonia/08.jpg",
      "/images/activities/harmonia/04.jpg",
    ],
    wideGallerySrcs: ["/images/activities/harmonia/05.jpg"],
    containGallerySrcs: ["/images/activities/harmonia/08.jpg"],
    beats: [
      {
        label: "The Shadow",
        title: "Prejudice on Screens",
        body: "At the end of 2024, China's 48-hour visa-free transit policy opened many doors. Foreign visitors began to pour in. Yet I noticed they still saw the country through heavy stereotypes. What they lacked wasn't a travel route, but a genuine mirror reflecting the real China.",
      },
      {
        label: "The Refraction",
        title: "37 People, Zero Capital",
        body: "I founded Harmonia Voyage and gathered 37 peers across schools. With no startup funding, we traded our client traffic for local ground support and cross-school promotion. We acted like wires connecting each other. There were no tour guides, just 37 young people determined to break down barriers.",
      },
      {
        label: "The Spectrum",
        title: "200K+ RMB Profit",
        body: "Through this zero-cash model, we generated over 200,000 RMB in net profit. But the true achievement was showing over 200 international clients the real China, from traditional crafts to underrated tech startups. They said, \"This is completely different from what we see in the news.\"",
      },
      {
        label: "The Reflection",
        title: "Connection Itself is Light",
        body: "Business doesn't have to be cold. I built this venture to pass a light to every border-crosser willing to see the real China. I learned that empathy, when paired with strategy, can illuminate the truth and create real value at the same time.",
      },
    ],
  },
  {
    id: "irina-talks",
    slug: "irina-talks",
    title: "Irina Talks",
    shortLabel: "Light Talks",
    act: "III",
    photoCaption: "A single spotlight in a dark room — deep listening, no script",
    imageSrc: "/images/activities/irina-talks/skt-handshake.jpg",
    heroObjectPosition: "center 30%",
    gallery: [],
    equalVideoGrid: true,
    videoSrc: "/videos/irina-talks-principal.mp4",
    videoPoster: "/images/activities/irina-talks/principal.jpg",
    videoLabel: "with Principal part1",
    extraVideos: [
      "/videos/irina-talks-principal-2.mp4",
      "/videos/irina-talks-skt.mp4",
      "/videos/irina-talks-weixun.mp4",
      "/videos/irina-talks-bpa.mp4",
    ],
    extraVideoPosters: [
      "/images/activities/irina-talks/principal-2.jpg",
      "/images/activities/irina-talks/skt-handshake.jpg",
      "/images/activities/irina-talks/weixun.jpg",
      "/images/activities/irina-talks/bpa.jpg",
    ],
    extraVideoLabels: [
      "with Principal part2",
      "with skt ceo | Hou Hao",
      "with Weixun CEO | Pan Tianhan",
      "with President of BPA from Stanford",
    ],
    beats: [
      {
        label: "The Shadow",
        title: "Who is Truly Listening",
        body: "In an era chasing viral hits and manufactured conflicts, conversations are compressed into 15-second clips. Authentic voices get lost in the noise. I noticed that meaningful stories, especially those about business for good, were being drowned out.",
      },
      {
        label: "The Refraction",
        title: "Deep Conversations",
        body: "I rebranded my interview series to Irina Talks. Instead of chasing quantity, I honed several in-depth conversations with heavyweight guests. Each episode averaged 30 minutes of unscripted, uninterrupted listening. No clickbait, no drama. Just quiet, genuine dialogue.",
      },
      {
        label: "The Spectrum",
        title: "Resonance with 50,000 Listeners",
        body: "These niche topics reached over 50,000 listeners. With zero paid promotion, it was pure resonance. Over 80% of the audience reported that those 30 minutes shifted their perception of what business can be. The light of their ideas had traveled far beyond the studio.",
      },
      {
        label: "The Reflection",
        title: "Listening is Illuminating",
        body: "I used to think leadership meant giving orders. Now I know it means giving light. Sometimes, that light is just 30 minutes of listening, echoing in 50,000 hearts. It taught me that true influence doesn't come from speaking louder, but from listening deeper.",
      },
    ],
  },
  {
    id: "team-up",
    slug: "team-up",
    title: "Team Up App",
    shortLabel: "LaunchX @ UC Berkeley",
    act: "III",
    photoCaption: "A phone screen glowing with a network of matched teammates",
    imageSrc: "/images/activities/team-up/hero.jpg",
    gallery: [
      "/images/activities/team-up/09.jpg",
      "/images/activities/team-up/08.jpg",
      "/images/activities/team-up/03.jpg",
      "/images/activities/team-up/07.jpg",
      "/images/activities/team-up/04.jpg",
    ],
    beats: [
      {
        label: "The Shadow",
        title: "The Lonely Island of Founders",
        body: "Many international students have brilliant ideas but can't find teammates. They are trapped on a lonely island, full of passion yet lacking a bridge to connect. The distance between an idea and a team often feels too wide to cross.",
      },
      {
        label: "The Refraction",
        title: "Building a Bridge with Code",
        body: "At LaunchX (UC Berkeley), I developed the Team Up App. It features personal profiles, smart matchmaking, and instant chat functions specifically designed for international students. I wanted to build a tool that solved the team-building problem, not with bureaucracy, but with technology.",
      },
      {
        label: "The Spectrum",
        title: "From 0 to 1",
        body: "A real product built from scratch. It solved a genuine pain point and connected global young innovators into a micro-network where ideas could finally take flight. It was no longer just an idea on paper; it was a living, breathing platform.",
      },
      {
        label: "The Reflection",
        title: "Tech is a Lens",
        body: "Technology is not just code; it is a lens. It focuses scattered lights together to ignite a greater entrepreneurial spark. I learned that the most powerful light often comes from simply helping others find their own. When you connect the right people, you don't just build an app; you build a community.",
      },
    ],
  },
  {
    id: "whu-biz-comp",
    slug: "whu-biz-comp",
    title: "Wuhan University Business Competition",
    shortLabel: "Offline Immersion",
    act: "III",
    photoCaption: "Five days and four nights of teams debating under pressure",
    imageSrc: "/images/activities/whu-biz-comp/hero-clear.jpg",
    heroObjectPosition: "center 18%",
    gallery: [
      "/images/activities/whu-biz-comp/02.jpg",
      "/images/activities/whu-biz-comp/01.jpg",
      "/images/activities/whu-biz-comp/03.jpg",
      "/images/activities/whu-biz-comp/05.jpg",
      "/images/activities/whu-biz-comp/06.jpg",
    ],
    videoSrc: "/videos/whu-biz-comp.mp4",
    videoPoster: "/images/activities/posters/whu-biz-comp.jpg",
    beats: [
      {
        label: "The Shadow",
        title: "The Coldness of Online Competitions",
        body: "Many business competitions remain trapped in online simulations. Students sit behind glowing screens, separated by distance, lacking the raw, high-pressure collisions that real business demands. The spark was there, but it felt distant and cold.",
      },
      {
        label: "The Refraction",
        title: "Five Days of Real Combat",
        body: "As an organizer, I hosted a five-day offline business competition at Wuhan University. I brought over 50 participants from more than 40 schools into the same physical space. It was a bold move to strip away the digital barrier and force real, face-to-face collaboration.",
      },
      {
        label: "The Spectrum",
        title: "20,000 RMB and Real Sweat",
        body: "The event generated 20,000 RMB in revenue. But far more importantly, those 50 students experienced the raw cruelty and joy of business. They engaged in intense brainstorming and relentless teamwork. Under the pressure, they truly found out what they were capable of.",
      },
      {
        label: "The Reflection",
        title: "Shining Under Pressure",
        body: "True light shines brightest under pressure. This experience honed my ability to orchestrate large-scale offline projects from scratch. I learned that while ideas can be shared online, the blazing fire of innovation is ignited when people stand side by side. The inner light of a leader is not just about guiding others; it is about creating the space where others can glow.",
      },
    ],
  },
  {
    id: "climate-workshop",
    slug: "climate-workshop",
    title: "Climate Action & Sustainability Workshop",
    shortLabel: "Green Play",
    act: "III",
    photoCaption: "Board-game cards and teenagers laughing through ESG lessons",
    imageSrc: "/images/activities/climate-workshop/01.jpg",
    gallery: [
      "/images/activities/climate-workshop/02.jpg",
      "/images/activities/climate-workshop/03.jpg",
      "/images/activities/climate-workshop/05.jpg",
    ],
    videoSrc: "/videos/climate-workshop.mp4",
    videoPoster: "/images/activities/posters/climate-workshop.jpg",
    beats: [
      {
        label: "The Shadow",
        title: "Boring Environmental Preaching",
        body: "Climate crisis, ESG, green economy. These words feel too distant and dry for teenagers. They sound like textbook jargon, disconnected from daily life. The message was important, but the delivery was putting everyone to sleep.",
      },
      {
        label: "The Refraction",
        title: "Bringing Them to Life with Board Games",
        body: "As the sole organizer, I hosted over 10 online and offline workshops. Instead of dry slides and lectures, I turned environmental knowledge into board games. Through playing and strategizing, the concept of a green economy clicked naturally. It was no longer a boring class. It was a game they actually wanted to win.",
      },
      {
        label: "The Spectrum",
        title: "300+ Green Awakenings",
        body: "This novel approach attracted over 300 participants. Amid laughter and debate, ESG stopped being a lofty term and became a seed planted in their minds. They walked away not just knowing more, but genuinely caring more about the planet.",
      },
      {
        label: "The Reflection",
        title: "Making Green Fun",
        body: "Charity and education do not have to be heavy. When I broke the lecture format with board games, I saw a light ignite in their eyes. That spark of green is what real enlightenment feels like. It taught me that the inner light of a teacher is not about preaching louder, but about finding the right key to unlock curiosity.",
      },
    ],
  },
  {
    id: "conrad",
    slug: "conrad",
    title: "Conrad Challenge: Liquid Rocket",
    shortLabel: "Liquid Rocket",
    act: "III",
    photoCaption: "Lab coats, propellant trials, and a liquid rocket built from scratch",
    imageSrc: "/images/activities/conrad/04.jpg",
    heroObjectPosition: "center 25%",
    gallery: [
      "/images/activities/conrad/06.jpg",
      "/images/activities/conrad/05.jpg",
      "/images/activities/conrad/07.jpg",
    ],
    featuredGallerySrcs: [
      "/images/activities/conrad/06.jpg",
      "/images/activities/conrad/05.jpg",
      "/images/activities/conrad/07.jpg",
    ],
    containGallerySrcs: [
      "/images/activities/conrad/06.jpg",
      "/images/activities/conrad/05.jpg",
      "/images/activities/conrad/07.jpg",
    ],
    beats: [
      {
        label: "The Shadow",
        title: "An Island Cut Off",
        body: "When extreme weather strikes, remote areas often become forgotten islands. Roads are severed, and medical supplies cannot get through. People are left waiting in the dark. I wanted to build a light that could penetrate the storm.",
      },
      {
        label: "The Refraction",
        title: "Business Logic, Altruistic Aim",
        body: "I analyzed over 10 hospitals and NGOs, and benchmarked 5 university research rockets. I built financial models because I understood that without cost sustainability, this light would merely be a fleeting firework. I needed to ensure the mission could survive in the real world.",
      },
      {
        label: "The Spectrum",
        title: "A 25% Cost Reduction",
        body: "We proved a solution that cuts launch costs by 25%, delivers a 15kg payload, and projects a 20% ROI over 5 years. This is not just cold data. It is a life-line that can fly more missions when disaster strikes.",
      },
      {
        label: "The Reflection",
        title: "Cold Tech, Warm Hearts",
        body: "I found a balance between rational valuation and compassionate empathy. The brightest light often comes from a calculated leap of faith. Technology is a cold light source, but the people behind it are warm. This project taught me that the deepest inner light is the one that merges logic with love.",
      },
    ],
  },
];

export function activitiesForAct(act: "I" | "II" | "III") {
  return activities.filter((activity) => activity.act === act);
}

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SB_URL = "https://pynmkrcbkcfxifnztnrn.supabase.co";
const SB_ANON = "sb_publishable_8VEm7zR0vqKjOZRwH6jimw_qIWt-RPp";
const supabase = createClient(SB_URL, SB_ANON, { auth: { flowType: "implicit", storageKey: "disney-bracket-auth" } });

function useIsMobile(breakpoint = 600) {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth <= breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setMob(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return mob;
}

const FACTS = {
  "The Lion King": "Most of Disney's top animators chose Pocahontas over this project, expecting it to be the bigger hit — Lion King ended up grossing more than three times as much",
  "Toy Story": "The first feature-length CGI film ever made — Pixar's computers ran 24 hours a day for over a year just to render it",
  "Finding Nemo": "The entire crew took scuba diving lessons, and the story team spent weeks at the Great Barrier Reef before drawing a single frame",
  "Beauty and the Beast": "The first animated film ever nominated for Best Picture at the Academy Awards",
  "The Little Mermaid": "Howard Ashman and Alan Menken structured the songs as a complete Broadway musical — their approach kicked off the entire Disney Renaissance",
  "Up": "The opening montage has zero dialogue, just music and visuals, and has since become a staple of film school curricula worldwide",
  "Aladdin": "Robin Williams improvised so extensively that production recorded over 16 hours of material — far more than they could write around",
  "Inside Out": "Pixar consulted with neuroscientists and psychiatrists throughout development. Several mental health professionals cried at early screenings.",
  "Coco": "Became the highest-grossing film of all time in Mexico upon release",
  "Frozen": "Let It Go was written in one session — the Lopezes say it flowed out in a single sitting and barely changed before the final cut",
  "The Incredibles": "Brad Bird pitched it as 'a James Bond film where the spy is a middle-aged dad' — Pixar greenlit it on that description alone",
  "WALL·E": "One of the most dialogue-sparse major studio films ever made — long stretches pass with no spoken words at all",
  "Mulan": "The first Disney protagonist to win her final battle through a clever trick rather than magic, brute strength, or being rescued",
  "Tangled": "Rapunzel's hair required Pixar to build an entirely new simulation system — 100,000+ individual strands, each animated separately",
  "Monsters, Inc.": "Boo's real name is briefly visible on her bedroom door in the final scene — it's Mary",
  "Moana": "Auli'i Cravalho was discovered at a charity event just days before the casting deadline closed. She had never auditioned for anything before.",
  "Ratatouille": "Brad Bird took over mid-production from a story that wasn't working. The finished film shares almost nothing with the original concept.",
  "Toy Story 3": "The villain Lotso was conceived before the original Toy Story, but cut — the technology to animate plush fur didn't exist yet",
  "Lilo & Stitch": "Originally pitched as a story about a little girl and her dog, set in Kansas. The alien was added specifically to avoid making another fairy tale.",
  "The Emperor's New Groove": "Was originally a serious Inca-set musical called Kingdom of the Sun. Almost the entire production was scrapped and rebuilt from scratch.",
  "Cinderella": "Walt Disney used the film's profits to pay off wartime studio debt and fund early development of what would become Disneyland",
  "Sleeping Beauty": "Every frame was painted in widescreen format specifically for the new Cinemascope theater technology — the production took six years",
  "Encanto": "Lin-Manuel Miranda wrote all eight original songs while simultaneously running Hamilton on Broadway",
  "Soul": "Jon Batiste performed the jazz sequences live so the animators could build Joe Gardner's playing style around his actual movements",
  "Zootopia": "The city required a different animation rig for every species — the fur simulation alone involves over 800,000 individual strands on the main characters",
  "Raya and the Last Dragon": "Before designing a single character, the production team traveled to Thailand, Laos, Cambodia, Vietnam, Indonesia, and the Philippines",
  "Turning Red": "The first Pixar feature set in Canada, and the first Pixar feature film directed solely by a woman of color",
  "Elemental": "Ember's fire effects required Pixar to build a new simulation system — water, fire, and air characters each needed their own physics engine",
};

const MAIN = [
  { seed:1, name:"The Lion King", year:1994, studio:"Disney", imdb:"https://www.imdb.com/title/tt0110357/" },
  { seed:2, name:"Toy Story", year:1995, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0114709/" },
  { seed:3, name:"Finding Nemo", year:2003, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0266543/" },
  { seed:4, name:"Beauty and the Beast", year:1991, studio:"Disney", imdb:"https://www.imdb.com/title/tt0101414/" },
  { seed:5, name:"The Little Mermaid", year:1989, studio:"Disney", imdb:"https://www.imdb.com/title/tt0097757/" },
  { seed:6, name:"Up", year:2009, studio:"Pixar", imdb:"https://www.imdb.com/title/tt1049413/" },
  { seed:7, name:"Aladdin", year:1992, studio:"Disney", imdb:"https://www.imdb.com/title/tt0103639/" },
  { seed:8, name:"Inside Out", year:2015, studio:"Pixar", imdb:"https://www.imdb.com/title/tt2096673/" },
  { seed:9, name:"Coco", year:2017, studio:"Pixar", imdb:"https://www.imdb.com/title/tt2380307/" },
  { seed:10, name:"Frozen", year:2013, studio:"Disney", imdb:"https://www.imdb.com/title/tt2294629/" },
  { seed:11, name:"The Incredibles", year:2004, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0317705/" },
  { seed:12, name:"WALL·E", year:2008, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0910970/" },
  { seed:13, name:"Mulan", year:1998, studio:"Disney", imdb:"https://www.imdb.com/title/tt0120762/" },
  { seed:14, name:"Tangled", year:2010, studio:"Disney", imdb:"https://www.imdb.com/title/tt0398286/" },
  { seed:15, name:"Monsters, Inc.", year:2001, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0198781/" },
  { seed:16, name:"Moana", year:2016, studio:"Disney", imdb:"https://www.imdb.com/title/tt3521164/" },
  { seed:17, name:"Ratatouille", year:2007, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0382932/" },
  { seed:18, name:"Toy Story 3", year:2010, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0435761/" },
  { seed:19, name:"Lilo & Stitch", year:2002, studio:"Disney", imdb:"https://www.imdb.com/title/tt0275847/" },
  { seed:20, name:"The Emperor's New Groove", year:2000, studio:"Disney", imdb:"https://www.imdb.com/title/tt0120917/" },
  { seed:21, name:"Cinderella", year:1950, studio:"Disney", imdb:"https://www.imdb.com/title/tt0042332/" },
  { seed:22, name:"Hercules", year:1997, studio:"Disney", imdb:"https://www.imdb.com/title/tt0119282/" },
  { seed:23, name:"Sleeping Beauty", year:1959, studio:"Disney", imdb:"https://www.imdb.com/title/tt0053285/" },
  { seed:24, name:"Encanto", year:2021, studio:"Disney", imdb:"https://www.imdb.com/title/tt2953050/" },
  { seed:25, name:"Soul", year:2020, studio:"Pixar", imdb:"https://www.imdb.com/title/tt2948372/" },
  { seed:26, name:"Zootopia", year:2016, studio:"Disney", imdb:"https://www.imdb.com/title/tt2948356/" },
  { seed:27, name:"Bambi", year:1942, studio:"Disney", imdb:"https://www.imdb.com/title/tt0034492/" },
  { seed:28, name:"Wreck-It Ralph", year:2012, studio:"Disney", imdb:"https://www.imdb.com/title/tt1772341/" },
  { seed:29, name:"Tarzan", year:1999, studio:"Disney", imdb:"https://www.imdb.com/title/tt0120855/" },
  { seed:30, name:"The Jungle Book", year:1967, studio:"Disney", imdb:"https://www.imdb.com/title/tt0061852/" },
  { seed:31, name:"Brave", year:2012, studio:"Pixar", imdb:"https://www.imdb.com/title/tt1217209/" },
  { seed:32, name:"Toy Story 2", year:1999, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0120363/" },
  { seed:33, name:"Toy Story 4", year:2019, studio:"Pixar", imdb:"https://www.imdb.com/title/tt1979376/" },
  { seed:34, name:"Lady and the Tramp", year:1955, studio:"Disney", imdb:"https://www.imdb.com/title/tt0048280/" },
  { seed:35, name:"101 Dalmatians", year:1961, studio:"Disney", imdb:"https://www.imdb.com/title/tt0055254/" },
  { seed:36, name:"Peter Pan", year:1953, studio:"Disney", imdb:"https://www.imdb.com/title/tt0046183/" },
  { seed:37, name:"The Hunchback of Notre Dame", year:1996, studio:"Disney", imdb:"https://www.imdb.com/title/tt0116583/" },
  { seed:38, name:"Snow White", year:1937, studio:"Disney", imdb:"https://www.imdb.com/title/tt0029583/" },
  { seed:39, name:"Big Hero 6", year:2014, studio:"Disney", imdb:"https://www.imdb.com/title/tt2245084/" },
  { seed:40, name:"Raya and the Last Dragon", year:2021, studio:"Disney", imdb:"https://www.imdb.com/title/tt5109280/" },
  { seed:41, name:"Cars", year:2006, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0317219/" },
  { seed:42, name:"Pinocchio", year:1940, studio:"Disney", imdb:"https://www.imdb.com/title/tt0032910/" },
  { seed:43, name:"Fantasia", year:1940, studio:"Disney", imdb:"https://www.imdb.com/title/tt0032455/" },
  { seed:44, name:"Luca", year:2021, studio:"Pixar", imdb:"https://www.imdb.com/title/tt12801262/" },
  { seed:45, name:"Pocahontas", year:1995, studio:"Disney", imdb:"https://www.imdb.com/title/tt0114148/" },
  { seed:46, name:"Alice in Wonderland", year:1951, studio:"Disney", imdb:"https://www.imdb.com/title/tt0043274/" },
  { seed:47, name:"Inside Out 2", year:2024, studio:"Pixar", imdb:"https://www.imdb.com/title/tt22022452/" },
  { seed:48, name:"The Princess and the Frog", year:2009, studio:"Disney", imdb:"https://www.imdb.com/title/tt0780521/" },
  { seed:49, name:"A Bug's Life", year:1998, studio:"Pixar", imdb:"https://www.imdb.com/title/tt0120623/" },
  { seed:50, name:"Dumbo", year:1941, studio:"Disney", imdb:"https://www.imdb.com/title/tt0033563/" },
  { seed:51, name:"Robin Hood", year:1973, studio:"Disney", imdb:"https://www.imdb.com/title/tt0070608/" },
  { seed:52, name:"Monsters University", year:2013, studio:"Pixar", imdb:"https://www.imdb.com/title/tt1453405/" },
  { seed:53, name:"Treasure Planet", year:2002, studio:"Disney", imdb:"https://www.imdb.com/title/tt0133240/" },
  { seed:54, name:"Atlantis: The Lost Empire", year:2001, studio:"Disney", imdb:"https://www.imdb.com/title/tt0230025/" },
  { seed:55, name:"The Great Mouse Detective", year:1986, studio:"Disney", imdb:"https://www.imdb.com/title/tt0091149/" },
  { seed:56, name:"The Rescuers Down Under", year:1990, studio:"Disney", imdb:"https://www.imdb.com/title/tt0100477/" },
  { seed:57, name:"The Sword in the Stone", year:1963, studio:"Disney", imdb:"https://www.imdb.com/title/tt0057546/" },
  { seed:58, name:"The Aristocats", year:1970, studio:"Disney", imdb:"https://www.imdb.com/title/tt0065421/" },
];

const PLAYIN = [
  { seed:59, name:"Bolt", year:2008, studio:"Disney", imdb:"https://www.imdb.com/title/tt0397892/" },
  { seed:60, name:"Meet the Robinsons", year:2007, studio:"Disney", imdb:"https://www.imdb.com/title/tt0396555/" },
  { seed:61, name:"Brother Bear", year:2003, studio:"Disney", imdb:"https://www.imdb.com/title/tt0328880/" },
  { seed:62, name:"The Rescuers", year:1977, studio:"Disney", imdb:"https://www.imdb.com/title/tt0076618/" },
  { seed:63, name:"Oliver & Company", year:1988, studio:"Disney", imdb:"https://www.imdb.com/title/tt0095776/" },
  { seed:64, name:"Elemental", year:2023, studio:"Pixar", imdb:"https://www.imdb.com/title/tt15789038/" },
  { seed:65, name:"Turning Red", year:2022, studio:"Pixar", imdb:"https://www.imdb.com/title/tt8097030/" },
  { seed:66, name:"Onward", year:2020, studio:"Pixar", imdb:"https://www.imdb.com/title/tt7146812/" },
  { seed:67, name:"Chicken Little", year:2005, studio:"Disney", imdb:"https://www.imdb.com/title/tt0371606/" },
  { seed:68, name:"Incredibles 2", year:2018, studio:"Pixar", imdb:"https://www.imdb.com/title/tt3606756/" },
  { seed:69, name:"Ralph Breaks the Internet", year:2018, studio:"Disney", imdb:"https://www.imdb.com/title/tt5848272/" },
  { seed:70, name:"The Good Dinosaur", year:2015, studio:"Pixar", imdb:"https://www.imdb.com/title/tt1979388/" },
];

const PIP = [[4,2],[1,9],[0,7],[3,6],[5,8],[10,11]];

const R1 = [
  [0,58],[31,32],[15,48],[16,41],[8,53],[23,40],[7,54],[25,38],
  [3,59],[29,36],[13,51],[18,47],[5,43],[26,33],[11,52],[20,46],
  [6,60],[27,39],[12,50],[19,49],[9,55],[22,45],[4,61],[21,44],
  [1,62],[30,35],[14,37],[17,42],[2,63],[24,34],[10,56],[28,57],
];

const RND = ["Round of 64","Round of 32","Sweet 16","Elite 8","Final Four","Championship"];
const DOTS = Array.from({length:80}, () => ({
  w: Math.random()*2.5+.5, h: Math.random()*2.5+.5,
  op: Math.random()*.5+.15, l: Math.random()*100, t: Math.random()*100,
  dur: Math.random()*4+2, del: Math.random()*4,
}));
const REG = ["Legends & Legacies","Heart & Heartbreak","Magic & Mischief","Worlds Apart"];
const CLR = {
  Disney: { bg:"#0d0d1e", ac:"#9d8fe0", gl:"rgba(157,143,224,.25)", tx:"#b8b0e8" },
  Pixar:  { bg:"#0d0d1e", ac:"#9d8fe0", gl:"rgba(157,143,224,.25)", tx:"#b8b0e8" },
};
const BADGE_CLR = {
  Disney: { bg:"#4fc3f722", tx:"#4fc3f7" },
  Pixar:  { bg:"#ff8a6522", tx:"#ff8a65" },
};

const ALL_MOVIES = [...MAIN, ...PLAYIN];
// Movies ordered by when they first appear in the bracket (play-in → R1 region order)
const BRACKET_ORDER = [
  ...PIP.flatMap(([a,b]) => [PLAYIN[a], PLAYIN[b]]),
  ...R1.flatMap(([a,b]) => { const out=[]; if(a<58) out.push(MAIN[a]); if(b<58) out.push(MAIN[b]); return out; }),
];

const loadLS = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const saveLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ } };

const serMatch = (ms) => ms.map(m => ({ p: [m[0], m[1]], w: m.winner || null }));
const desMatch = (ms) => ms.map(({ p, w }) => { const m = [p[0], p[1]]; if (w) m.winner = w; return m; });

// Canvas PNG export constants — 1920×1080
const CW = 1920, CH = 1080;
const CSW = 160, CSH = 26, CGAP = 4, CMH = 56; // slot/match dims
const CPW = 22, CPH = 24;                        // poster dims
const CSTEP = 185;                               // column step (CSW + 25px gap)
const CBT = 60, CBH = 900;                      // bracket top Y, bracket height
const clx = r => 10 + r * CSTEP;                // left column x at round r
const crx = r => CW - 10 - CSW - r * CSTEP;    // right column x at round r
const cps = r => Math.round(16 / Math.pow(2, r)); // matches per side at round r
const cmty = (r, i) => {                         // match top Y: round r, position i within side
  const sp = CBH / cps(r);
  return Math.round(CBT + sp * (i + 0.5) - CMH / 2);
};

// ---- Static movie metadata (runtime, rating, plot) ----

const STATIC_META = {
  1:  { runtime:"88 min",  rating:"8.5", plot:"Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.", poster:"https://image.tmdb.org/t/p/w185/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg" },
  2:  { runtime:"81 min",  rating:"8.3", plot:"A cowboy doll is profoundly jealous when a new spaceman action figure supplants him as the top toy in a boy's bedroom. When circumstances separate them from their owner, the duo have to put aside their differences to return to him.", poster:"https://image.tmdb.org/t/p/w185/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg" },
  3:  { runtime:"100 min", rating:"8.2", plot:"After his son is captured in the Great Barrier Reef and taken to Sydney, a timid clownfish sets out on a journey to bring him home.", poster:"https://image.tmdb.org/t/p/w185/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg" },
  4:  { runtime:"84 min",  rating:"8.0", plot:"A prince cursed to spend his days as a hideous monster sets out to regain his humanity by earning a young woman's love.", poster:"https://image.tmdb.org/t/p/w185/hUJ0UvQ5tgE2Z9WpfuduVSdiCiU.jpg" },
  5:  { runtime:"83 min",  rating:"7.6", plot:"A mermaid princess makes a Faustian bargain in an attempt to become human and win a prince's love.", poster:"https://image.tmdb.org/t/p/w185/plcZXvI310FkbwIptvd6rqk63LP.jpg" },
  6:  { runtime:"96 min",  rating:"8.3", plot:"78-year-old Carl Fredricksen travels to South America in his house equipped with balloons, inadvertently taking a young stowaway.", poster:"https://image.tmdb.org/t/p/w185/mFvoEwSfLqbcWwFsDjQebn9bzFe.jpg" },
  7:  { runtime:"90 min",  rating:"8.0", plot:"A kind-hearted street urchin and a power-hungry Grand Vizier vie for a magic lamp that has the power to make their deepest wishes come true.", poster:"https://image.tmdb.org/t/p/w185/eLFfl7vS8dkeG1hKp5mwbm37V83.jpg" },
  8:  { runtime:"95 min",  rating:"8.1", plot:"After young Riley is uprooted from her Midwest life and moved to San Francisco, her emotions, Joy, Fear, Anger, Disgust, and Sadness, conflict on how best to navigate a new city, house, and school.", poster:"https://image.tmdb.org/t/p/w185/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg" },
  9:  { runtime:"105 min", rating:"8.4", plot:"Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather, a legendary singer.", poster:"https://image.tmdb.org/t/p/w185/6Ryitt95xrO8KXuqRGm1fUuNwqF.jpg" },
  10: { runtime:"102 min", rating:"7.4", plot:"Fearless optimist Anna teams up with rugged mountain man Kristoff and his loyal reindeer Sven in an epic journey to find Anna's sister Elsa, whose icy powers have trapped the kingdom of Arendelle in eternal winter.", poster:"https://image.tmdb.org/t/p/w185/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg" },
  11: { runtime:"115 min", rating:"8.0", plot:"While trying to lead a quiet suburban life, a family of undercover superheroes are forced into action to save the world.", poster:"https://image.tmdb.org/t/p/w185/2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg" },
  12: { runtime:"98 min",  rating:"8.4", plot:"A robot who is responsible for cleaning a waste-covered Earth meets another robot and falls in love with her. Together, they set out on a journey that will alter the fate of mankind.", poster:"https://image.tmdb.org/t/p/w185/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg" },
  13: { runtime:"87 min",  rating:"7.7", plot:"To save her father from death in the army, a young maiden secretly goes in his place and becomes one of China's greatest heroines in the process.", poster:"https://image.tmdb.org/t/p/w185/jAbexAtB0aSfP5Ay4TpWHARyVnG.jpg" },
  14: { runtime:"100 min", rating:"7.7", plot:"The magically long-haired Rapunzel has spent her entire life in a tower, but now that a runaway thief has stumbled upon her, she is about to discover the world for the first time, and who she really is.", poster:"https://image.tmdb.org/t/p/w185/ym7Kst6a4uodryxqbGOxmewF235.jpg" },
  15: { runtime:"92 min",  rating:"8.1", plot:"In order to power the city, monsters have to scare children so that they scream. However, the children are toxic to the monsters, and after a child gets through, two monsters realize things may not be what they think.", poster:"https://image.tmdb.org/t/p/w185/wFSpyMsp7H0ttERbxY7Trlv8xry.jpg" },
  16: { runtime:"107 min", rating:"7.6", plot:"In ancient Polynesia, when a terrible curse incurred by the demigod Maui reaches Moana's island, she answers the Ocean's call to seek out Maui to set things right.", poster:"https://image.tmdb.org/t/p/w185/9tzN8sPbyod2dsa0lwuvrwBDWra.jpg" },
  17: { runtime:"111 min", rating:"8.1", plot:"A rat who can cook makes an unusual alliance with a young kitchen worker at a famous Paris restaurant.", poster:"https://image.tmdb.org/t/p/w185/t3vaWRPSf6WjDSamIkKDs1iQWna.jpg" },
  18: { runtime:"103 min", rating:"8.3", plot:"The toys are mistakenly delivered to a day-care center instead of the attic right before Andy leaves for college, and it's up to Woody to convince the other toys that they weren't abandoned and to return home.", poster:"https://image.tmdb.org/t/p/w185/AbbXspMOwdvwWZgVN0nabZq03Ec.jpg" },
  19: { runtime:"85 min",  rating:"7.4", plot:"A young and parentless girl adopts a 'dog' from the local pound, completely unaware that it's supposedly a dangerous scientific experiment that's taken refuge on Earth and is now hiding from its creator and those who see it as a m...", poster:"https://image.tmdb.org/t/p/w185/d73UqZWyw3MUMpeaFcENgLZ2kWS.jpg" },
  20: { runtime:"78 min",  rating:"7.4", plot:"Emperor Kuzco is turned into a llama by his ex-administrator Yzma, and must now regain his throne and his human form with the help of Pacha, a gentle llama herder.", poster:"https://image.tmdb.org/t/p/w185/isA0acj3ONKBLp1pKadUNzxEPFv.jpg" },
  21: { runtime:"74 min",  rating:"7.3", plot:"When Cinderella's cruel stepmother prevents her from attending the Royal Ball, she gets some unexpected help from the lovable mice Gus and Jaq and from her Fairy Godmother.", poster:"https://image.tmdb.org/t/p/w185/4nssBcQUBadCTBjrAkX46mVEKts.jpg" },
  22: { runtime:"93 min",  rating:"7.3", plot:"The son of Zeus and Hera is stripped of his immortality as an infant and must become a true hero in order to reclaim it.", poster:"https://image.tmdb.org/t/p/w185/dK9rNoC97tgX3xXg5zdxFisdfcp.jpg" },
  23: { runtime:"75 min",  rating:"7.2", plot:"After being snubbed by the royal family, a malevolent fairy places a curse on a princess which only a prince can break, along with the help of three good fairies.", poster:"https://image.tmdb.org/t/p/w185/n3pxoMDDxp10c1smgbDzW4bwlzq.jpg" },
  24: { runtime:"102 min",  rating:"7.2", plot:"An extraordinary family, the Madrigals, live hidden in the mountains of Colombia, in a magical house called an Encanto. The magic of the Encanto has blessed every child in the family with a unique gift - every child except one, Mi...", poster:"https://image.tmdb.org/t/p/w185/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg" },
  25: { runtime:"100 min", rating:"8.0", plot:"Joe is a middle-school band teacher whose life hasn't quite gone the way he expected. His true passion is jazz. But when he travels to another realm to help someone find their passion, he soon discovers what it means to have soul.", poster:"https://image.tmdb.org/t/p/w185/6jmppcaubzLF8wkXM36ganVISCo.jpg" },
  26: { runtime:"108 min", rating:"8.0", plot:"In a city of anthropomorphic animals, a rookie bunny cop and a cynical con artist fox must work together to uncover a conspiracy.", poster:"https://image.tmdb.org/t/p/w185/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg" },
  27: { runtime:"69 min",  rating:"7.3", plot:"The story of a young deer growing up in the forest.", poster:"https://image.tmdb.org/t/p/w185/wV9e2y4myJ4KMFsyFfWYcUOawyK.jpg" },
  28: { runtime:"101 min", rating:"7.7", plot:"Ralph is tired of playing the role of a bad guy and embarks on a journey to become a video game hero. But he accidentally lets loose a deadly enemy that threatens the entire arcade.", poster:"https://image.tmdb.org/t/p/w185/zWoIgZ7mgmPkaZjG0102BSKFIqQ.jpg" },
  29: { runtime:"88 min",  rating:"7.3", plot:"A man raised by gorillas must decide where he really belongs when he discovers he is a human.", poster:"https://image.tmdb.org/t/p/w185/bTvHlcqiOjGa3lFtbrTLTM3zasY.jpg" },
  30: { runtime:"78 min",  rating:"7.6", plot:"Bagheera the Panther and Baloo the Bear have a difficult time trying to convince a boy to leave the jungle for human civilization.", poster:"https://image.tmdb.org/t/p/w185/yN1kuupnPTLUprgfvC5WapgrxG4.jpg" },
  31: { runtime:"93 min",  rating:"7.1", plot:"Determined to make her own path in life, Princess Merida defies a custom that brings chaos to her kingdom. Granted one wish, Merida must rely on her bravery and her archery skills to undo a beastly curse.", poster:"https://image.tmdb.org/t/p/w185/1XAuDtMWpL0sYSFK0R6EZate2Ux.jpg" },
  32: { runtime:"92 min",  rating:"7.9", plot:"When Woody is stolen by a toy collector, Buzz and his friends set out on a rescue mission to save Woody before he becomes a museum toy property with his roundup gang Jessie, Prospector, and Bullseye.", poster:"https://image.tmdb.org/t/p/w185/yFWQkz2ynjwsazT6xQiIXEUsyuh.jpg" },
  33: { runtime:"100 min", rating:"7.6", plot:"When Woody, Buzz, and the gang join Bonnie on a road trip with her new craft project turned toy, Forky, the innocent little spork's antics launch Woody on a wild quest.", poster:"https://image.tmdb.org/t/p/w185/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg" },
  34: { runtime:"76 min",  rating:"7.3", plot:"The romantic tale of a sheltered uptown Cocker Spaniel dog and a streetwise downtown Mutt.", poster:"https://image.tmdb.org/t/p/w185/340NcWz9SQXWQyf4oicMxjbrLOb.jpg" },
  35: { runtime:"79 min",  rating:"7.3", plot:"When a litter of Dalmatian puppies are abducted by the minions of Cruella De Vil, the owners must find them before she uses them for a diabolical fashion statement.", poster:"https://image.tmdb.org/t/p/w185/kSlYq6FrBUviGSEh8v4L9nrSnBT.jpg" },
  36: { runtime:"77 min",  rating:"7.3", plot:"Wendy and her brothers are whisked away to the magical world of Neverland with the hero of their stories, Peter Pan.", poster:"https://image.tmdb.org/t/p/w185/fJJOs1iyrhKfZceANxoPxPwNGF1.jpg" },
  37: { runtime:"91 min",  rating:"7.0", plot:"A deformed bell-ringer must assert his independence from a vicious government minister in order to help his friend, a gypsy dancer.", poster:"https://image.tmdb.org/t/p/w185/hImMgT9B27evYSRmfztqdDtX6qi.jpg" },
  38: { runtime:"83 min",  rating:"7.6", plot:"Exiled into the dangerous forest by her wicked stepmother, a princess is rescued by seven dwarf miners who make her part of their household.", poster:"https://image.tmdb.org/t/p/w185/3VAHfuNb6Z7UiW12iYKANSPBl8m.jpg" },
  39: { runtime:"102 min", rating:"7.8", plot:"A special bond develops between plus-sized inflatable robot Baymax and prodigy Hiro Hamada, who together team up with a group of friends to form a band of high-tech heroes.", poster:"https://image.tmdb.org/t/p/w185/2mxS4wUimwlLmI1xp6QW6NSU361.jpg" },
  40: { runtime:"107 min", rating:"7.3", plot:"In a realm known as Kumandra, a re-imagined Earth inhabited by an ancient civilization, a warrior named Raya is determined to find the last dragon.", poster:"https://image.tmdb.org/t/p/w185/5nVhgCzxKbK47OLIKxCR1syulOn.jpg" },
  41: { runtime:"116 min", rating:"7.3", plot:"On the way to the biggest race of his life, a hotshot rookie race car gets stranded in a rundown town and learns that winning isn't everything in life.", poster:"https://image.tmdb.org/t/p/w185/2Touk3m5gzsqr1VsvxypdyHY5ci.jpg" },
  42: { runtime:"88 min",  rating:"7.5", plot:"A living puppet, with the help of a cricket as his conscience, must prove himself worthy to become a real boy.", poster:"https://image.tmdb.org/t/p/w185/bnZJrLRnoQHpzEJdka1KYfsAF3N.jpg" },
  43: { runtime:"124 min", rating:"7.7", plot:"A series of eight famous pieces of classical music, conducted by Leopold Stokowski and interpreted in animation by Walt Disney's team of artists.", poster:"https://image.tmdb.org/t/p/w185/5m9njnidjR0syG2gpVPVgcEMB2X.jpg" },
  44: { runtime:"95 min",  rating:"7.4", plot:"On the Italian Riviera, an unlikely but strong friendship grows between a human being and a sea monster disguised as a human.", poster:"https://image.tmdb.org/t/p/w185/9x4i9uKGXt8IiiIF5Ey0DIoY738.jpg" },
  45: { runtime:"81 min",  rating:"6.7", plot:"An English soldier and the daughter of an Algonquin chief share a romance when English colonists invade seventeenth century Virginia.", poster:"https://image.tmdb.org/t/p/w185/kZ1ft0QZ4e3zDUPMBftEkwI9ftd.jpg" },
  46: { runtime:"75 min",  rating:"7.3", plot:"Alice stumbles into the world of Wonderland. Will she get home? Not if the Queen of Hearts has her way.", poster:"https://image.tmdb.org/t/p/w185/20cvfwfaFqNbe9Fc3VEHJuPRxmn.jpg" },
  47: { runtime:"96 min", rating:"7.5", plot:"A sequel that features Riley entering puberty and experiencing brand new, more complex emotions as a result. As Riley tries to adapt to her teenage years, her old emotions try to adapt to the possibility of being replaced.", poster:"https://image.tmdb.org/t/p/w185/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg" },
  48: { runtime:"97 min",  rating:"7.2", plot:"A waitress desperate to fulfill her dreams as a restaurant owner is set on a journey to turn a frog prince back into a human, but she has to face the same problem after she kisses him.", poster:"https://image.tmdb.org/t/p/w185/v6nAUs62OJ4DXmnnmPFeVmMz8H9.jpg" },
  49: { runtime:"95 min",  rating:"7.2", plot:"A misfit ant, looking for \"warriors\" to save his colony from greedy grasshoppers, recruits a group of bugs that turn out to be an inept circus troupe.", poster:"https://image.tmdb.org/t/p/w185/Ah3J9OJVc2CNCuH2zMydXy9fmIC.jpg" },
  50: { runtime:"64 min",  rating:"7.2", plot:"Ridiculed because of his enormous ears, a young circus elephant is assisted by a mouse to achieve his full potential.", poster:"https://image.tmdb.org/t/p/w185/4x9FmvdJ464Fg7A9XcbYSmxfVw3.jpg" },
  51: { runtime:"83 min",  rating:"7.5", plot:"The story of the legendary British outlaw portrayed with the characters as anthropomorphic animals.", poster:"https://image.tmdb.org/t/p/w185/x9AvkYek0bGdxQSZ8W3lAjGrREm.jpg" },
  52: { runtime:"104 min", rating:"7.2", plot:"A look at the relationship between Mike Wazowski and James P. \"Sully\" Sullivan during their days at Monsters University, when they weren't necessarily the best of friends.", poster:"https://image.tmdb.org/t/p/w185/y7thwJ7z5Bplv6vwl6RI0yteaDD.jpg" },
  53: { runtime:"95 min",  rating:"7.2", plot:"Jim Hawkins is a teenager who finds the map of a great treasure hidden by a space pirate. Together with some friends, he sets off in a large spaceship, shaped like a caravel, on his quest.", poster:"https://image.tmdb.org/t/p/w185/kNhZkR3UNbXfvESQo7mJpOi4tGd.jpg" },
  54: { runtime:"83 min",  rating:"6.4", plot:"A clueless boss has no idea what to do with his mundane office worker whose refusal of duties only gets worse each passing minute.", poster:"https://image.tmdb.org/t/p/w185/swYfLGplXAle5CenmWVYpRSomCp.jpg" },
  55: { runtime:"74 min",  rating:"7.1", plot:"Basil, the rodent Sherlock Holmes, investigates the kidnapping of a toy maker and uncovers its link to his archenemy, Professor Ratigan.", poster:"https://image.tmdb.org/t/p/w185/9uDr7vfjCFr39KGCcqrk44Cg7fQ.jpg" },
  56: { runtime:"77 min",  rating:"6.8", plot:"R.A.S. agents Miss Bianca and Bernard race to Australia to save a little boy and a rare golden eagle from a murderous poacher.", poster:"https://image.tmdb.org/t/p/w185/5koTDBmMAkJOgAe4PL4163UKjvG.jpg" },
  57: { runtime:"79 min",  rating:"7.1", plot:"A poor boy named Arthur learns the power of love, kindness, knowledge and bravery with the help of a wizard called Merlin in the path to become one of the most beloved kings in English history.", poster:"https://image.tmdb.org/t/p/w185/7lyeeuhGAJSNXYEW34S8mJ1bwI8.jpg" },
  58: { runtime:"78 min",  rating:"7.1", plot:"With the help of a smooth talking tomcat, a family of Parisian felines set to inherit a fortune from their owner try to make it back home after a jealous butler kidnaps them and leaves them in the country.", poster:"https://image.tmdb.org/t/p/w185/1BVOSmQUhphMgnTxnXyfQ9tL1Sc.jpg" },
  59: { runtime:"96 min",  rating:"6.8", plot:"The canine star of a fictional sci-fi/action show that believes his powers are real embarks on a cross country trek to save his co-star from a threat he believes is just as real.", poster:"https://image.tmdb.org/t/p/w185/v5aC4nrzXFGJDWY4JO1eengXzqk.jpg" },
  60: { runtime:"95 min",  rating:"6.8", plot:"Lewis is a brilliant inventor who meets mysterious stranger named Wilbur Robinson, whisking Lewis away in a time machine and together they team up to track down Bowler Hat Guy in a showdown that ends with an unexpected twist of fate.", poster:"https://image.tmdb.org/t/p/w185/naya0zF4kT401Sx15AtwB9vpcJr.jpg" },
  61: { runtime:"85 min",  rating:"6.9", plot:"When a young Inuit hunter needlessly kills a bear, he is magically changed into a bear himself as punishment with a talkative cub being his only guide to changing back.", poster:"https://image.tmdb.org/t/p/w185/otptPbEY0vBostmo95xwiiumMJm.jpg" },
  62: { runtime:"77 min",  rating:"6.9", plot:"Two mice of the Rescue Aid Society search for a little girl kidnapped by unscrupulous treasure hunters.", poster:"https://image.tmdb.org/t/p/w185/9jpDjrRyvv9Nw0piXOpHHQTfxw9.jpg" },
  63: { runtime:"74 min",  rating:"6.6", plot:"A lost and alone kitten joins a gang of dogs engaged in petty larceny in New York City.", poster:"https://image.tmdb.org/t/p/w185/x8XqdiZ0Oxu5iXF9SiFub9Lae8J.jpg" },
  64: { runtime:"101 min", rating:"7.0", plot:"Follow Ember and Wade, in a city where fire, water, earth and air live together.", poster:"https://image.tmdb.org/t/p/w185/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg" },
  65: { runtime:"100 min", rating:"6.9", plot:"A thirteen-year-old girl named Mei Lee is torn between staying her mother's dutiful daughter and the changes of adolescence. And as if the challenges were not enough, whenever she gets overly excited Mei transforms into a giant re...", poster:"https://image.tmdb.org/t/p/w185/qsdjk9oAKSQMWs0Vt5Pyfh6O4GZ.jpg" },
  66: { runtime:"102 min", rating:"7.4", plot:"Teenage elf brothers Ian and Barley embark on a magical quest to spend one more day with their late father. Like any good adventure, their journey is filled with cryptic maps, impossible obstacles and unimaginable discoveries.", poster:"https://image.tmdb.org/t/p/w185/f4aul3FyD3jv3v4bul1IrkWZvzq.jpg" },
  67: { runtime:"81 min",  rating:"5.7", plot:"After ruining his reputation with the town, a courageous chicken must come to the rescue of his fellow citizens when aliens start an invasion.", poster:"https://image.tmdb.org/t/p/w185/87FpA4b90eTaw3U6zmCNikoPLir.jpg" },
  68: { runtime:"118 min", rating:"7.5", plot:"The Incredibles family takes on a new mission which involves a change in family roles: Bob Parr (Mr. Incredible) must manage the house while his wife Helen (Elastigirl) goes out to save the world.", poster:"https://image.tmdb.org/t/p/w185/9lFKBtaVIhP7E2Pk0IY1CwTKTMZ.jpg" },
  69: { runtime:"112 min", rating:"7.0", plot:"On a quest to save the video game 'Sugar Rush' and to find a replacement, Ralph and his best friend Vanellope travel to the World Wide Web through a Wi-Fi router they find at the arcade.", poster:"https://image.tmdb.org/t/p/w185/iVCrhBcpDaHGvv7CLYbK6PuXZo1.jpg" },
  70: { runtime:"93 min",  rating:"6.7", plot:"In a world where dinosaurs and humans live side-by-side, an Apatosaurus named Arlo makes an unlikely human friend.", poster:"https://image.tmdb.org/t/p/w185/8RSkxOO80btfKjyiC5ZiTaCHIT8.jpg" },
};

// ---- TMDB / OMDB helpers ----

const extractImdbId = url => url?.match(/tt\d+/)?.[0] ?? null;

async function fetchMovieMeta(tmdbKey, omdbKey) {
  const cache = (() => { try { return JSON.parse(localStorage.getItem("tmdb-meta-v1")||"{}"); } catch { return {}; } })();
  const missing = ALL_MOVIES.filter(m => (!cache[m.seed]?.poster || !cache[m.seed]?.plot) && extractImdbId(m.imdb));
  const BATCH = 20;
  for (let i = 0; i < missing.length; i += BATCH) {
    await Promise.all(missing.slice(i, i + BATCH).map(async m => {
      const id = extractImdbId(m.imdb);
      cache[m.seed] = cache[m.seed] || {};
      try {
        if (tmdbKey) {
          const r = await fetch(`https://api.themoviedb.org/3/find/${id}?api_key=${tmdbKey}&external_source=imdb_id`);
          const d = await r.json();
          const mov = d.movie_results?.[0];
          if (mov?.poster_path) cache[m.seed].poster = `https://image.tmdb.org/t/p/w92${mov.poster_path}`;
          if (mov?.overview) cache[m.seed].plot = cache[m.seed].plot || mov.overview;
        }
        if (omdbKey) {
          const r = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${omdbKey}`);
          const d = await r.json();
          if (d.Runtime && d.Runtime !== "N/A") cache[m.seed].runtime = d.Runtime;
          if (d.imdbRating && d.imdbRating !== "N/A") cache[m.seed].rating = d.imdbRating;
          if (!cache[m.seed].poster && d.Poster && d.Poster !== "N/A") cache[m.seed].poster = d.Poster;
          if (d.Plot && d.Plot !== "N/A") cache[m.seed].plot = d.Plot; // OMDB wins — shorter and cleaner
        }
      } catch { /* silent per-movie failure */ }
    }));
  }
  localStorage.setItem("tmdb-meta-v1", JSON.stringify(cache));
  return cache;
}

async function loadImages(metaMap) {
  const imgs = {};
  await Promise.all(Object.entries(metaMap).map(([seed, meta]) => {
    if (!meta?.poster) return Promise.resolve();
    return new Promise(res => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => { imgs[seed] = img; res(); };
      img.onerror = res;
      img.src = meta.poster;
    });
  }));
  return imgs;
}

// ---- Canvas drawing functions (PNG export) ----

function cBg(ctx) {
  const grad = ctx.createLinearGradient(0, 0, CW, CH);
  grad.addColorStop(0, "#06060f");
  grad.addColorStop(0.4, "#0e0e24");
  grad.addColorStop(0.7, "#180a20");
  grad.addColorStop(1, "#06060f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CW, CH);
}

function cHeader(ctx) {
  ctx.textAlign = "center";
  ctx.fillStyle = "#4fc3f7";
  ctx.font = "bold 18px Inter, sans-serif";
  ctx.fillText("Disney & Pixar: The Bracket", CW / 2, 24);
  ctx.fillStyle = "#6a6a8e";
  ctx.font = "10px Inter, sans-serif";
  ctx.fillText("70 movies · 69 matchups · 1 champion", CW / 2, 40);
}

function cRoundLabels(ctx) {
  const labels = ["R64", "R32", "Sweet 16", "Elite 8", "Final Four"];
  ctx.fillStyle = "#5a5a7e";
  ctx.font = "9px Inter, sans-serif";
  ctx.textAlign = "center";
  labels.forEach((lbl, r) => {
    ctx.fillText(lbl, clx(r) + CSW / 2, 54);
    ctx.fillText(lbl, crx(r) + CSW / 2, 54);
  });
}

function cRegionLabels(ctx) {
  const colors = ["#4fc3f7", "#ce93d8", "#ff8a65", "#4fc3f7"];
  REG.forEach((name, ri) => {
    // Regions 0+1 on left side (top half, bottom half), regions 2+3 on right side
    const side = ri < 2 ? "left" : "right";
    const regionInSide = ri % 2; // 0 = top 8 matches, 1 = bottom 8 matches
    const startI = regionInSide * 8;
    const topY = cmty(0, startI);
    const botY = cmty(0, startI + 7) + CMH;
    const y = (topY + botY) / 2;
    const x = side === "left" ? 6 : CW - 8;
    ctx.fillStyle = colors[ri];
    ctx.font = "bold 9px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(name, 0, 4);
    ctx.restore();
  });
}

function cConnectors(ctx, side) {
  // Round-to-round bracket connectors (r=0..3)
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let r = 0; r < 4; r++) {
    const perSide = cps(r);
    // Each adjacent pair of matches feeds into one match in the next round
    for (let j = 0; j < perSide / 2; j++) {
      const cy0 = cmty(r, j * 2) + CMH / 2;     // center Y of top match
      const cy1 = cmty(r, j * 2 + 1) + CMH / 2; // center Y of bottom match
      const yMid = (cy0 + cy1) / 2;              // = center Y of next-round match

      let xFrom, xTo;
      if (side === "left") {
        xFrom = clx(r) + CSW; // exit: right edge of current col
        xTo   = clx(r + 1);   // enter: left edge of next col
      } else {
        xFrom = crx(r);           // exit: left edge of current col
        xTo   = crx(r + 1) + CSW; // enter: right edge of next col
      }
      const xMid = (xFrom + xTo) / 2;

      // Top match → midX → yMid → next round
      ctx.beginPath();
      ctx.moveTo(xFrom, cy0);
      ctx.lineTo(xMid, cy0);
      ctx.lineTo(xMid, yMid);
      ctx.lineTo(xTo, yMid);
      ctx.stroke();
      // Bottom match → midX (joins vertical at yMid)
      ctx.beginPath();
      ctx.moveTo(xFrom, cy1);
      ctx.lineTo(xMid, cy1);
      ctx.stroke();
    }
  }
  // No FF→champion connector lines needed: with CSW=160 and CSTEP=185,
  // clx(4)+CSW = 910 and crx(4) = 1010, so the champion box (910-1010)
  // directly abuts the Final Four slots with zero gap.
}

function cSlot(ctx, x, y, movie, won, lost, isUpset, imgs) {
  const c = movie ? CLR[movie.studio] : { bg: "#0d0d20", ac: "#3a3a5e", tx: "#5a5a7e" };
  // Background
  ctx.fillStyle = won
    ? (isUpset ? "#3e1a0d" : "#1a1a0d")
    : lost ? "rgba(0,0,0,0.3)"
    : c.bg + "cc";
  ctx.beginPath();
  ctx.roundRect(x, y, CSW, CSH, 4);
  ctx.fill();
  // Border
  ctx.strokeStyle = won ? (isUpset ? "#ff8a65" : "#4fc3f7") : lost ? "rgba(255,255,255,0.04)" : `${c.ac}40`;
  ctx.lineWidth = won ? 1.5 : 1;
  ctx.stroke();
  if (!movie) {
    ctx.fillStyle = "#3a3a5e";
    ctx.font = "8px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("TBD", x + 6, y + CSH / 2 + 3);
    return;
  }
  // Poster thumbnail
  const img = imgs?.[movie.seed];
  let textX = x + 5;
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x + 3, y + (CSH - CPH) / 2, CPW, CPH, 2);
    ctx.clip();
    ctx.drawImage(img, x + 3, y + (CSH - CPH) / 2, CPW, CPH);
    ctx.restore();
    textX = x + CPW + 5;
  }
  // Seed
  ctx.fillStyle = won ? (isUpset ? "#ff8a65" : "#4fc3f7") : lost ? "#3a3a5e" : c.ac + "aa";
  ctx.font = "bold 7px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`#${movie.seed}`, textX, y + 9);
  // Name
  ctx.fillStyle = won ? "#f0f0ff" : lost ? "#3a3a5e" : "#c0c0e0";
  ctx.font = `${won ? "bold " : ""}9px Inter, sans-serif`;
  const maxW = CSW - (textX - x) - 4;
  let name = movie.name;
  while (name.length > 3 && ctx.measureText(name).width > maxW) name = name.slice(0, -1);
  if (name !== movie.name) name = name.trim() + "…";
  ctx.fillText(name, textX, y + 18);
  // Year
  ctx.fillStyle = lost ? "#2a2a40" : "#5a5a7e";
  ctx.font = "7px Inter, sans-serif";
  ctx.fillText(movie.year, textX, y + 24);
}

function cMatch(ctx, x, y, m, isUpset0, isUpset1, imgs) {
  // !!m?.winner guard prevents undefined===undefined false-positive when both are null
  const w0 = !!m?.winner && m.winner.seed === m?.[0]?.seed;
  const w1 = !!m?.winner && m.winner.seed === m?.[1]?.seed;
  cSlot(ctx, x, y, m?.[0], w0, !w0 && !!m?.winner, isUpset0, imgs);
  cSlot(ctx, x, y + CSH + CGAP, m?.[1], w1, !w1 && !!m?.winner, isUpset1, imgs);
}

function cSide(ctx, side, rds, upsets, imgs) {
  for (let r = 0; r < 5; r++) {
    const round = rds[r] || null;
    const perSide = cps(r);
    // Right side uses the second half of each round's match array
    const offset = side === "right" ? perSide : 0;
    const x = side === "left" ? clx(r) : crx(r);
    for (let i = 0; i < perSide; i++) {
      const m = round?.[offset + i] || null;
      const y = cmty(r, i);
      const isUpset0 = m?.winner?.seed === m?.[0]?.seed && m?.[0]?.seed > m?.[1]?.seed;
      const isUpset1 = m?.winner?.seed === m?.[1]?.seed && m?.[1]?.seed > m?.[0]?.seed;
      cMatch(ctx, x, y, m, isUpset0, isUpset1, imgs);
    }
  }
}

function cChamp(ctx, ch, imgs) {
  const ffY = cmty(4, 0) + CMH / 2; // Final Four match center Y (same for both sides)
  const bW = 100, bH = 80;  // exactly fills the 100px center gap
  const bX = clx(4) + CSW;  // left edge = right edge of left Final Four col
  const bY = ffY - bH / 2;
  // Glow backing
  ctx.fillStyle = "rgba(255,213,79,0.06)";
  ctx.strokeStyle = "rgba(255,213,79,0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bX, bY, bW, bH, 0); // square corners to blend with adjacent slots
  ctx.fill();
  ctx.stroke();
  // Crown
  ctx.textAlign = "center";
  ctx.font = "15px Inter, sans-serif";
  ctx.fillText("👑", bX + bW / 2, bY + 20);
  if (ch) {
    const img = imgs?.[ch.seed];
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bX + bW / 2 - 13, bY + 24, 26, 36, 3);
      ctx.clip();
      ctx.drawImage(img, bX + bW / 2 - 13, bY + 24, 26, 36);
      ctx.restore();
    }
    ctx.fillStyle = "#4fc3f7";
    ctx.font = "bold 8px Inter, sans-serif";
    const champName = ch.name.length > 14 ? ch.name.slice(0, 12) + "…" : ch.name;
    ctx.fillText(champName, bX + bW / 2, bY + 72);
  } else {
    ctx.fillStyle = "#5a5a7e";
    ctx.font = "8px Inter, sans-serif";
    ctx.fillText("Champion", bX + bW / 2, bY + 50);
  }
}

function cPlayin(ctx, piM, imgs) {
  if (!piM?.length) return;
  const pY = 978;
  ctx.fillStyle = "#5a5a7e";
  ctx.font = "bold 9px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Play-In Round", CW / 2, pY - 6);
  // 6 matches in a row, centered
  const mGap = 8;
  const totalW = piM.length * CSW + (piM.length - 1) * mGap;
  const startX = (CW - totalW) / 2;
  piM.forEach((m, i) => {
    const x = startX + i * (CSW + mGap);
    const isUpset0 = m?.winner?.seed === m?.[0]?.seed && m?.[0]?.seed > m?.[1]?.seed;
    const isUpset1 = m?.winner?.seed === m?.[1]?.seed && m?.[1]?.seed > m?.[0]?.seed;
    cMatch(ctx, x, pY, m, isUpset0, isUpset1, imgs);
  });
}

function buildDisplayRds(rds, piM) {
  const d = [...rds];
  // R64: synthesize from R1+MAIN if play-in not complete yet
  if (!d[0]) {
    const arr = [...MAIN, ...(piM || []).map(m => m.winner || null)];
    d[0] = R1.map(([a, b]) => [arr[a] || null, arr[b] || null]);
  }
  // For each subsequent round that doesn't exist yet, synthesize from previous winners.
  // This makes picks flow into future columns even before a round fully completes.
  for (let r = 1; r < 5; r++) {
    if (d[r]) continue;
    const prev = d[r - 1];
    if (!prev) break;
    const next = [];
    for (let i = 0; i < prev.length; i += 2) {
      const w0 = prev[i]?.winner || null;
      const w1 = prev[i + 1]?.winner || null;
      next.push([w0, w1]);
    }
    d[r] = next;
  }
  return d;
}

function drawBracket(canvas, { rds, piM, ch, upsets, imgs }) {
  const ctx = canvas.getContext("2d");
  const displayRds = buildDisplayRds(rds, piM);

  cBg(ctx);
  cHeader(ctx);
  cRoundLabels(ctx);
  cRegionLabels(ctx);
  cConnectors(ctx, "left");
  cConnectors(ctx, "right");
  cSide(ctx, "left", displayRds, upsets, imgs);
  cSide(ctx, "right", displayRds, upsets, imgs);
  cChamp(ctx, ch, imgs);
  cPlayin(ctx, piM, imgs);
}

export default function App() {
  const mob = useIsMobile();

  // Load saved bracket state — URL hash takes priority over localStorage (for sharing)
  const [init] = useState(() => {
    try {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const d = JSON.parse(atob(hash));
        if (d?._v === 1) return { ...d, piM: desMatch(d.piM), rds: d.rds.map(r => desMatch(r)) };
      }
    } catch { /* ignore malformed hash */ }
    const s = loadLS("dbk-state", null);
    if (!s) return null;
    return { ...s, piM: desMatch(s.piM), rds: s.rds.map(r => desMatch(r)) };
  });

  const [ph, setPh] = useState(() => init?.ph || "pi");
  const [piM, setPiM] = useState(() => init?.piM || PIP.map(([a,b]) => [PLAYIN[a], PLAYIN[b]]));
  const [piI, setPiI] = useState(() => init?.piI ?? 0);
  const [rds, setRds] = useState(() => init?.rds || []);
  const [cr, setCr] = useState(() => init?.cr ?? 0);
  const [cm, setCm] = useState(() => init?.cm ?? 0);
  const [ch, setCh] = useState(() => init?.ch || null);
  const [hv, setHv] = useState(null);
  const [an, setAn] = useState(null);
  const [bk, setBk] = useState(false);
  const [fb, setFb] = useState(false);
  const [hi, setHi] = useState(() => init?.hi || []);
  const [upsets, setUpsets] = useState(() => init?.upsets ?? []);
  const [upFlash, setUpFlash] = useState(false);
  const [fact, setFact] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBracket, setCopiedBracket] = useState(false);

  // Movie meta (posters, runtime, rating) — static baseline merged with API cache (cache wins per-field)
  const [movieMeta, setMovieMeta] = useState(() => {
    const fromLS = loadLS("tmdb-meta-v1", {});
    const merged = {};
    ALL_MOVIES.forEach(m => { merged[m.seed] = { ...STATIC_META[m.seed], ...fromLS[m.seed] }; });
    return merged;
  });
  const [tmdbStatus, setTmdbStatus] = useState(null); // null|'fetching'|'done'|'error'
  const [showTmdbModal, setShowTmdbModal] = useState(false);
  const [pngStatus, setPngStatus] = useState(null); // null|'fetching'|'drawing'|'done'

  // Supabase sync
  const [sbUser, setSbUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle'|'syncing'|'synced'|'error'
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Persist bracket state to localStorage and URL hash.
  // Guard: don't overwrite the hash while Supabase auth tokens are still there.
  // The navigator lock means _initialize() reads the hash as a platform task,
  // which can fire AFTER React effects (MessageChannel). Overwriting wipes the
  // access_token before the client reads it, so auth silently never fires.
  useEffect(() => {
    const serialized = { ph, piM: serMatch(piM), piI, rds: rds.map(r => serMatch(r)), cr, cm, ch, hi, upsets };
    saveLS("dbk-state", serialized);
    const hashHasAuth = window.location.hash.includes("access_token") || window.location.hash.includes("token_hash");
    if (!hashHasAuth && (hi.length > 0 || ch)) {
      try { window.history.replaceState(null, "", "#" + btoa(JSON.stringify({ _v: 1, ...serialized }))); } catch { /* btoa failure */ }
    }
  }, [ph, piM, piI, rds, cr, cm, ch, hi, upsets]);

  // Notes state (persisted to localStorage)
  const [notes, setNotes] = useState(() => {
    const raw = loadLS("dbk-notes", {});
    const migrated = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "string") migrated[k] = v;
      else if (v && typeof v === "object") {
        const parts = [v[0], v[1]].filter(Boolean);
        migrated[k] = parts.join("\n") || "";
      }
    }
    return migrated;
  });
  const [showNotes, setShowNotes] = useState(false);

  const updateNote = (seed, text) => {
    const nn = { ...notes, [seed]: text };
    setNotes(nn); saveLS("dbk-notes", nn);
  };

  const pullFromSupabase = async () => {
    const { data, error } = await supabase
      .from("disney_bracket").select("notes,state").maybeSingle();
    if (error || !data) return;
    if (data.notes) { setNotes(data.notes); saveLS("dbk-notes", data.notes); }
    if (data.state) {
      const s = data.state;
      try {
        setPh(s.ph); setPiM(desMatch(s.piM)); setPiI(s.piI ?? 0);
        setRds(s.rds.map(r => desMatch(r))); setCr(s.cr ?? 0); setCm(s.cm ?? 0);
        setCh(s.ch || null); setHi(s.hi || []); setUpsets(s.upsets || []);
        saveLS("dbk-state", s);
      } catch { /* ignore malformed server data */ }
    }
  };

  const handleFetchMeta = async (overrideTmdb, overrideOmdb) => {
    const tmdbKey = overrideTmdb !== undefined ? overrideTmdb : localStorage.getItem("tmdb-key");
    const omdbKey = overrideOmdb !== undefined ? overrideOmdb : (localStorage.getItem("omdb-key") || "548162f0");
    if (!tmdbKey && !omdbKey) { setShowTmdbModal(true); return; }
    setTmdbStatus("fetching");
    try {
      const map = await fetchMovieMeta(tmdbKey, omdbKey);
      setMovieMeta(map);
      setTmdbStatus("done");
    } catch {
      setTmdbStatus("error");
    }
    setTimeout(() => setTmdbStatus(null), 3000);
  };

  // Easter egg: press ? to open the repo
  useEffect(() => {
    const h = e => { if (e.key === "?" && !e.target.closest("input,textarea")) window.open("https://github.com/snackdriven/disney-bracket", "_blank"); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Token-hash exchange — handles magic link clicks (token_hash approach).
  // The custom email template links to ?token_hash=...&type=email so the
  // token survives email-client click trackers (which strip URL hashes).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    if (tokenHash && type === "email") {
      // Clean up URL before exchanging so a reload doesn't re-attempt
      const clean = window.location.pathname;
      window.history.replaceState(null, "", clean);
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
      // onAuthStateChange will fire SIGNED_IN once the exchange completes
    }
  }, []);

  // Auth init — runs once on mount.
  // onAuthStateChange fires INITIAL_SESSION after Supabase finishes its async
  // URL-hash / localStorage init, so it's reliable where getSession() races.
  useEffect(() => {
    let pulled = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSbUser(session?.user ?? null);
      // Pull on first sign-in (magic link) or when a pre-existing session is
      // detected after page load (INITIAL_SESSION with a user).
      if (session?.user && !pulled && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        pulled = true;
        pullFromSupabase();
      }
      if (event === "SIGNED_OUT") pulled = false;
    });
    return () => subscription.unsubscribe();
  }, []); // intentional: pullFromSupabase is stable, runs once

  // Auto-push on state change (debounced 2s)
  const syncTimerRef = useRef(null);
  useEffect(() => {
    if (!sbUser) return;
    clearTimeout(syncTimerRef.current);
    const serialized = { ph, piM: serMatch(piM), piI, rds: rds.map(r => serMatch(r)), cr, cm, ch, hi, upsets };
    syncTimerRef.current = setTimeout(async () => {
      setSyncStatus("syncing");
      const { error } = await supabase.from("disney_bracket").upsert({
        user_id: sbUser.id, notes, state: serialized, updated_at: new Date().toISOString(),
      });
      setSyncStatus(error ? "error" : "synced");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }, 2000);
  }, [ph, piM, piI, rds, cr, cm, ch, hi, upsets, notes, sbUser]);

  // Auto-fetch movie meta on mount if keys exist — reads cache from localStorage directly
  useEffect(() => {
    const tmdbKey = localStorage.getItem("tmdb-key");
    const omdbKey = localStorage.getItem("omdb-key");
    if (!omdbKey) localStorage.setItem("omdb-key", "548162f0");
    const cachedPosters = (() => {
      try { return Object.values(JSON.parse(localStorage.getItem("tmdb-meta-v1")||"{}")).filter(m => m?.poster).length; }
      catch { return 0; }
    })();
    const effectiveOmdb = omdbKey || "548162f0";
    if ((tmdbKey || effectiveOmdb) && cachedPosters < ALL_MOVIES.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleFetchMeta(tmdbKey, effectiveOmdb);
    }
  }, []); // intentional: mount-only, reads localStorage not state

  const handleDownloadPng = async () => {
    const tmdbKey = localStorage.getItem("tmdb-key");
    const omdbKey = localStorage.getItem("omdb-key") || "548162f0";
    if (!tmdbKey && !omdbKey) { setShowTmdbModal(true); return; }
    setPngStatus("fetching");
    let imgs = {};
    try {
      const map = await fetchMovieMeta(tmdbKey, omdbKey);
      setMovieMeta(map);
      imgs = await loadImages(map);
    } catch { /* text-only fallback */ }
    setPngStatus("drawing");
    await new Promise(r => setTimeout(r, 20));
    const canvas = document.createElement("canvas");
    canvas.width = 1920; canvas.height = 1080;
    drawBracket(canvas, { rds, piM, ch, upsets, imgs });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "disney-and-pixar-bracket.png";
    a.click();
    setPngStatus("done");
    setTimeout(() => setPngStatus(null), 2000);
  };

  const ip = ph==="pi";
  const mu = ip ? piM[piI] : rds[cr]?.[cm];
  const prog = ch ? 100 : (hi.length/69)*100;
  const rl = ip ? "Play-In Round" : (RND[cr]||"");
  const mn = ip ? piI+1 : cm+1;
  const mt = ip ? 6 : (rds[cr]?.length||0);
  const ri = !ip&&cr<=2 ? Math.floor(cm/(cr===0?8:cr===1?4:2)) : -1;
  const rn = ri>=0&&ri<4 ? REG[ri] : "";
  const up = ip ? piM : rds[cr];
  const ui = ip ? piI : cm;

  const pick = (w, pi) => {
    const opponent = mu[0].seed === w.seed ? mu[1] : mu[0];
    const isUpset = w.seed > opponent.seed;
    setAn(w.seed);
    if (isUpset) {
      setUpsets(u => [...u, { winner: w, loser: opponent, round: ip ? "Play-In" : (RND[cr]||""), seedDiff: w.seed - opponent.seed }]);
      setUpFlash(true);
      setTimeout(() => setUpFlash(false), 1500);
    }
    setHi(h => [...h, { p: pi?"pi":"m", i: pi?piI:cm, r: cr, wasUpset: isUpset }]);
    setTimeout(() => {
      setAn(null);
      if (FACTS[w.name]) {
        setFact(FACTS[w.name]);
        setTimeout(() => setFact(null), 4000);
      }
      if (pi) {
        const nm = piM.map((m,i) => { if(i!==piI) return m; const c=[...m]; c.winner=w; return c; });
        setPiM(nm);
        if (piI+1 >= 6) {
          const arr = [...MAIN, ...nm.map(m=>m.winner)];
          setRds([R1.map(([a,b])=>[arr[a],arr[b]])]); setCr(0); setCm(0); setPh("m");
        } else setPiI(piI+1);
      } else {
        const nr = rds.map((r,ri) => r.map((m,mi) => {
          if(ri!==cr||mi!==cm) return m; const c=[...m]; c.winner=w; return c;
        }));
        if (cm+1 >= nr[cr].length) {
          const ws = nr[cr].map(m=>m.winner);
          if (ws.length===1) setCh(w);
          else { const nx=[]; for(let i=0;i<ws.length;i+=2) nx.push([ws[i],ws[i+1]]); nr.push(nx); setCr(cr+1); setCm(0); }
        } else setCm(cm+1);
        setRds(nr);
      }
    }, 320);
  };

  const undo = () => {
    if(!hi.length) return;
    const l = hi[hi.length-1];
    setHi(hi.slice(0,-1));
    setFact(null);
    if (l.wasUpset) setUpsets(u => u.slice(0,-1));
    if(ch) setCh(null);
    if(l.p==="pi") {
      setPiM(piM.map((m,i) => { if(i!==l.i) return m; const c=[...m]; delete c.winner; return c; }));
      setPiI(l.i); setPh("pi"); setRds([]);
    } else {
      const nr = rds.slice(0,l.r+1).map((r,ri) => r.map((m,mi) => {
        if(ri!==l.r||mi!==l.i) return m; const c=[...m]; delete c.winner; return c;
      }));
      setCr(l.r); setCm(l.i); setRds(nr);
    }
  };

  const reset = () => {
    setPh("pi"); setPiM(PIP.map(([a,b])=>[PLAYIN[a],PLAYIN[b]])); setPiI(0);
    setRds([]); setCr(0); setCm(0); setCh(null); setHi([]); setBk(false); setFb(false);
    setUpsets([]); setUpFlash(false); setFact(null); setCopiedLink(false); setCopiedBracket(false);
    saveLS("dbk-state", null);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  const exportBracket = () => {
    const lines = ["🎬 Disney & Pixar: The Bracket — My Results", ""];
    if (piM.some(m => m.winner)) {
      lines.push("PLAY-IN ROUND");
      piM.forEach(m => {
        if (m.winner) {
          const loser = m[0].seed === m.winner.seed ? m[1] : m[0];
          lines.push(`  ${m.winner.name} def. ${loser.name}`);
        }
      });
      lines.push("");
    }
    rds.forEach((rd, ri) => {
      if (!rd.some(m => m.winner)) return;
      lines.push(ri === 0 ? "ROUND OF 64" : RND[ri].toUpperCase());
      rd.forEach((m, mi) => {
        if (m.winner) {
          const loser = m[0].seed === m.winner.seed ? m[1] : m[0];
          const note = ri === 0 ? ` · ${REG[Math.floor(mi/8)]}` : "";
          lines.push(`  ${m.winner.name} def. ${loser.name}${note}`);
        }
      });
      lines.push("");
    });
    if (ch) {
      lines.push(`CHAMPION: ${ch.name} 👑`);
      lines.push(`  #${ch.seed} seed · ${ch.studio} · ${ch.year}`);
    }
    return lines.join("\n");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    }).catch(() => {});
  };

  const copyBracket = () => {
    navigator.clipboard.writeText(exportBracket()).then(() => {
      setCopiedBracket(true);
      setTimeout(() => setCopiedBracket(false), 1500);
    }).catch(() => {});
  };

  const metaCount = Object.values(movieMeta).filter(m => m?.poster || m?.rating).length;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#06060f,#0e0e24 30%,#180a20 60%,#06060f)", fontFamily:"'Inter',sans-serif", color:"#e0e0f0" }}>
      {showTmdbModal && <TmdbModal onSave={(t,o)=>{ setShowTmdbModal(false); handleFetchMeta(t,o); }} onClose={()=>setShowTmdbModal(false)}/>}
      {showAuthModal && <AuthModal onClose={()=>setShowAuthModal(false)}/>}
      <Dots mob={mob}/>
      <style>{`
        @keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}
        @keyframes su{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cb{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
        @keyframes wg{0%,100%{text-shadow:0 0 20px rgba(79,195,247,.4)}50%{text-shadow:0 0 50px rgba(79,195,247,.8),0 0 80px rgba(79,195,247,.3)}}
        @keyframes ch{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(.98);opacity:.6}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes pp{0%,100%{border-color:rgba(79,195,247,.15)}50%{border-color:rgba(79,195,247,.4)}}
        @keyframes uf{0%{opacity:0;transform:translateY(-8px) scale(.9)}20%{opacity:1;transform:translateY(0) scale(1)}80%{opacity:1}100%{opacity:0}}
        @media(max-width:600px){
          .mob-btn:active{opacity:.7!important;transform:scale(.97)!important}
          .mob-card:active{transform:scale(.98)!important;opacity:.9!important}
        }
      `}</style>
      <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:mob?"16px 16px 32px":"20px 32px 40px" }}>
        <div style={{ textAlign:"center", marginBottom:mob?20:28 }}>
          <div style={{ fontSize:mob?11:11, letterSpacing:mob?5:7, textTransform:"uppercase", color:"#6a6a8e", marginBottom:mob?4:6 }}>Settle it once and for all</div>
          <h1 style={{ fontSize:"clamp(28px,5vw,42px)", fontWeight:800, margin:"0 0 4px", background:"linear-gradient(135deg,#9d8fe0,#ce93d8 45%,#4fc3f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Disney & Pixar: The Bracket</h1>
          <div style={{ fontSize:mob?13:13, color:"#7a7a9e" }}>{mob?"70 movies · 69 matchups · 1 champion":"70 movies · 6 play-in games · 69 matchups · 1 champion"}</div>
        </div>
        <div style={{ background:"rgba(255,255,255,.05)", borderRadius:20, height:mob?6:5, marginBottom:mob?6:6, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${prog}%`, background:"linear-gradient(90deg,#9d8fe0,#ce93d8,#4fc3f7)", borderRadius:20, transition:"width .5s" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:mob?12:11, color:"#6a6a8e", marginBottom:mob?10:14 }}>
          <span>{hi.length}/69 decided</span><span>{rl}{rn?` · ${rn}`:""}</span>
        </div>

        {/* Sync + posters strip */}
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:8, marginBottom:mob?8:10, fontSize:mob?12:11, flexWrap:"wrap" }}>
          {sbUser ? (
            <>
              <span style={{ color:"#6a6a8e" }}>
                {syncStatus==="syncing"?"⏳ Syncing...":syncStatus==="synced"?"✓ Synced":syncStatus==="error"?"⚠ Sync error":"☁ Synced"}
                {" "}{sbUser.email}
              </span>
              <button onClick={()=>supabase.auth.signOut()} style={{ background:"none", border:"none", color:"#5a5a7e", fontSize:mob?12:11, cursor:"pointer" }}>Sign out</button>
            </>
          ) : (
            <button onClick={()=>setShowAuthModal(true)} style={{ background:"none", border:"none", color:"#6a6a8e", fontSize:mob?12:11, cursor:"pointer", letterSpacing:.5 }}>☁ Sync across devices</button>
          )}
          <a href="https://snackdriven.github.io/bad-movie-bracket/" target="_blank" rel="noopener noreferrer" title="something worse this way comes" style={{ color:"#3a3a52", fontSize:mob?12:11, textDecoration:"none", opacity:.5 }}>💀</a>
          <span style={{ color:"#4a4a65" }}>·</span>
          <button onClick={()=>{ if(tmdbStatus==="fetching") return; if(!localStorage.getItem("tmdb-key")) setShowTmdbModal(true); else handleFetchMeta(); }} style={{ background:"none", border:"none", color:metaCount>0?"#6a6a8e":"#4fc3f7", fontSize:mob?12:11, cursor:"pointer" }}>
            {tmdbStatus==="fetching"?"⏳ Fetching..." : metaCount>0 ? `🎬 ${metaCount} movies loaded` : "🎬 Add posters & ratings"}
          </button>
        </div>

        {/* Full Bracket + Notes toggles */}
        <div style={{ textAlign:"center", marginBottom:mob?14:16, display:"flex", gap:mob?10:8, justifyContent:"center", flexWrap:"wrap" }}>
          <button className={mob?"mob-btn":""} onClick={()=>setFb(!fb)} style={{
            background: fb?"rgba(79,195,247,.12)":"rgba(255,255,255,.04)",
            border: fb?"1px solid rgba(79,195,247,.3)":"1px solid rgba(255,255,255,.08)",
            color: fb?"#4fc3f7":"#8a8aae", padding:mob?"10px 18px":"6px 18px", borderRadius:10,
            fontSize:mob?13:12, fontWeight:600, cursor:"pointer", letterSpacing:.5,
            transition:"all .15s", minHeight:mob?48:undefined,
          }}>{fb ? "Hide Bracket" : "📋 Full Bracket"}</button>
          <button className={mob?"mob-btn":""} onClick={()=>setShowNotes(!showNotes)} style={{
            background: showNotes?"rgba(206,147,216,.12)":"rgba(255,255,255,.04)",
            border: showNotes?"1px solid rgba(206,147,216,.3)":"1px solid rgba(255,255,255,.08)",
            color: showNotes?"#ce93d8":"#8a8aae", padding:mob?"10px 18px":"6px 18px", borderRadius:10,
            fontSize:mob?13:12, fontWeight:600, cursor:"pointer", letterSpacing:.5,
            transition:"all .15s", minHeight:mob?48:undefined,
          }}>{showNotes ? "Hide Notes" : "📝 Notes"}</button>
        </div>

        {/* Notes Panel */}
        {showNotes && <NotesPanel mob={mob} notes={notes} updateNote={updateNote}/>}

        {/* Full bracket overlay */}
        {fb && <FullBracket mob={mob} piM={piM} rds={rds} m64={[...MAIN,...piM.map(m=>m.winner).filter(Boolean)]} cr={cr} cm={cm} ip={ip} upsets={upsets}/>}

        {ip && <div style={{ textAlign:"center", marginBottom:mob?16:20, animation:"fi .4s" }}>
          <div style={{ display:"inline-block", padding:mob?"8px 16px":"6px 18px", borderRadius:20, background:"rgba(79,195,247,.08)", border:"1px solid rgba(79,195,247,.2)", animation:"pp 3s ease-in-out infinite", fontSize:mob?13:12, fontWeight:700, color:"#4fc3f7", letterSpacing:mob?1:2, textTransform:"uppercase" }}>{mob?"🎬 Play-In Round":"🎬 Play-In — Bottom 12 fight for 6 spots"}</div>
        </div>}

        {ch ? <div style={{ textAlign:"center", animation:"su .5s ease-out", padding:mob?"24px 12px":"40px 20px" }}>
          <div style={{ fontSize:mob?42:56, animation:"cb 2s ease-in-out infinite", marginBottom:mob?8:12 }}>👑</div>
          <div style={{ fontSize:mob?12:11, letterSpacing:mob?4:6, textTransform:"uppercase", color:"#4fc3f7", marginBottom:mob?8:10 }}>Your Champion</div>
          <div style={{ fontSize:"clamp(28px,7vw,50px)", fontWeight:800, color:"#4fc3f7", animation:"wg 2s ease-in-out infinite", marginBottom:6 }}>{ch.name}</div>
          <div style={{ fontSize:mob?15:15, color:"#9a9abe" }}>{ch.studio} · {ch.year} · #{ch.seed} seed</div>
          {upsets.length > 0 && <div style={{ marginTop:16, fontSize:mob?13:13, color:"#6a6a8e" }}>
            <div>{upsets.length} upset{upsets.length !== 1 ? "s" : ""} picked</div>
            {(() => {
              const big = upsets.reduce((a,b) => b.seedDiff > a.seedDiff ? b : a);
              return <div style={{ fontSize:mob?11:11, color:"#505070", marginTop:4 }}>Biggest: #{big.winner.seed} {big.winner.name} over #{big.loser.seed} {big.loser.name}</div>;
            })()}
          </div>}
          <div style={{ marginTop:mob?24:40, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <Btn mob={mob} p onClick={reset}>Run It Back</Btn>
            <Btn mob={mob} onClick={()=>setBk(!bk)}>{bk?"Hide":"View"} Bracket</Btn>
            <Btn mob={mob} s mu onClick={copyLink}>{copiedLink ? "✓ Linked!" : "🔗 Share"}</Btn>
            <Btn mob={mob} s mu onClick={copyBracket}>{copiedBracket ? "✓ Copied!" : "📋 Export"}</Btn>
            <Btn mob={mob} s mu onClick={handleDownloadPng}>
              {pngStatus==="fetching"?"⏳ Fetching...":pngStatus==="drawing"?"⏳ Drawing...":pngStatus==="done"?"✓ Saved!":"⬇ PNG"}
            </Btn>
          </div>
          {bk && <BV mob={mob} pi={piM} rds={rds}/>}
        </div>

        : mu ? <div key={`${ph}-${ip?piI:`${cr}-${cm}`}`} style={{ animation:"su .3s ease-out" }}>
          <div style={{ textAlign:"center", marginBottom:mob?12:16, fontSize:mob?14:13, color:"#8080a0" }}>Match {mn} of {mt}</div>
          {mob ? (
            <div style={{ display:"flex", flexDirection:"column", gap:0, alignItems:"center" }}>
              <Card mob m={mu[0]} h={hv===mu[0].seed} a={an===mu[0].seed} d={!!an} onH={setHv} onC={()=>pick(mu[0],ip)} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"10px 0", width:"100%" }}>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.12))" }}/>
                <span style={{ fontSize:14, fontWeight:800, color:"#5a5a7e", letterSpacing:3 }}>VS</span>
                <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(255,255,255,.12),transparent)" }}/>
              </div>
              <Card mob m={mu[1]} h={hv===mu[1].seed} a={an===mu[1].seed} d={!!an} onH={setHv} onC={()=>pick(mu[1],ip)} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0 }}>
              <Card key={mu[0].seed} m={mu[0]} h={hv===mu[0].seed} a={an===mu[0].seed} d={!!an} onH={setHv} onC={()=>pick(mu[0],ip)} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
              <div style={{ padding:"0 22px", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ width:1, height:32, background:"linear-gradient(180deg,transparent,rgba(255,255,255,.1))" }}/>
                <span style={{ fontSize:13, fontWeight:800, color:"#3a3a58", letterSpacing:4 }}>VS</span>
                <div style={{ width:1, height:32, background:"linear-gradient(180deg,rgba(255,255,255,.1),transparent)" }}/>
              </div>
              <Card key={mu[1].seed} m={mu[1]} h={hv===mu[1].seed} a={an===mu[1].seed} d={!!an} onH={setHv} onC={()=>pick(mu[1],ip)} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
            </div>
          )}
          {upFlash && <div style={{ textAlign:"center", marginTop:12, animation:"uf 1.5s ease-out forwards" }}>
            <span style={{ display:"inline-block", padding:"4px 14px", borderRadius:20, background:"rgba(255,80,80,.12)", border:"1px solid rgba(255,80,80,.25)", fontSize:mob?12:11, fontWeight:700, color:"#ff7070", letterSpacing:2, textTransform:"uppercase" }}>🚨 Upset!</span>
          </div>}
          {fact && <div style={{ margin:mob?"14px 0 0":"14px auto 0", maxWidth:mob?undefined:560, padding:"12px 18px", background:"rgba(255,255,255,.04)", borderRadius:12, border:"1px solid rgba(255,255,255,.07)", fontSize:mob?13:13, color:"#9898b8", fontStyle:"italic", lineHeight:1.6, animation:"su .3s ease-out" }}>
            💡 {fact}
          </div>}
          <div style={{ display:"flex", justifyContent:"center", gap:mob?10:10, marginTop:mob?18:22 }}>
            {hi.length>0 && <Btn mob={mob} s onClick={undo}>← Undo</Btn>}
            <Btn mob={mob} s mu onClick={reset}>Reset</Btn>
            {!ip && <Btn mob={mob} s mu onClick={()=>setBk(!bk)}>{bk?"Hide":"Bracket"}</Btn>}
            {hi.length>0 && <Btn mob={mob} s mu onClick={copyLink}>{copiedLink ? "✓!" : "🔗 Share"}</Btn>}
            {hi.length>0 && <Btn mob={mob} s mu onClick={handleDownloadPng}>
              {pngStatus&&pngStatus!=="done"?"⏳":pngStatus==="done"?"✓!":"⬇ PNG"}
            </Btn>}
          </div>
          {bk&&!ip && <BV mob={mob} pi={piM} rds={rds} cr={cr} cm={cm}/>}
          {!bk && up && ui+1<up.length && <div style={{ marginTop:mob?24:30 }}>
            <div style={{ fontSize:mob?11:10, color:"#5a5a7e", marginBottom:mob?8:8, letterSpacing:2.5, textTransform:"uppercase", fontWeight:700 }}>Up Next</div>
            {up.slice(ui+1,ui+(mob?3:5)).map((m,i) => <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:mob?"8px 12px":"6px 12px", background:"rgba(255,255,255,.025)", borderRadius:8, fontSize:mob?13:12, marginBottom:mob?4:4 }}>
              <span style={{ fontWeight:600, color:"#9898b8", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m[0].name}</span>
              <span style={{ fontSize:mob?10:9, color:"#4a4a65", letterSpacing:2, margin:"0 8px", flexShrink:0 }}>VS</span>
              <span style={{ fontWeight:600, color:"#9898b8", flex:1, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m[1].name}</span>
            </div>)}
          </div>}
        </div> : null}
      </div>
    </div>
  );
}

function Card({ m, h, a, d, onH, onC, notes, updateNote, mob, movieMeta }) {
  const c = CLR[m.studio];
  const [showCardNotes, setShowCardNotes] = useState(false);
  const note = notes?.[m.seed] || "";
  const meta = movieMeta?.[m.seed];
  const hasPoster = !!meta?.poster;
  const panelW = mob ? 66 : 78;
  const rTop = showCardNotes ? (mob ? "14px 14px 0 0" : "16px 16px 0 0") : (mob ? 14 : 16);

  const cardBg = h ? `linear-gradient(135deg,${c.bg} 0%,${c.ac}22 100%)` : `linear-gradient(135deg,${c.bg}f8 0%,${c.bg}dd 100%)`;
  const cardBorder = h ? `1.5px solid ${c.ac}55` : "1.5px solid rgba(255,255,255,.06)";

  return <div style={{
    flex:mob?"1 1 100%":"1 1 320px", maxWidth:mob?undefined:560, width:mob?"100%":undefined,
    // When notes open, outer wrapper becomes the visual container
    background: showCardNotes ? cardBg : "transparent",
    border: showCardNotes ? cardBorder : "none",
    borderRadius: mob?14:16,
    overflow: showCardNotes ? "hidden" : "visible",
    transition:"border-color .18s",
  }}>
    <button className={mob?"mob-card":""} onClick={()=>!d&&onC()}
      onMouseEnter={mob?undefined:()=>onH(m.seed)} onMouseLeave={mob?undefined:()=>onH(null)}
      onTouchStart={mob?()=>onH(m.seed):undefined} onTouchEnd={mob?()=>onH(null):undefined}
      style={{
        width:"100%", padding:0, position:"relative", overflow:"hidden",
        background: showCardNotes ? "transparent" : cardBg,
        border: showCardNotes ? "none" : cardBorder,
        borderRadius: rTop,
        cursor: d?"default":"pointer",
        transition:"all .18s cubic-bezier(.25,.8,.25,1)",
        transform: h&&!a&&!mob?"translateY(-4px)":"none",
        boxShadow: h?`0 ${mob?14:22}px ${mob?36:54}px ${c.gl},inset 0 1px 0 ${c.ac}18`:`0 4px ${mob?14:18}px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.04)`,
        animation: a?"ch .35s ease forwards":"none",
        display:"flex", flexDirection:"row", alignItems:"stretch",
        minHeight: mob?90:108, textAlign:"left",
        WebkitTapHighlightColor:"transparent",
      }}>

      {/* Left panel: full-height poster OR decorative seed number */}
      <div style={{
        width:panelW, flexShrink:0, position:"relative", overflow:"hidden",
        borderRadius: showCardNotes?(mob?"14px 0 0 0":"16px 0 0 0"):(mob?"14px 0 0 14px":"16px 0 0 16px"),
      }}>
        {hasPoster ? <>
          <img src={meta.poster} alt="" style={{
            width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top",
            display:"block", opacity:a?.45:1,
            transition:"opacity .3s, transform .2s",
            transform: h&&!mob?"scale(1.05)":"scale(1)",
          }}/>
          {/* Right-edge blend into card */}
          <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"60%", background:`linear-gradient(90deg,transparent,${c.bg}f0)`, pointerEvents:"none" }}/>
        </> : (
          /* No poster: large faded seed number */
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:`${c.ac}08`, borderRight:`1px solid ${c.ac}10` }}>
            <span style={{ fontSize:mob?30:36, fontWeight:900, color:c.ac, opacity:h?.22:.1, lineHeight:1, userSelect:"none", transition:"opacity .18s", fontVariantNumeric:"tabular-nums" }}>{m.seed}</span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div style={{ flex:1, padding:mob?"11px 12px 11px 10px":"13px 16px 13px 12px", display:"flex", flexDirection:"column", justifyContent:"center", gap:mob?4:5, minWidth:0 }}>

        {/* Top row: seed (when poster) + studio + year + notes dot */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {hasPoster && <span style={{ fontSize:9, fontWeight:800, color:c.ac, opacity:.5, letterSpacing:.5 }}>#{m.seed}</span>}
          <span style={{ padding:"1px 7px", borderRadius:20, background:BADGE_CLR[m.studio].bg, color:BADGE_CLR[m.studio].tx, fontSize:9, fontWeight:700, letterSpacing:.4 }}>{m.studio}</span>
          <span style={{ fontSize:10, color:"#52526a" }}>{m.year}</span>
          {note && !showCardNotes && <span style={{ width:5, height:5, borderRadius:"50%", background:"#ce93d8", flexShrink:0, marginLeft:2 }}/>}
        </div>

        {/* Title — 2-line clamp, never truncates with ellipsis on a single line */}
        <div style={{
          fontSize: mob?"clamp(15px,4.2vw,19px)":"clamp(15px,1.85vw,20px)",
          fontWeight:800, color:a?`${c.ac}70`:"#edeeff",
          lineHeight:1.22, letterSpacing:-.25,
          overflow:"hidden", display:"-webkit-box",
          WebkitLineClamp:2, WebkitBoxOrient:"vertical",
          transition:"color .18s",
        }}>{m.name}</div>

        {/* Stats row */}
        <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
          {meta?.runtime && <span style={{ fontSize:10, color:"#50506a", fontVariantNumeric:"tabular-nums" }}>{meta.runtime}</span>}
          {meta?.rating && <span style={{ fontSize:10, color:"#e5b800", fontWeight:700 }}>★ {meta.rating}</span>}
          {m.imdb && <a href={m.imdb} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ padding:"1px 5px", borderRadius:3, background:"#e5b80010", color:"#c49a00", fontSize:9, fontWeight:700, textDecoration:"none", border:"1px solid #e5b80018", letterSpacing:.3 }}>IMDb ↗</a>}
        </div>

        {/* Plot — desktop hover only (hidden when notes open) */}
        {!mob && !showCardNotes && meta?.plot && (
          <div style={{
            fontSize:11, color:"#7a7a9e", lineHeight:1.5,
            overflow:"hidden", display:"-webkit-box",
            WebkitLineClamp:3, WebkitBoxOrient:"vertical",
            maxHeight: h ? "54px" : "0px",
            opacity: h ? 1 : 0,
            transition:"opacity .2s, max-height .22s",
            marginTop: h ? 3 : 0,
          }}>{meta.plot}</div>
        )}

        {/* Trivia — only when notes are open */}
        {showCardNotes && FACTS[m.name] && (
          <div style={{
            fontSize:11, color:"#7a7a9e", lineHeight:1.55,
            marginTop:2,
          }}>{FACTS[m.name]}</div>
        )}

        {mob && <div style={{ fontSize:9, color:c.ac, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", opacity:.4 }}>Tap to pick</div>}
      </div>

      {/* Hover: left accent bar */}
      <div style={{ position:"absolute", left:0, top:"15%", bottom:"15%", width:3, background:`linear-gradient(180deg,transparent,${c.ac}cc,transparent)`, borderRadius:2, opacity:h&&!mob?1:0, transition:"opacity .18s" }}/>

      {/* Desktop pick hint — hidden when plot is showing to avoid overlap */}
      {h&&!mob&&!a&&!meta?.plot && <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:11, color:c.ac, fontWeight:700, letterSpacing:1, opacity:.7 }}>Pick →</div>}
    </button>

    <div style={{ textAlign:"center", marginTop:showCardNotes?0:(mob?3:3) }}>
      <button onClick={e=>{e.stopPropagation();setShowCardNotes(!showCardNotes);}} style={{
        background:"transparent", border:"none", color:"#7a7a9e", fontSize:mob?11:10, cursor:"pointer",
        padding:mob?"5px 14px":"2px 8px", letterSpacing:.5, minHeight:mob?32:undefined,
      }}>{showCardNotes ? "hide notes ▲" : "notes ▼"}</button>
    </div>
    {showCardNotes && <CardNotes seed={m.seed} note={note} updateNote={updateNote} ac={c.ac} bg={c.bg} mob={mob} transparent/>}
  </div>;
}

function TmdbModal({ onSave, onClose }) {
  const [tmdb, setTmdb] = useState(localStorage.getItem("tmdb-key") || "");
  const [omdb, setOmdb] = useState(localStorage.getItem("omdb-key") || "548162f0");
  const save = () => {
    if (tmdb.trim()) localStorage.setItem("tmdb-key", tmdb.trim());
    if (omdb.trim()) localStorage.setItem("omdb-key", omdb.trim());
    onSave(tmdb.trim(), omdb.trim());
  };
  return <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ background:"#12122a", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"28px 24px", maxWidth:440, width:"90%", animation:"su .2s" }}>
      <h3 style={{ color:"#f0f0ff", margin:"0 0 6px", fontSize:18 }}>Movie Posters, Ratings & Runtimes</h3>
      <p style={{ color:"#8a8aa8", fontSize:12, margin:"0 0 18px", lineHeight:1.6 }}>Keys stored locally, never sent anywhere else. Both are free.</p>

      <label style={{ display:"block", color:"#9898b8", fontSize:11, marginBottom:4, letterSpacing:.5 }}>
        TMDB API key (v3) — <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" style={{ color:"#4fc3f7" }}>get one here</a>
      </label>
      <input value={tmdb} onChange={e=>setTmdb(e.target.value)}
        placeholder="32-char hex..."
        style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.3)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"9px 12px", color:"#e0e0f0", fontFamily:"monospace", fontSize:12, outline:"none", marginBottom:14 }}/>

      <label style={{ display:"block", color:"#9898b8", fontSize:11, marginBottom:4, letterSpacing:.5 }}>
        OMDB API key — <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer" style={{ color:"#4fc3f7" }}>get one here</a>
        <span style={{ color:"#5a5a7e" }}> (for IMDb ratings + runtimes)</span>
      </label>
      <input value={omdb} onChange={e=>setOmdb(e.target.value)}
        placeholder="8-char hex..."
        style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.3)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"9px 12px", color:"#e0e0f0", fontFamily:"monospace", fontSize:12, outline:"none", marginBottom:18 }}/>

      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <Btn mob={false} s mu onClick={onClose}>Cancel</Btn>
        <Btn mob={false} s onClick={save}>Save & Fetch</Btn>
      </div>
    </div>
  </div>;
}

function AuthModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(null);
  const sendLink = async () => {
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    if (error) {
      setErr(error.status === 429 ? "Too many requests — wait a minute and try again." : error.message);
    } else {
      setSent(true);
    }
  };
  return <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ background:"#12122a", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"28px 24px", maxWidth:380, width:"90%", animation:"su .2s" }}>
      <h3 style={{ color:"#f0f0ff", margin:"0 0 8px", fontSize:18 }}>Sync Across Devices</h3>
      {sent ? (
        <p style={{ color:"#8a8aa8", fontSize:14, lineHeight:1.6 }}>Check your email for a magic link. Close this when you're signed in.</p>
      ) : (
        <>
          <p style={{ color:"#8a8aa8", fontSize:13, margin:"0 0 16px", lineHeight:1.6 }}>Enter your email — we'll send a link. Your bracket and notes sync automatically once you're signed in.</p>
          {err && <p style={{ color:"#ff8a65", fontSize:13, margin:"0 0 12px", lineHeight:1.5 }}>{err}</p>}
          <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendLink()} type="email" placeholder="you@example.com"
            style={{ width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.3)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"10px 12px", color:"#e0e0f0", fontSize:14, outline:"none", marginBottom:16 }}/>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <Btn mob={false} s mu onClick={onClose}>Cancel</Btn>
            <Btn mob={false} s onClick={sendLink}>Send Magic Link</Btn>
          </div>
        </>
      )}
      {sent && <div style={{ marginTop:12, textAlign:"right" }}><Btn mob={false} s mu onClick={onClose}>Close</Btn></div>}
    </div>
  </div>;
}

function CardNotes({ seed, note, updateNote, ac, bg, mob, transparent }) {
  return <div style={{
    background: transparent ? "transparent" : `linear-gradient(155deg,${bg}ee,${bg}cc)`,
    border: transparent ? "none" : `1px solid ${ac}22`,
    borderTop:"none",
    borderRadius: transparent ? 0 : "0 0 14px 14px",
    padding:mob?"10px 14px 14px":"10px 14px 12px",
  }}>
    <textarea
      value={note}
      onChange={e => updateNote(seed, e.target.value)}
      onClick={e => e.stopPropagation()}
      placeholder="Your thoughts..."
      rows={2}
      style={{
        width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.25)", border:"1px solid rgba(255,255,255,.08)",
        borderRadius:8, padding:mob?"8px 10px":"6px 8px", color:"#d0d0e8", fontSize:mob?15:11, fontFamily:"inherit",
        resize:"vertical", outline:"none", lineHeight:1.5,
      }}
      onFocus={e => e.target.style.borderColor=`${ac}44`}
      onBlur={e => e.target.style.borderColor="rgba(255,255,255,.08)"}
    />
  </div>;
}

function NotesPanel({ notes, updateNote, mob }) {
  const [filter, setFilter] = useState("");
  const filtered = BRACKET_ORDER.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()));
  return <div style={{
    marginBottom:mob?20:24, padding:mob?16:20, background:"rgba(255,255,255,.03)", borderRadius:mob?14:16,
    border:"1px solid rgba(206,147,216,.15)", animation:"fi .3s",
  }}>
    <div style={{ marginBottom:mob?12:14 }}>
      <h3 style={{ fontSize:mob?16:15, fontWeight:700, color:"#ce93d8", margin:0, letterSpacing:.5 }}>Movie Notes</h3>
    </div>

    <input
      value={filter}
      onChange={e => setFilter(e.target.value)}
      placeholder="Search movies..."
      style={{
        width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.06)",
        borderRadius:10, padding:mob?"12px 14px":"8px 12px", color:"#d0d0e8", fontSize:mob?16:12, fontFamily:"inherit",
        outline:"none", marginBottom:mob?12:12,
      }}
      onFocus={e => e.target.style.borderColor="rgba(206,147,216,.3)"}
      onBlur={e => e.target.style.borderColor="rgba(255,255,255,.06)"}
    />

    <div style={{ maxHeight:mob?320:400, overflowY:"auto", paddingRight:4, WebkitOverflowScrolling:"touch" }}>
      {filtered.map(m => {
        const note = notes[m.seed] || "";
        const c = CLR[m.studio];
        return <NoteRow key={m.seed} m={m} note={note} c={c} updateNote={updateNote} mob={mob}/>;
      })}
    </div>
  </div>;
}

function NoteRow({ m, note, c, updateNote, mob }) {
  const [open, setOpen] = useState(false);
  return <div style={{
    marginBottom:mob?6:6, background:"rgba(255,255,255,.02)", borderRadius:mob?10:10,
    border:`1px solid ${note?`${c.ac}18`:"rgba(255,255,255,.04)"}`,
  }}>
    <button onClick={()=>setOpen(!open)} style={{
      width:"100%", background:"transparent", border:"none", cursor:"pointer",
      display:"flex", alignItems:"center", gap:mob?8:8, padding:mob?"12px 12px":"8px 12px", textAlign:"left",
      minHeight:mob?48:undefined, WebkitTapHighlightColor:"transparent",
    }}>
      <span style={{ fontSize:mob?10:8, fontWeight:700, color:c.ac, opacity:.6, width:mob?24:24, flexShrink:0 }}>#{m.seed}</span>
      <span style={{ fontSize:mob?14:12, fontWeight:600, color:"#d0d0e8", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.name}</span>
      {!mob && <span style={{ fontSize:9, color:c.tx, opacity:.5 }}>{m.studio} · {m.year}</span>}
      {note && <span style={{ width:6, height:6, borderRadius:"50%", background:"#ce93d8", flexShrink:0 }}/>}
      <span style={{ fontSize:mob?11:9, color:"#6a6a8e", flexShrink:0 }}>{open?"▲":"▼"}</span>
    </button>
    {open && <div style={{ padding:mob?"0 12px 12px":"0 12px 10px" }}>
      <textarea
        value={note}
        onChange={e => updateNote(m.seed, e.target.value)}
        placeholder={`Thoughts on ${m.name}...`}
        rows={2}
        style={{
          width:"100%", boxSizing:"border-box", background:"rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.06)",
          borderRadius:8, padding:mob?"8px 10px":"6px 8px", color:"#d0d0e8", fontSize:mob?15:11, fontFamily:"inherit",
          resize:"vertical", outline:"none", lineHeight:1.5,
        }}
        onFocus={e => e.target.style.borderColor=`${c.ac}44`}
        onBlur={e => e.target.style.borderColor="rgba(255,255,255,.06)"}
      />
    </div>}
  </div>;
}

function Dots({ mob }) {
  const dots = mob ? DOTS.slice(0, 40) : DOTS;
  return <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
    {dots.map((d,i) => <div key={i} style={{
      position:"absolute", width:d.w, height:d.h,
      background:`rgba(255,255,255,${d.op})`, borderRadius:"50%",
      left:`${d.l}%`, top:`${d.t}%`,
      animation:`tw ${d.dur}s ease-in-out infinite`, animationDelay:`${d.del}s`,
    }}/>)}
  </div>;
}

function Btn({ children, onClick, p, s, mu, mob }) {
  return <button className={mob?"mob-btn":""} onClick={onClick} style={{
    background: p?"linear-gradient(135deg,#4fc3f7,#2196f3)":mu?"rgba(255,255,255,.03)":"rgba(255,255,255,.06)",
    border: p?"none":`1px solid rgba(255,255,255,${mu?.06:.1})`,
    color: p?"#fff":mu?"#6a6a8e":"#b0b0cc",
    padding: s?(mob?"10px 18px":"6px 16px"):(mob?"14px 26px":"10px 24px"), borderRadius:10,
    fontSize: s?(mob?13:12):(mob?15:14), fontWeight:p?700:600, cursor:"pointer",
    minHeight:mob?48:undefined, transition:"all .15s", WebkitTapHighlightColor:"transparent",
  }}>{children}</button>;
}

function BV({ pi, rds, cr, cm, mob }) {
  return <div style={{ marginTop:mob?20:28, padding:mob?14:16, background:"rgba(255,255,255,.03)", borderRadius:mob?12:14, border:"1px solid rgba(255,255,255,.06)", textAlign:"left", animation:"fi .3s" }}>
    <h3 style={{ fontSize:mob?15:14, fontWeight:700, color:"#b8b8d0", margin:mob?"0 0 12px":"0 0 14px", letterSpacing:1 }}>Bracket Results</h3>
    <RB t="Play-In Round" ms={pi} g mob={mob}/>
    {rds.map((r,i) => <RB key={i} t={RND[i]} ms={r} cr={cr} cm={cm} ri={i} mob={mob}/>)}
  </div>;
}

function RB({ t, ms, g, cr, cm, ri, mob }) {
  return <div style={{ marginBottom:mob?14:16 }}>
    <div style={{ fontSize:mob?11:10, letterSpacing:mob?2:2.5, textTransform:"uppercase", color:g?"#4fc3f7":"#6a6a8e", marginBottom:mob?6:6, fontWeight:700, opacity:g?.7:1 }}>{t}</div>
    {ms.map((m,mi) => {
      const w=m.winner, cur=ri===cr&&mi===cm;
      return <div key={mi} style={{ display:"flex", alignItems:"center", gap:mob?6:6, fontSize:mob?13:12, padding:mob?"5px 8px":"3px 8px", borderRadius:6, background:cur?"rgba(79,195,247,.08)":"transparent" }}>
        <MN m={m[0]} w={w} r mob={mob}/><span style={{ color:"#3a3a55", fontSize:mob?10:9, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w} mob={mob}/>
      </div>;
    })}
  </div>;
}

function MN({ m, w, r, mob, upset }) {
  const won=w?.seed===m.seed, lost=w&&!won;
  const winColor = upset ? "#ff8a65" : "#4fc3f7";
  return <span style={{ color:won?winColor:lost?"#4a4a65":"#8a8aa8", fontWeight:won?700:400, flex:1, textAlign:r?"right":"left", textDecoration:lost?"line-through":"none", opacity:lost?.5:1, overflow:mob?"hidden":undefined, textOverflow:mob?"ellipsis":undefined, whiteSpace:mob?"nowrap":undefined }}>{m.name}</span>;
}

function FullBracket({ piM, rds, m64, cr, cm, ip, mob, upsets }) {
  const hasM64 = m64.length >= 64;
  const r1Display = R1.map(([a,b],i) => {
    if (hasM64) return { a: m64[a], b: m64[b], region: Math.floor(i/8) };
    const ma = a < 58 ? MAIN[a] : null;
    const mb = b < 58 ? MAIN[b] : null;
    return { a: ma, b: mb, region: Math.floor(i/8), aSlot: a, bSlot: b };
  });

  const r1Played = rds[0] || [];

  const regionStyle = { marginBottom:mob?16:20 };
  const headStyle = { fontSize:mob?12:11, letterSpacing:mob?1.5:2, textTransform:"uppercase", fontWeight:700, marginBottom:mob?8:8, paddingBottom:mob?6:6, borderBottom:"1px solid rgba(255,255,255,.06)" };
  const regColors = ["#4fc3f7","#ce93d8","#ff8a65","#4fc3f7"];
  const rowFs = mob ? 13 : 12;
  const rowPad = mob ? "5px 8px" : "4px 8px";
  const rowGap = mob ? 6 : 6;
  const vsFs = mob ? 10 : 9;
  const ellipsis = mob ? { overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } : {};

  const piLabel = (slot) => {
    const piIdx = slot - 58;
    const pair = PIP[piIdx];
    if (!pair) return "TBD";
    const a = PLAYIN[pair[0]], b = PLAYIN[pair[1]];
    const match = piM[piIdx];
    if (match?.winner) return match.winner.name;
    return `${a.name} / ${b.name}`;
  };

  return <div style={{ marginBottom:mob?20:28, padding:mob?14:20, background:"rgba(255,255,255,.03)", borderRadius:mob?14:16, border:"1px solid rgba(255,255,255,.06)", animation:"fi .3s" }}>
    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", flexWrap:"wrap", gap:8, margin:"0 0 6px" }}>
      <h3 style={{ fontSize:mob?16:16, fontWeight:700, color:"#d0d0e8", margin:0, letterSpacing:.5 }}>Full Bracket</h3>
      {upsets?.length > 0 && <span style={{ fontSize:mob?11:10, color:"#ff8a65", opacity:.8, letterSpacing:1 }}>⚡ {upsets.length} upset{upsets.length!==1?"s":""}</span>}
    </div>
    <div style={{ fontSize:mob?13:12, color:"#7a7a9e", marginBottom:mob?16:20 }}>{mob?"4 regions · Final Four · Championship":"70 movies · 4 regions · Winners from each region meet in the Final Four"}</div>

    <div style={regionStyle}>
      <div style={{ ...headStyle, color:"#4fc3f7", opacity:.8 }}>🎬 Play-In Round</div>
      {piM.map((m,i) => {
        const w = m.winner;
        const isUpset = w && w.seed > (w.seed===m[0].seed ? m[1] : m[0]).seed;
        return <div key={i} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background: ip&&i===0&&!w ? "rgba(79,195,247,.06)" : "transparent" }}>
          <MN m={m[0]} w={w} r mob={mob} upset={isUpset&&w?.seed===m[0].seed}/><span style={{ color:"#3a3a55", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w} mob={mob} upset={isUpset&&w?.seed===m[1].seed}/>
          {w && <span style={{ fontSize:vsFs, color:isUpset?"#ff8a65":"#4fc3f7", opacity:.6, marginLeft:mob?2:4 }}>{isUpset?"⚡":"✓"}</span>}
        </div>;
      })}
    </div>

    {REG.map((regName, regIdx) => {
      const matches = r1Display.slice(regIdx*8, regIdx*8+8);
      const played = r1Played.slice(regIdx*8, regIdx*8+8);
      return <div key={regIdx} style={regionStyle}>
        <div style={{ ...headStyle, color:regColors[regIdx] }}>{regName}</div>
        {matches.map((mu, mi) => {
          const p = played[mi];
          const w = p?.winner;
          const aName = mu.a ? mu.a.name : piLabel(mu.aSlot);
          const bName = mu.b ? mu.b.name : piLabel(mu.bSlot);
          const aSeed = mu.a?.seed;
          const bSeed = mu.b?.seed;
          const isCurrentMatch = !ip && cr===0 && cm===regIdx*8+mi;
          const isUpset = w && w.seed > (w.seed===aSeed ? bSeed : aSeed);
          const winColor = isUpset ? "#ff8a65" : "#4fc3f7";
          return <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCurrentMatch?"rgba(79,195,247,.06)":"transparent" }}>
            <span style={{
              flex:1, textAlign:"right", ...ellipsis,
              color: w?.seed===aSeed?winColor : w&&w.seed!==aSeed?"#4a4a65" : p?"#8a8aa8":"#7a7a9e",
              fontWeight: w?.seed===aSeed?700:400,
              textDecoration: w&&w.seed!==aSeed?"line-through":"none",
              opacity: w&&w.seed!==aSeed?.4:1,
              fontStyle: !mu.a?"italic":"normal",
            }}>{!mob&&aSeed?`#${aSeed} `:""}{aName}</span>
            <span style={{ color:"#3a3a55", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span>
            <span style={{
              flex:1, ...ellipsis,
              color: w?.seed===bSeed?winColor : w&&w.seed!==bSeed?"#4a4a65" : p?"#8a8aa8":"#7a7a9e",
              fontWeight: w?.seed===bSeed?700:400,
              textDecoration: w&&w.seed!==bSeed?"line-through":"none",
              opacity: w&&w.seed!==bSeed?.4:1,
              fontStyle: !mu.b?"italic":"normal",
            }}>{bName}{!mob&&bSeed?` #${bSeed}`:""}</span>
            {w && <span style={{ fontSize:vsFs, color:isUpset?"#ff8a65":"#4fc3f7", opacity:.6, marginLeft:2 }}>{isUpset?"⚡":"✓"}</span>}
          </div>;
        })}
      </div>;
    })}

    {rds.slice(1).map((rd, rdIdx) => {
      const roundNum = rdIdx + 1;
      return <div key={roundNum} style={regionStyle}>
        <div style={{ ...headStyle, color:"#b8b8d0" }}>{RND[roundNum]}</div>
        {rd.map((m, mi) => {
          const w = m.winner;
          const isUpset = w && w.seed > (w.seed===m[0].seed ? m[1] : m[0]).seed;
          const isCur = !ip && cr===roundNum && cm===mi;
          return <div key={mi} style={{ display:"flex", alignItems:"center", gap:rowGap, fontSize:rowFs, padding:rowPad, borderRadius:6, background:isCur?"rgba(79,195,247,.06)":"transparent" }}>
            <MN m={m[0]} w={w} r mob={mob} upset={isUpset&&w?.seed===m[0].seed}/><span style={{ color:"#3a3a55", fontSize:vsFs, letterSpacing:1, flexShrink:0 }}>vs</span><MN m={m[1]} w={w} mob={mob} upset={isUpset&&w?.seed===m[1].seed}/>
            {w && <span style={{ fontSize:vsFs, color:isUpset?"#ff8a65":"#4fc3f7", opacity:.6, marginLeft:2 }}>{isUpset?"⚡":"✓"}</span>}
          </div>;
        })}
      </div>;
    })}
  </div>;
}

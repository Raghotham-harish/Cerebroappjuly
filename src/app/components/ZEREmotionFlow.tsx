import { useState } from "react";
import { ArrowLeft, X, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Emotion catalogue ────────────────────────────────────────────────────────
const CAT: Record<string, { n: string; c: string; g: [string, string[]][] }> = {
  bad:       { n: "Bad",       c: "#22A57F", g: [["Tired",    ["Sleepy","Unfocused"]], ["Stressed",  ["Out of control","Overwhelmed"]], ["Busy",       ["Pressured","Rushed"]], ["Bored",      ["Indifferent","Apathetic"]]] },
  sad:       { n: "Sad",       c: "#3E7BC9", g: [["Lonely",   ["Isolated","Abandoned"]], ["Vulnerable",["Victimised","Fragile"]], ["Despair",   ["Grief","Powerless"]], ["Guilty",     ["Ashamed","Remorseful"]], ["Depressed", ["Empty","Inferior"]], ["Hurt",       ["Let down by someone","Embarrassed"]]] },
  disgusted: { n: "Disgusted", c: "#6F7488", g: [["Disapproving",["Judgmental","Uncomfortable"]], ["Disappointed",["Appalled","Revolted"]], ["Awful",      ["Nauseated","Detestable"]], ["Repelled",   ["Horrified","Hesitant"]]] },
  angry:     { n: "Angry",     c: "#D64A44", g: [["Let down", ["Betrayed","Resentful"]], ["Humiliated",["Disrespected","Ridiculed"]], ["Bitter",     ["Indignant","Violated"]], ["Mad",        ["Furious","Jealous"]], ["Aggressive", ["Provoked","Hostile"]], ["Frustrated", ["Infuriated","Annoyed"]], ["Distant",    ["Withdrawn","Numb"]], ["Critical",   ["Sceptical","Dismissive"]]] },
  fearful:   { n: "Fearful",   c: "#DB7C2A", g: [["Scared",   ["Helpless","Frightened"]], ["Anxious",   ["On edge","Worried"]], ["Insecure",   ["Inadequate","Not good enough"]], ["Weak",       ["Worthless","Insignificant"]], ["Rejected",   ["Excluded","Persecuted"]], ["Threatened", ["Nervous","Exposed"]]] },
  happy:     { n: "Happy",     c: "#E9A81F", g: [["Playful",  ["Energised","Cheeky"]], ["Content",    ["Free","Joyful"]], ["Interested", ["Curious","Inquisitive"]], ["Proud",      ["Successful","Confident"]], ["Accepted",   ["Respected","Valued"]], ["Powerful",   ["Courageous","Creative"]], ["Peaceful",   ["Loving","Thankful"]], ["Trusting",   ["Sensitive","Intimate"]], ["Optimistic", ["Hopeful","Inspired"]]] },
  surprised: { n: "Surprised", c: "#8B6FD0", g: [["Startled", ["Shocked","Dismayed"]], ["Confused",   ["Disillusioned","Perplexed"]], ["Amazed",     ["Astonished","Awe"]], ["Excited",    ["Eager","Energetic"]]] },
};

// ─── Zone config ──────────────────────────────────────────────────────────────
type ZoneKey = "hi" | "lo" | "zn";
const ZONES: Record<ZoneKey, { name: string; tag: string; desc: string; cats: string[]; c: string; bg: string; border: string }> = {
  hi: { name: "High Zone",    tag: "Hyper-arousal", desc: "Panic, rage, edginess, racing thoughts",   cats: ["disgusted","angry","fearful"], c: "#F97316", bg: "#FFF7ED", border: "#FED7AA" },
  lo: { name: "Low Zone",     tag: "Hypo-arousal",  desc: "Numbness, exhaustion, low mood, flatness", cats: ["bad","sad"],                   c: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  zn: { name: "In the zone",  tag: "Regulated",     desc: "Calm, focused, able to think and adapt",   cats: ["happy","surprised"],           c: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
};

// ─── Step sequences per zone ──────────────────────────────────────────────────
type StepId = "zone" | "words" | "settle" | "meaning" | "awareness" |
              "contextTrigger" | "contextHelps" | "contextDoable" | "contextWho" |
              "support" | "recheck";
const SEQUENCES: Record<ZoneKey, StepId[]> = {
  hi: ["zone","words","settle","meaning","awareness","contextTrigger","contextHelps","support","recheck"],
  lo: ["zone","words","meaning","awareness","contextDoable","contextWho","support","recheck"],
  zn: ["zone","words","meaning","awareness","support","recheck"],
};

// ─── Word meanings ────────────────────────────────────────────────────────────
const MEAN: Record<string, string> = {
  Sleepy:"Your body wants rest. Nothing complicated about it.", Unfocused:"You are running low and it is hard to think straight.",
  "Out of control":"Things are moving and you are not the one steering.", Overwhelmed:"More is coming at you than you can take at once.",
  Pressured:"There is a lot on you and not much give.", Rushed:"You are going fast and still falling behind.",
  Indifferent:"You are not feeling much about it either way.", Apathetic:"It is hard to care about much right now.",
  Isolated:"You are on your own and it is starting to weigh.", Abandoned:"It feels like people are not there for you.",
  Victimised:"Something happened to you that you did not choose.", Fragile:"It feels like not much more would tip you over.",
  Grief:"You have lost something and it is still raw.", Powerless:"You cannot see a way to change any of it.",
  Ashamed:"You do not feel good about who you were in it.", Remorseful:"You wish you had done it differently.",
  Empty:"There is not much in there right now.", Inferior:"You feel like less than the people around you.",
  "Let down by someone":"Someone did not come through and it stung.", Embarrassed:"Something exposed you and you are still sore about it.",
  Judgmental:"This does not sit right with you.", Uncomfortable:"You would rather not be near this.",
  Appalled:"You did not think it would go this way.", Revolted:"It is worse than you expected and it turns your stomach.",
  Nauseated:"This is hard to even sit with.", Detestable:"You want nothing to do with it.",
  Horrified:"Something shook you badly.", Hesitant:"Something is telling you to hold back.",
  Betrayed:"Someone you trusted did not come through.", Resentful:"You are still carrying something someone did.",
  Disrespected:"You were not treated the way you should have been.", Ridiculed:"You were made to look small in front of people.",
  Indignant:"Something unfair happened and it is not settled.", Violated:"A line got crossed that should not have been.",
  Furious:"The anger is hot and right at the surface.", Jealous:"Someone has something you wanted.",
  Provoked:"Something pushed you and you are ready to push back.", Hostile:"You are braced for a fight.",
  Infuriated:"You have been blocked one time too many.", Annoyed:"Something keeps getting in your way.",
  Withdrawn:"You have stepped back from people on purpose.", Numb:"You have stopped feeling much of anything.",
  Sceptical:"You are not buying it.", Dismissive:"You have already written it off.",
  Helpless:"Something is wrong and you cannot see what you could do.", Frightened:"Something feels genuinely unsafe.",
  "On edge":"You cannot settle. Everything feels a bit too close.", Worried:"Your mind keeps running ahead to what could go wrong.",
  Inadequate:"You are not sure you are enough for what is being asked.", "Not good enough":"You are measuring yourself against others and coming up short.",
  Worthless:"It is hard to see what you bring right now.", Insignificant:"You feel easy to overlook.",
  Excluded:"You are on the outside of something you wanted to be in.", Persecuted:"It feels like you are being singled out.",
  Nervous:"Something is coming and you are braced for it.", Exposed:"You are out in the open with no cover.",
  Energised:"You have energy and you want to use it.", Cheeky:"You are in a mischievous mood.",
  Free:"Nothing is holding you down right now.", Joyful:"Things feel good, plain and simple.",
  Curious:"Something has caught your attention.", Inquisitive:"You want to dig in and find out more.",
  Successful:"Something you worked for came off.", Confident:"You trust yourself right now.",
  Respected:"People here take you seriously.", Valued:"You matter to the people around you.",
  Courageous:"You are ready to do the hard thing.", Creative:"Ideas are coming and you want to build something.",
  Loving:"You feel close to people.", Thankful:"You are glad about what you have got.",
  Sensitive:"You are open and tuned in.", Intimate:"You feel safe being close to someone.",
  Hopeful:"You think things can work out.", Inspired:"Something has lit you up and you want to act on it.",
  Shocked:"Something hit you out of nowhere.", Dismayed:"Something happened and it was not what you wanted.",
  Disillusioned:"Something you believed in did not hold up.", Perplexed:"You cannot make sense of it yet.",
  Astonished:"You did not think that was possible.", Awe:"Something was bigger than you expected.",
  Eager:"You cannot wait to get going.", Energetic:"You have energy and want to move.",
};

const FLAG = new Set(["Worthless","Powerless","Grief","Empty","Numb","Isolated","Abandoned","Ashamed","Victimised","Helpless","Insignificant","Apathetic","Persecuted"]);

// ─── Emotion shape display (cloud / mountain / house by zone) ────────────────
function EmotionShapeDisplay({ words, own, zone }: { words: string[]; own: string[]; zone: ZoneKey }) {
  const z = ZONES[zone];
  const all = [...words, ...own];
  if (all.length === 0) return null;

  // SVG shape path per zone
  const shapes = {
    hi: { label: "Your feelings, like a mountain", svgPath: "M 100,12 L 188,168 L 12,168 Z", viewBox: "0 0 200 180" },
    lo: { label: "Your feelings, like a cloud",    svgPath: "M 60,100 Q 40,100 40,82 Q 40,64 58,62 Q 58,40 80,38 Q 100,20 122,38 Q 144,36 150,58 Q 168,58 168,76 Q 168,96 148,98 Q 148,118 124,118 Q 110,126 94,118 Q 72,120 60,100 Z", viewBox: "0 0 210 150" },
    zn: { label: "Your feelings, at home",          svgPath: "M 100,10 L 188,60 L 188,170 L 12,170 L 12,60 Z", viewBox: "0 0 200 180" },
  };
  const s = shapes[zone];

  return (
    <div className="mb-4">
      <p className="text-xs text-center mb-2" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF", fontStyle: "italic" }}>
        {s.label}
      </p>
      <div className="relative" style={{ minHeight: 130 }}>
        {/* Shape SVG backdrop */}
        <div className="absolute inset-0 flex justify-center">
          <svg viewBox={s.viewBox} style={{ width: "100%", maxWidth: 240, opacity: 0.22 }}>
            <path d={s.svgPath} fill={z.c} />
          </svg>
        </div>
        {/* Words overlaid, centred */}
        <div className="relative flex flex-wrap gap-1.5 justify-center items-center px-10 py-8">
          {all.map((w, i) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 320, damping: 22 }}
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: z.c, color: "white", fontFamily: "Inter, sans-serif", fontSize: "11px" }}
            >
              {w}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function wordsFor(z: ZoneKey): { w: string; secondary: string; catName: string; c: string }[] {
  return ZONES[z].cats.flatMap(catKey => {
    const cat = CAT[catKey];
    return cat.g.flatMap(([secondary, ws]) => ws.map(w => ({ w, secondary, catName: cat.n, c: cat.c })));
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function OptionRow({ label, selected, color, onToggle }: { label: string; selected: boolean; color: string; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left mb-2 transition-all"
      style={{
        background: selected ? `${color}10` : "white",
        border: `1.5px solid ${selected ? color : "#E5E7EB"}`,
      }}
    >
      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{ borderColor: selected ? color : "#D1D5DB", background: selected ? color : "transparent" }}>
        {selected && <Check className="w-3 h-3" style={{ color: "white", strokeWidth: 2.5 }} />}
      </div>
      <span className="text-sm flex-1" style={{ fontFamily: "Inter, sans-serif", color: selected ? "#15113C" : "#374151" }}>{label}</span>
    </button>
  );
}

function OptionGroup({ label, options, pickKey, picks, onToggle, color, onAdd }: {
  label: string; options: string[]; pickKey: string; picks: Record<string, string[]>;
  onToggle: (k: string, v: string) => void; color: string; onAdd: (k: string, v: string) => void;
}) {
  const [input, setInput] = useState("");
  const selected = picks[pickKey] || [];
  return (
    <div className="mb-5">
      {label && <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF", letterSpacing: "0.08em" }}>{label}</p>}
      {options.map(opt => (
        <OptionRow key={opt} label={opt} selected={selected.includes(opt)} color={color} onToggle={() => onToggle(pickKey, opt)} />
      ))}
      <div className="flex gap-2 mt-1">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && input.trim()) { onAdd(pickKey, input.trim()); setInput(""); } }}
          placeholder="Something else? Type it here"
          className="flex-1 px-3 py-2.5 rounded-xl text-sm border"
          style={{ fontFamily: "Inter, sans-serif", background: "#F9FAFB", border: "1.5px dashed #D1D5DB", outline: "none" }}
        />
        <button
          onClick={() => { if (input.trim()) { onAdd(pickKey, input.trim()); setInput(""); } }}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "#15113C", color: "white", fontFamily: "Inter, sans-serif" }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Public result type ───────────────────────────────────────────────────────
export interface ZERFlowResult {
  zone: ZoneKey;
  words: string[];
  own: string[];
  picks: Record<string, string[]>;
  summary: string;
}

// ─── Main component ───────────────────────────────────────────────────────────
interface ZEREmotionFlowProps {
  initialZone?: ZoneKey;
  onComplete: (result: ZERFlowResult) => void;
  onClose: () => void;
}

export function ZEREmotionFlow({ initialZone, onComplete, onClose }: ZEREmotionFlowProps) {
  const [zone, setZone] = useState<ZoneKey | null>(initialZone ?? null);
  const [words, setWords] = useState<string[]>([]);
  const [own, setOwn] = useState<string[]>([]);
  const [picks, setPicks] = useState<Record<string, string[]>>({});
  const [afterZone, setAfterZone] = useState<ZoneKey | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [ownInput, setOwnInput] = useState("");
  const [catPage, setCatPage] = useState(0);

  const seq: StepId[] = zone ? SEQUENCES[zone] : ["zone"];
  const currentStep = seq[Math.min(stepIdx, seq.length - 1)];
  const totalSteps = zone ? SEQUENCES[zone].length : 1;

  const next = () => setStepIdx(i => Math.min(i + 1, seq.length - 1));
  const back = () => {
    if (stepIdx === 0) { onClose(); return; }
    setStepIdx(i => i - 1);
  };

  const toggleWord = (w: string) => setWords(ws => ws.includes(w) ? ws.filter(x => x !== w) : [...ws, w]);
  const addOwn = (v: string) => { if (v.trim()) setOwn(o => [...o, v.trim()]); };
  const togglePick = (key: string, val: string) =>
    setPicks(p => ({ ...p, [key]: (p[key] || []).includes(val) ? (p[key] || []).filter(x => x !== val) : [...(p[key] || []), val] }));
  const addPick = (key: string, val: string) =>
    setPicks(p => ({ ...p, [key]: [...(p[key] || []), val] }));

  const allWords = [...words, ...own];
  const flagged = words.some(w => FLAG.has(w));
  const z = zone ? ZONES[zone] : null;

  const handleComplete = () => {
    const summary = allWords.slice(0, 3).join(", ") + (zone ? ` · ${ZONES[zone].tag}` : "");
    onComplete({ zone: zone!, words, own, picks, summary });
  };

  // ─── Screens ────────────────────────────────────────────────────────────────

  const ZoneScreen = () => (
    <div className="px-5 py-6">
      <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", letterSpacing: "0.1em" }}>CHECK IN</p>
      <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Where are you sitting right now?</h2>
      <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>Not how you think you should be. Just where you actually are.</p>

      <div className="space-y-3 mb-5">
        {(["hi","zn","lo"] as ZoneKey[]).map(k => {
          const zz = ZONES[k];
          const isOn = zone === k;
          return (
            <button key={k} onClick={() => { setZone(k); setWords([]); setOwn([]); setCatPage(0); }}
              className="w-full p-4 rounded-2xl text-left transition-all"
              style={{ background: isOn ? zz.bg : "white", border: `2px solid ${isOn ? zz.c : "#E5E7EB"}` }}
            >
              <span className="block text-sm font-bold mb-0.5" style={{ fontFamily: "Inter, sans-serif", color: isOn ? zz.c : "#15113C" }}>{zz.name}</span>
              <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: isOn ? zz.c : "#6B7280", opacity: isOn ? 1 : 0.85 }}>{zz.tag} — {zz.desc}</span>
            </button>
          );
        })}
      </div>

      {zone && (
        <>
          <div className="px-4 py-3 rounded-2xl mb-4" style={{ background: z!.bg, border: `1px solid ${z!.border}` }}>
            <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: z!.c, lineHeight: 1.55 }}>
              Next you will see words that usually sit in this zone — {ZONES[zone].cats.map(c => CAT[c].n).join(", ")}.
            </p>
          </div>
          <button onClick={next} className="w-full py-3.5 rounded-2xl text-sm font-semibold" style={{ background: z!.c, color: "white", fontFamily: "Inter, sans-serif" }}>
            Show me the words →
          </button>
        </>
      )}
    </div>
  );

  const WordsScreen = () => {
    if (!zone) return null;
    const catKeys = ZONES[zone].cats;
    const currentCatKey = catKeys[catPage];
    const cat = CAT[currentCatKey];
    const isLastCat = catPage === catKeys.length - 1;

    return (
      <div className="px-5 py-6">
        {/* Category progress pills */}
        <div className="flex gap-1.5 mb-4">
          {catKeys.map((k, i) => (
            <div key={k} className="flex-1 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i <= catPage ? cat.c : "#E5E7EB" }} />
          ))}
        </div>

        <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: cat.c, letterSpacing: "0.1em" }}>
          {cat.n.toUpperCase()} · {catPage + 1} OF {catKeys.length}
        </p>
        <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>
          Do any of these land?
        </h2>
        <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>
          Pick any that fit. More than one is fine.
        </p>

        <div className="space-y-4 mb-4">
          {cat.g.map(([secondary, ws]) => (
            <div key={secondary}>
              <p className="text-xs mb-2" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
                When it feels more like <span style={{ fontWeight: 600 }}>{secondary.toLowerCase()}</span>…
              </p>
              <div className="flex flex-wrap gap-2">
                {ws.map(w => {
                  const sel = words.includes(w);
                  return (
                    <button key={w} onClick={() => toggleWord(w)}
                      className="px-3.5 py-1.5 rounded-full text-sm transition-all"
                      style={{
                        background: sel ? cat.c : "white",
                        color: sel ? "white" : "#374151",
                        border: `1.5px solid ${sel ? cat.c : "#E5E7EB"}`,
                        fontFamily: "Inter, sans-serif", fontWeight: sel ? 600 : 400,
                      }}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Add own word */}
        <div className="flex gap-2 mb-3">
          <input value={ownInput} onChange={e => setOwnInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && ownInput.trim()) { addOwn(ownInput); setOwnInput(""); } }}
            placeholder="None of these? Say it your way"
            className="flex-1 px-3 py-2.5 rounded-xl text-sm"
            style={{ fontFamily: "Inter, sans-serif", background: "#F9FAFB", border: "1.5px dashed #D1D5DB", outline: "none" }}
          />
          <button onClick={() => { if (ownInput.trim()) { addOwn(ownInput); setOwnInput(""); } }}
            className="px-4 py-2.5 rounded-xl" style={{ background: "#15113C", color: "white" }}>
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {own.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {own.map(w => (
              <div key={w} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#EDE9FE", border: "1.5px solid #C4B5FD" }}>
                <span className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#6D28D9" }}>{w}</span>
                <button onClick={() => setOwn(o => o.filter(x => x !== w))}><X className="w-3 h-3" style={{ color: "#8B5CF6" }} /></button>
              </div>
            ))}
          </div>
        )}

        {/* Shape display + CTA on last category */}
        {isLastCat && allWords.length > 0 && (
          <>
            <EmotionShapeDisplay words={words} own={own} zone={zone} />
            <div className="px-4 py-2.5 rounded-2xl mb-3" style={{ background: z!.bg, border: `1px solid ${z!.border}` }}>
              <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: z!.c }}>
                You picked: <strong>{allWords.join(", ")}</strong>
              </p>
            </div>
          </>
        )}

        {isLastCat ? (
          <>
            <button onClick={next}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold mb-2"
              style={{ background: allWords.length > 0 ? z!.c : "#9CA3AF", color: "white", fontFamily: "Inter, sans-serif" }}>
              {allWords.length > 0 ? "That is about right →" : "Nothing lands — carry on →"}
            </button>
          </>
        ) : (
          <button
            onClick={() => setCatPage(p => p + 1)}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: cat.c, color: "white", fontFamily: "Inter, sans-serif" }}
          >
            Next: {CAT[catKeys[catPage + 1]].n} →
          </button>
        )}
      </div>
    );
  };

  const SettleScreen = () => (
    <div className="px-5 py-6">
      <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: z!.c, letterSpacing: "0.1em" }}>BEFORE ANYTHING ELSE</p>
      <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Want to take a minute first?</h2>
      <p className="text-sm mb-6" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", lineHeight: 1.6 }}>
        When things are running this hot, thinking it through is hard. Settling your body first usually makes the rest easier. Sixty seconds.
      </p>

      {/* Breathing circle */}
      <div className="flex justify-center mb-5">
        <motion.div
          animate={{ scale: [0.82, 1.1, 0.82] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{ background: z!.bg, border: `2px solid ${z!.border}` }}
        >
          <span className="text-sm font-semibold" style={{ fontFamily: "Inter, sans-serif", color: z!.c }}>breathe</span>
        </motion.div>
      </div>

      <div className="px-4 py-3 rounded-2xl mb-6" style={{ background: z!.bg, border: `1px solid ${z!.border}` }}>
        <p className="text-xs text-center" style={{ fontFamily: "Inter, sans-serif", color: z!.c }}>In for four · hold for four · out for six. Follow the circle.</p>
      </div>

      <button onClick={next} className="w-full py-3.5 rounded-2xl text-sm font-semibold mb-2" style={{ background: z!.c, color: "white", fontFamily: "Inter, sans-serif" }}>
        I did that — carry on
      </button>
      <button onClick={next} className="w-full py-2.5 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
        Skip it, I want to talk it out
      </button>
    </div>
  );

  const MeaningScreen = () => {
    const items = words.map(w => ({ w, meaning: MEAN[w] || "" }));
    return (
      <div className="px-5 py-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", letterSpacing: "0.1em" }}>WHAT IT MIGHT BE ABOUT</p>
        <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Here is what that might be about</h2>
        <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>
          {allWords.length === 1 ? "One word, one feeling." : `${allWords.length} feelings, sitting here at once. That is normal.`}
        </p>

        <div className="space-y-3 mb-4">
          {items.map(({ w, meaning }) => {
            // find color
            let color = z?.c || "#8B5CF6";
            for (const catKey of (zone ? ZONES[zone].cats : [])) {
              for (const [, ws] of CAT[catKey].g) { if (ws.includes(w)) { color = CAT[catKey].c; break; } }
            }
            return (
              <div key={w} className="p-4 rounded-2xl" style={{ background: `${color}09`, border: `1.5px solid ${color}28` }}>
                <p className="text-sm font-bold mb-1" style={{ fontFamily: "Inter, sans-serif", color }}>{w}</p>
                {meaning && <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#54576B", lineHeight: 1.55 }}>{meaning}</p>}
                {FLAG.has(w) && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#059669" }}>Support is available for this — privately.</p>
                  </div>
                )}
              </div>
            );
          })}
          {own.map(w => (
            <div key={w} className="p-4 rounded-2xl" style={{ background: "#FEF3C711", border: "1.5px solid #FDE68A" }}>
              <p className="text-sm font-bold mb-1" style={{ fontFamily: "Inter, sans-serif", color: "#92400E" }}>{w}</p>
              <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#54576B" }}>Your own word. We keep it exactly as you said it.</p>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 rounded-2xl mb-5" style={{ background: "#EEF3FF", border: "1px solid #C7D2FE" }}>
          <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#3D53B8", lineHeight: 1.55 }}>None of this is a problem with you. It is just information.</p>
        </div>

        <button onClick={next} className="w-full py-3.5 rounded-2xl text-sm font-semibold mb-2" style={{ background: z?.c || "#8B5CF6", color: "white", fontFamily: "Inter, sans-serif" }}>
          Yes, that is it →
        </button>
        <button onClick={() => setStepIdx(1)} className="w-full py-2.5 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>
          Not really — go back to words
        </button>
      </div>
    );
  };

  const AwarenessScreen = () => {
    if (!zone) return null;
    if (zone === "hi") return (
      <div className="px-5 py-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: z!.c, letterSpacing: "0.1em" }}>WHERE IT SITS</p>
        <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Where do you feel it in your body?</h2>
        <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>High-zone feelings usually show up physically before you can name them.</p>
        <OptionGroup label="" options={["Chest — tight or racing","Jaw, neck or shoulders","Stomach","Hands — shaky or clenched","Head — hot or buzzing","I cannot place it"]}
          pickKey="body" picks={picks} onToggle={togglePick} color={z!.c} onAdd={addPick} />
        <button onClick={next} className="w-full py-3.5 rounded-2xl text-sm font-semibold mt-2" style={{ background: z!.c, color: "white", fontFamily: "Inter, sans-serif" }}>Carry on →</button>
      </div>
    );
    if (zone === "lo") return (
      <div className="px-5 py-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: z!.c, letterSpacing: "0.1em" }}>HOW LONG</p>
        <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>How long has it felt like this?</h2>
        <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>No wrong answer. It just helps to know.</p>
        <OptionGroup label="" options={["Just today","A few days","A couple of weeks","Longer than that","Hard to say — it comes and goes"]}
          pickKey="duration" picks={picks} onToggle={togglePick} color={z!.c} onAdd={addPick} />
        <button onClick={next} className="w-full py-3.5 rounded-2xl text-sm font-semibold mt-2" style={{ background: z!.c, color: "white", fontFamily: "Inter, sans-serif" }}>Carry on →</button>
      </div>
    );
    return (
      <div className="px-5 py-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: z!.c, letterSpacing: "0.1em" }}>WORTH KEEPING</p>
        <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Anything you want to remember about today?</h2>
        <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>Good days are a pattern too. One line is plenty.</p>
        <OptionGroup label="" options={["Something went well","A good conversation","I got proper rest","Progress on something that matters"]}
          pickKey="notable" picks={picks} onToggle={togglePick} color={z!.c} onAdd={addPick} />
        <button onClick={next} className="w-full py-3.5 rounded-2xl text-sm font-semibold mt-2" style={{ background: z!.c, color: "white", fontFamily: "Inter, sans-serif" }}>Save it →</button>
      </div>
    );
  };

  const ContextTriggerScreen = () => (
    <div className="px-5 py-6">
      <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: z!.c, letterSpacing: "0.1em" }}>WHAT SET IT OFF</p>
      <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>What triggered this feeling?</h2>
      <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>Pick any that land. Knowing the trigger is the first step out.</p>
      <OptionGroup label="" options={["Something someone said or did","Being blocked on something","Too much at once","A deadline or pressure","It built up over days","I do not know"]}
        pickKey="trigger" picks={picks} onToggle={togglePick} color={z!.c} onAdd={addPick} />
      <button onClick={next} className="w-full py-3.5 rounded-2xl text-sm font-semibold mt-2" style={{ background: z!.c, color: "white", fontFamily: "Inter, sans-serif" }}>Carry on →</button>
    </div>
  );

  const ContextHelpsScreen = () => (
    <div className="px-5 py-6">
      <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: z!.c, letterSpacing: "0.1em" }}>WHAT USUALLY WORKS</p>
      <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>What helps you come back down?</h2>
      <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>From experience — what actually works for you.</p>
      <OptionGroup label="" options={["Getting away from the situation","Moving — a walk or stairs","Talking to someone","Writing it out","Slowing my breathing","Nothing really works"]}
        pickKey="helps" picks={picks} onToggle={togglePick} color={z!.c} onAdd={addPick} />
      <button onClick={next} className="w-full py-3.5 rounded-2xl text-sm font-semibold mt-2" style={{ background: z!.c, color: "white", fontFamily: "Inter, sans-serif" }}>Carry on →</button>
    </div>
  );

  const ContextDoableScreen = () => (
    <div className="px-5 py-6">
      <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: z!.c, letterSpacing: "0.1em" }}>WHAT IS STILL POSSIBLE</p>
      <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>What feels doable right now?</h2>
      <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>When things are flat, small is enough. Pick anything that feels possible.</p>
      <OptionGroup label="" options={["Getting up and moving a bit","Messaging one person","One small task","Eating something","Honestly, nothing right now"]}
        pickKey="doable" picks={picks} onToggle={togglePick} color={z!.c} onAdd={addPick} />
      <button onClick={next} className="w-full py-3.5 rounded-2xl text-sm font-semibold mt-2" style={{ background: z!.c, color: "white", fontFamily: "Inter, sans-serif" }}>Carry on →</button>
    </div>
  );

  const ContextWhoScreen = () => (
    <div className="px-5 py-6">
      <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: z!.c, letterSpacing: "0.1em" }}>WHO KNOWS</p>
      <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Does anyone know how you are feeling?</h2>
      <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>No right or wrong answer here. Just honest.</p>
      <OptionGroup label="" options={["Yes, someone knows","Someone could — I have not told them","There is no one right now","I would rather not say"]}
        pickKey="support" picks={picks} onToggle={togglePick} color={z!.c} onAdd={addPick} />
      <button onClick={next} className="w-full py-3.5 rounded-2xl text-sm font-semibold mt-2" style={{ background: z!.c, color: "white", fontFamily: "Inter, sans-serif" }}>Carry on →</button>
    </div>
  );

  const SupportScreen = () => {
    const suggestions = zone === "hi"
      ? ["60-second reset","Step away for five minutes","Write it out before you reply","Thought check-in with CereBro"]
      : zone === "lo"
      ? ["Two-minute gentle movement","Message one person","One small thing off the list","Grounding exercise with CereBro"]
      : ["Save this to your patterns","Write down one good thing","Nothing needed — carry on"];
    return (
      <div className="px-5 py-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", letterSpacing: "0.1em" }}>THINGS YOU COULD TRY</p>
        <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Here are a few things you could try</h2>
        <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280", lineHeight: 1.55 }}>
          {zone === "hi" ? "Picked for bringing things down, not thinking them through." : zone === "lo" ? "All small on purpose. Small is the point when things are flat." : "Nothing needed here. Just keeping the record honest."}
        </p>

        {flagged && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-4" style={{ background: "#ECFDF5", border: "1.5px solid #6EE7B7" }}>
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#10B981" }} />
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ fontFamily: "Inter, sans-serif", color: "#065F46" }}>Talk to a real person</p>
              <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>Private. Nobody at work is told.</p>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-5">
          {suggestions.map(s => (
            <div key={s} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "white", border: "1.5px solid #E5E7EB" }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: z?.c || "#8B5CF6" }} />
              <span className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#374151" }}>{s}</span>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 rounded-2xl mb-5" style={{ background: "#EEF3FF", border: "1px solid #C7D2FE" }}>
          <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#3D53B8", lineHeight: 1.55 }}>Small steps, your way. None of this goes to your employer.</p>
        </div>

        <button onClick={next} className="w-full py-3.5 rounded-2xl text-sm font-semibold mb-2" style={{ background: z?.c || "#8B5CF6", color: "white", fontFamily: "Inter, sans-serif" }}>Check in again →</button>
        <button onClick={handleComplete} className="w-full py-2.5 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>Save for later</button>
      </div>
    );
  };

  const RecheckScreen = () => (
    <div className="px-5 py-6">
      <p className="text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif", color: "#8B5CF6", letterSpacing: "0.1em" }}>CHECK IN AGAIN</p>
      <h2 className="text-xl mb-1" style={{ fontFamily: "Lora, serif", fontWeight: 500, color: "#15113C" }}>Where are you now?</h2>
      <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#6B7280" }}>Same three bands, a few minutes on. No score, no right answer.</p>

      <div className="space-y-3 mb-5">
        {(["hi","zn","lo"] as ZoneKey[]).map(k => {
          const zz = ZONES[k];
          const isOn = afterZone === k;
          return (
            <button key={k} onClick={() => setAfterZone(k)}
              className="w-full p-4 rounded-2xl text-left transition-all"
              style={{ background: isOn ? zz.bg : "white", border: `2px solid ${isOn ? zz.c : "#E5E7EB"}` }}
            >
              <span className="block text-sm font-bold mb-0.5" style={{ fontFamily: "Inter, sans-serif", color: isOn ? zz.c : "#15113C" }}>{zz.name}</span>
              <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: isOn ? zz.c : "#6B7280" }}>{zz.tag}</span>
            </button>
          );
        })}
      </div>

      {afterZone && zone && (
        <>
          <div className="px-4 py-3 rounded-2xl mb-5" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
            <p className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#065F46", lineHeight: 1.55 }}>
              <strong>Before:</strong> {ZONES[zone].name} — {allWords[0] || "unnamed"}<br />
              <strong>Now:</strong> {ZONES[afterZone].name}<br />
              <span style={{ opacity: 0.75 }}>Saved as a shift within this session. Not a score.</span>
            </p>
          </div>
          <button onClick={handleComplete} className="w-full py-3.5 rounded-2xl text-sm font-semibold" style={{ background: "#10B981", color: "white", fontFamily: "Inter, sans-serif" }}>
            Done
          </button>
        </>
      )}
      {!afterZone && (
        <button onClick={handleComplete} className="w-full py-2.5 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#9CA3AF" }}>Skip and finish</button>
      )}
    </div>
  );

  const screenMap: Record<StepId, JSX.Element> = {
    zone: <ZoneScreen />,
    words: <WordsScreen />,
    settle: <SettleScreen />,
    meaning: <MeaningScreen />,
    awareness: <AwarenessScreen />,
    contextTrigger: <ContextTriggerScreen />,
    contextHelps: <ContextHelpsScreen />,
    contextDoable: <ContextDoableScreen />,
    contextWho: <ContextWhoScreen />,
    support: <SupportScreen />,
    recheck: <RecheckScreen />,
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "white" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4" style={{ borderBottom: "1px solid #F3F4F6" }}>
        <button onClick={back} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB" }}>
          <ArrowLeft className="w-4 h-4" style={{ color: "#15113C", strokeWidth: 1.75 }} />
        </button>
        {/* Progress bar */}
        <div className="flex-1 flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-400"
              style={{ background: i <= stepIdx ? (z?.c || "#8B5CF6") : "#E5E7EB" }} />
          ))}
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB" }}>
          <X className="w-4 h-4" style={{ color: "#15113C", strokeWidth: 1.75 }} />
        </button>
      </div>

      {/* Screen */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            {screenMap[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

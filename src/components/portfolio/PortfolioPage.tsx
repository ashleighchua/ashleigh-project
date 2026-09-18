import { useState } from "react";
import { ArrowDown, ArrowRight, Check, ExternalLink, Linkedin, Mail, Menu, MoveRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { caseStudies, problems, services, type CaseStudy } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import hannahHome from "@/assets/hannah-home.jpg";
import hannahDetail from "@/assets/hannah-detail.jpg";
import hannahBid from "@/assets/hannah-bid.jpg";
import hannahAdmin from "@/assets/hannah-admin.jpg";

const gallery = [
  { src: hannahHome, label: "Homepage" }, { src: hannahDetail, label: "Artwork detail" },
  { src: hannahBid, label: "Bidding modal" }, { src: hannahAdmin, label: "Admin management" },
];
const pipeline = ["Research", "Build", "Automate", "Launch"];
const messyNotes = ["automate emails???", "fix the spreadsheet", "why is everything in Notion", "launch before October", "ask customers what they need", "someone own onboarding pls", "make a proper brief", "website copy??"];
const lanes = [
  { n: "01", title: "Research", items: ["Ask customers", "Define the real problem"] },
  { n: "02", title: "Build", items: ["Write the brief", "Fix the spreadsheet"] },
  { n: "03", title: "Systems", items: ["Automate emails", "Own onboarding"] },
  { n: "04", title: "Launch", items: ["Website copy", "Ship before October"] },
];

function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }

export function PortfolioPage() {
  const [heroSorted, setHeroSorted] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [sorted, setSorted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openCase = (id: string) => setSelectedCase(caseStudies.find((item) => item.id === id) ?? null);
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center px-5 sm:px-8 lg:px-12">
          <a href="#top" className="min-w-0 font-display text-xl font-semibold">Ashleigh Chua<span className="text-accent-mark">.</span></a>
          <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Main navigation">
            <a href="#services" className="nav-link">What I do</a><a href="#work" className="nav-link">Work</a><a href="#about" className="nav-link">About</a>
            <Button size="sm" onClick={() => scrollTo("contact")}>Give me a problem <ArrowRight /></Button>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle menu" onClick={() => setMenuOpen((v) => !v)}>{menuOpen ? <X /> : <Menu />}</Button>
        </div>
        {menuOpen && <nav className="grid gap-1 border-t border-border bg-background p-4 md:hidden"><a href="#services" onClick={() => setMenuOpen(false)} className="mobile-link">What I do</a><a href="#work" onClick={() => setMenuOpen(false)} className="mobile-link">Work</a><a href="#about" onClick={() => setMenuOpen(false)} className="mobile-link">About</a><a href="#contact" onClick={() => setMenuOpen(false)} className="mobile-link text-accent-mark">Give me a problem →</a></nav>}
      </header>

      <section id="top" className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-[1440px] content-center gap-14 px-5 py-14 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:px-12 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground"><span className="h-px w-8 bg-accent-mark"/>Founder operations + AI generalist</p>
          <h1 className="max-w-4xl font-display text-[clamp(3.6rem,7.6vw,7.8rem)] font-medium leading-[.86]">
            Give me the<br/><em className="font-normal text-accent-mark">messy</em> thing.<br/>I’ll figure it out.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">I help founders turn messy ideas, problems and projects into things that actually get done.</p>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[.14em]">{["Founder Ops", "AI", "Research", "Systems", "Projects"].map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={() => scrollTo("contact")}>Give me a problem <ArrowRight /></Button>
            <Button variant="ghost" size="lg" onClick={() => scrollTo("work")}>See what I’ve built <ArrowDown /></Button>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="w-full border border-ink bg-paper-strong shadow-editorial">
            <div className="flex items-center justify-between border-b border-border px-5 py-4"><span className="font-mono text-xs uppercase tracking-widest">Untangle this</span><span className="h-2 w-2 rounded-full bg-accent-mark" /></div>
            <div className="relative min-h-[410px] p-5 sm:p-8">
              {!heroSorted ? <div className="relative h-[285px]" aria-label="A messy collection of tasks">
                {messyNotes.slice(0, 6).map((note, i) => <div key={note} className={cn("absolute w-[46%] max-w-[190px] break-words border border-ink/20 p-3 font-hand text-base shadow-note transition-transform", i % 3 === 0 ? "bg-note-yellow" : i % 3 === 1 ? "bg-note-pink" : "bg-note-green")} style={{ left: `${[2,50,12,48,2,50][i]}%`, top: `${[5,1,35,40,68,72][i]}%`, transform: `rotate(${[-4,3,2,-3,4,1][i]}deg)` }}>{note}</div>)}
              </div> : <div className="grid h-[285px] content-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">{pipeline.map((step, i) => <div key={step} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b border-border py-3"><span className="font-mono text-xs text-muted-foreground">0{i + 1}</span><span className="font-display text-2xl">{step}</span><Check className="size-4 text-accent-mark" /></div>)}</div>}
              <Button className="w-full" variant={heroSorted ? "outline" : "default"} onClick={() => setHeroSorted((v) => !v)}>{heroSorted ? "Make it messy again" : "Make sense of it"} <Sparkles /></Button>
            </div>
          </div>
          <p className="absolute -bottom-7 right-0 font-hand text-sm text-muted-foreground">Yes, this is a normal Tuesday.</p>
        </div>
      </section>

      <section className="border-y border-border bg-paper-strong py-24 sm:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <p className="section-kicker">Start here</p><h2 className="section-title max-w-3xl">What’s currently driving you <em>slightly insane?</em></h2><p className="mt-4 text-muted-foreground">Pick one. I’ll show you what I’d do.</p>
          <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {problems.map((p, i) => <button key={p.title} onClick={() => setSelectedProblem(i)} className={cn("group min-h-40 bg-background p-6 text-left transition-colors hover:bg-secondary", selectedProblem === i && "bg-foreground text-background hover:bg-foreground")}><span className="text-2xl" aria-hidden="true">{p.icon}</span><span className="mt-7 block font-display text-xl leading-tight">{p.title}</span></button>)}
          </div>
          <div key={selectedProblem} className="mt-6 grid gap-8 border-l-4 border-accent-mark bg-background p-6 animate-in fade-in slide-in-from-bottom-2 md:grid-cols-[1fr_auto] md:items-end md:p-9">
            <div><p className="max-w-3xl font-display text-2xl leading-snug sm:text-3xl">“{problems[selectedProblem]!.response}”</p><div className="mt-6 flex flex-wrap gap-2">{problems[selectedProblem]!.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div>
            <div className="flex flex-col items-start gap-3 md:items-end"><button className="text-sm underline decoration-border underline-offset-4 hover:decoration-foreground" onClick={() => openCase(problems[selectedProblem]!.caseId)}>See a relevant project <ExternalLink className="ml-1 inline size-3" /></button><Button onClick={() => scrollTo("contact")}>This sounds familiar <ArrowRight /></Button></div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-24"><div><p className="section-kicker">What I do</p><h2 className="section-title">Things I can take off your plate.</h2><p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">Not a fixed menu. More like the kinds of complicated, unfinished or slightly neglected things I’m good at picking up.</p></div>
          <Accordion type="single" collapsible defaultValue="service-0">{services.map((s, i) => <AccordionItem key={s.number} value={`service-${i}`} className="border-foreground/25"><AccordionTrigger className="gap-5 py-7 hover:no-underline"><span className="font-mono text-xs text-accent-mark">{s.number}</span><span className="flex-1 text-left"><span className="block font-display text-2xl sm:text-3xl">{s.title}</span><span className="mt-1 block text-sm font-normal text-muted-foreground">{s.line}</span></span></AccordionTrigger><AccordionContent className="pb-8 pl-0 sm:pl-12"><p className="mb-5 max-w-2xl text-lg">{s.summary}</p><ul className="grid gap-3 sm:grid-cols-2">{s.tasks.map((task) => <li key={task} className="flex gap-3 text-sm leading-relaxed text-muted-foreground"><MoveRight className="mt-1 size-4 shrink-0 text-accent-mark" />{task}</li>)}</ul><div className="mt-6 border-l-2 border-accent-mark pl-4 text-sm"><strong>You get:</strong> {s.deliverable}</div></AccordionContent></AccordionItem>)}</Accordion>
        </div>
      </section>

      <section id="work" className="bg-foreground py-24 text-background sm:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8"><p className="section-kicker text-background/50">Selected work</p><h2 className="section-title text-background">Things I’ve actually built.</h2>
          <div className="mt-14 grid gap-px bg-background/20 border-y border-background/20">{caseStudies.map((item, i) => <article key={item.id} className="group grid cursor-pointer bg-foreground py-8 transition-colors hover:bg-ink-soft sm:grid-cols-[80px_1.25fr_.75fr_auto] sm:items-center sm:gap-8" onClick={() => setSelectedCase(item)}>
            <span className="font-mono text-xs text-background/45">{item.number}</span><div><p className="mb-2 text-xs uppercase tracking-[.16em] text-background/50">{item.client}</p><h3 className="max-w-2xl font-display text-2xl leading-tight sm:text-3xl">{item.title}</h3></div><div className="mt-5 flex flex-wrap gap-2 sm:mt-0">{item.tags.map((tag) => <span className="border border-background/25 px-2.5 py-1 text-[10px] uppercase tracking-wider" key={tag}>{tag}</span>)}</div><Button variant="ghost" size="icon" aria-label={`Open ${item.client} case study`} className="mt-5 border border-background/30 text-background group-hover:bg-background group-hover:text-foreground sm:mt-0"><ArrowRight className="transition-transform group-hover:translate-x-0.5" /></Button>
          </article>)}</div>
        </div>
      </section>

      <section className="bg-paper-strong py-24 sm:py-32"><div className="mx-auto max-w-[1280px] px-5 sm:px-8"><div className="grid gap-10 lg:grid-cols-[.68fr_1.32fr] lg:gap-20"><div><p className="section-kicker">A live demonstration</p><h2 className="section-title">This is basically how my brain works.</h2><p className="mt-6 text-muted-foreground">Messy doesn’t mean impossible. It usually just needs structure.</p><Button className="mt-8" onClick={() => setSorted((v) => !v)}>{sorted ? "Undo the tidying" : "Okay, sort this out"} <Sparkles /></Button></div>
        <div className="min-h-[460px] border border-border bg-background p-5 sm:p-8">{!sorted ? <div className="relative h-[400px] overflow-hidden">{messyNotes.map((note, i) => <div key={note} className={cn("absolute w-[44%] max-w-44 break-words border border-ink/15 p-3 font-hand shadow-note transition-all", i % 3 === 0 ? "bg-note-yellow" : i % 3 === 1 ? "bg-note-pink" : "bg-note-green")} style={{left: `${[2,52,22,50,3,48,10,52][i]}%`, top: `${[2,5,23,29,49,54,75,77][i]}%`, transform: `rotate(${[-4,3,2,-3,4,1,-2,3][i]}deg)`}}>{note}</div>)}</div> : <div className="grid gap-3 animate-in fade-in zoom-in-95 duration-500 sm:grid-cols-2">{lanes.map((lane) => <div key={lane.n} className="min-h-44 border border-border p-5"><div className="flex justify-between"><span className="font-mono text-xs text-accent-mark">{lane.n}</span><Check className="size-4 text-muted-foreground" /></div><h3 className="mt-5 font-display text-2xl">{lane.title}</h3><ul className="mt-4 space-y-2 text-sm text-muted-foreground">{lane.items.map((item) => <li key={item}>→ {item}</li>)}</ul></div>)}</div>}</div></div></div></section>

      <section className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 sm:py-32"><p className="section-kicker">How I work</p><h2 className="section-title max-w-3xl">Low drama. High follow-through.</h2><div className="mt-14 grid border-y border-border md:grid-cols-4">{[
        ["01", "You bring me the problem", "Polished brief or chaotic voice note. Both work."], ["02", "I figure out what needs to happen", "Research, useful questions and a sensible structure."], ["03", "I build the thing", "Workflow, deliverable, MVP or automation."], ["04", "You get something useful", "And you don’t need to ask twice."],
      ].map(([n,t,d]) => <div key={n} className="border-b border-border py-7 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"><span className="font-mono text-xs text-accent-mark">{n}</span><h3 className="mt-8 font-display text-2xl leading-tight">{t}</h3><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{d}</p></div>)}</div></section>

      <section className="border-y border-border bg-accent-mark py-20 text-accent-foreground sm:py-24"><div className="mx-auto max-w-[1280px] px-5 sm:px-8"><p className="text-xs font-semibold uppercase tracking-[.18em] text-accent-foreground/65">A few things you don’t need to explain to me</p><div className="mt-10 grid gap-px bg-accent-foreground/20 sm:grid-cols-2 lg:grid-cols-4">{["You can send me a chaotic voice note.", "Half-finished ideas are welcome.", "‘I know this is manual and bad’ is a valid brief.", "I will ask the obvious question everyone skipped."].map((text, i) => <div className="min-h-48 bg-accent-mark p-6" key={text}><span className="font-hand text-sm opacity-60">0{i+1}</span><p className="mt-10 font-display text-2xl leading-tight">{text}</p></div>)}</div></div></section>

      <section id="about" className="mx-auto grid max-w-[1280px] gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-2 lg:gap-24"><div><p className="section-kicker">About</p><h2 className="section-title">So, who is Ashleigh?</h2><div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground"><p>I’m a generalist who likes being dropped into the middle of something complicated and making it make sense.</p><p>I started in regulatory risk consulting, where I learned how to ask better questions and structure ambiguous problems. Since then, I’ve moved closer and closer to building: products, workflows, small businesses and practical uses of AI.</p><p>I’m not here to be another layer of coordination. I’m here to understand the thing, take ownership and move it forward.</p></div></div><div className="relative pl-8 before:absolute before:bottom-4 before:left-[5px] before:top-3 before:w-px before:bg-border">{[["2019–22","Consulting","Built the problem-solving foundations."],["2022–24","Product","Moved from recommendations to making things."],["2024–Now","AI + Operations","Building practical systems for real work."],["Always","Independent","Curious, hands-on, usually with too many tabs open."]].map(([date,title,desc]) => <div className="relative mb-10" key={title}><span className="absolute -left-[31px] top-1.5 size-2.5 rounded-full border-2 border-background bg-accent-mark"/><span className="font-mono text-xs text-accent-mark">{date}</span><h3 className="mt-2 font-display text-2xl">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{desc}</p></div>)}</div></section>

      <section id="contact" className="bg-foreground py-24 text-background sm:py-32"><div className="mx-auto grid max-w-[1280px] gap-14 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-24"><div><p className="section-kicker text-background/50">Get in touch</p><h2 className="font-display text-[clamp(3.2rem,6vw,6.5rem)] leading-[.92]">Got something <em className="font-normal text-accent-light">messy?</em></h2><p className="mt-7 max-w-md text-lg leading-relaxed text-background/65">Send it my way. If I’m not the right person, I’ll tell you.</p></div><ContactForm /></div></section>

      <footer className="bg-foreground text-background"><div className="mx-auto grid max-w-[1280px] gap-8 border-t border-background/20 px-5 py-10 sm:grid-cols-[1fr_auto] sm:items-end sm:px-8"><div><p className="font-display text-xl">Ashleigh Chua</p><p className="mt-1 text-xs uppercase tracking-[.14em] text-background/45">Founder Ops · AI · Projects</p></div><div className="flex flex-wrap items-center gap-6 text-sm"><a className="footer-link" href="https://www.linkedin.com" target="_blank" rel="noreferrer"><Linkedin className="size-4"/> LinkedIn</a><a className="footer-link" href="mailto:hello@ashleighchua.com"><Mail className="size-4"/> Email</a></div><p className="text-xs text-background/40 sm:col-span-2">Built with curiosity and an unreasonable number of tabs.</p></div></footer>

      <CaseDialog item={selectedCase} onClose={() => setSelectedCase(null)} onImage={setLightbox} />
      <Dialog open={lightbox !== null} onOpenChange={(open) => !open && setLightbox(null)}><DialogContent className="max-h-[94vh] max-w-6xl border-0 bg-transparent p-0 shadow-none"><DialogTitle className="sr-only">Project preview</DialogTitle><DialogDescription className="sr-only">Expanded website interface preview.</DialogDescription>{lightbox !== null && <img src={gallery[lightbox]!.src} alt={`${gallery[lightbox]!.label} interface preview`} width={1280} height={960} className="max-h-[88vh] w-full object-contain" />}</DialogContent></Dialog>
    </main>
  );
}

function CaseDialog({ item, onClose, onImage }: { item: CaseStudy | null; onClose: () => void; onImage: (index: number) => void }) {
  return <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-0"><DialogTitle className="sr-only">{item?.client ?? "Case study"}</DialogTitle><DialogDescription className="sr-only">Detailed project case study.</DialogDescription>{item && <article>
    <div className={cn("p-7 sm:p-12", item.accent)}><p className="font-mono text-xs uppercase tracking-widest">Case {item.number} · {item.kicker}</p><h2 className="mt-12 max-w-4xl font-display text-4xl leading-tight sm:text-6xl">{item.title}</h2><p className="mt-6 max-w-2xl text-base opacity-75">{item.summary}</p></div>
    {item.id === "hannah" && <div className="grid grid-cols-2 gap-px bg-border p-px">{gallery.map((image, i) => <button key={image.label} className="group relative overflow-hidden bg-background text-left" onClick={() => onImage(i)}><img src={image.src} alt={`${image.label} interface preview`} loading="lazy" width={1280} height={960} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"/><span className="absolute bottom-3 left-3 bg-foreground px-3 py-1.5 text-xs text-background">{image.label} ↗</span></button>)}</div>}
    {item.id === "hannah" && <div className="overflow-x-auto border-b border-border p-6 sm:p-10"><p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">The workflow</p><div className="flex min-w-[740px] items-center justify-between">{["Artist", "Website", "Catalogue", "Detail", "Bidding", "Admin", "Self-service"].map((step, i) => <div className="flex items-center" key={step}><span className={cn("border px-3 py-2 text-xs", i === 6 ? "border-accent-mark bg-accent-mark text-accent-foreground" : "border-border")}>{step}</span>{i < 6 && <ArrowRight className="mx-2 size-3 text-muted-foreground"/>}</div>)}</div></div>}
    {item.id === "schooltrips" && <div className="p-6 sm:p-10"><div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]"><div className="border border-border p-6"><span className="font-display text-5xl">7</span><p className="mt-2 text-sm text-muted-foreground">focused questions</p></div><ArrowRight className="mx-auto rotate-90 sm:rotate-0"/><div className="border border-accent-mark bg-secondary p-6"><Sparkles/><p className="mt-5 font-display text-xl">AI processing</p></div><ArrowRight className="mx-auto rotate-90 sm:rotate-0"/><div className="border border-border p-6"><p className="font-display text-xl">Itinerary + risk pack</p><p className="mt-2 text-sm text-muted-foreground">Structured, editable, useful.</p></div></div></div>}
    <div className="grid gap-px bg-border sm:grid-cols-2"><CaseBlock n="01" title="The problem" text={item.problem}/><CaseBlock n="02" title="The thinking" text={item.thinking}/><CaseBlock n="03" title="The build" text={item.build}/><CaseBlock n="04" title="The result" text={item.result}/></div>
    <div className="flex justify-end p-6"><Button onClick={() => { onClose(); scrollTo("contact"); }}>Bring me something like this <ArrowRight /></Button></div>
  </article>}</DialogContent></Dialog>;
}
function CaseBlock({ n, title, text }: { n: string; title: string; text: string }) { return <div className="bg-background p-6 sm:p-9"><span className="font-mono text-xs text-accent-mark">{n}</span><h3 className="mt-5 font-display text-2xl">{title}</h3><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p></div>; }

function ContactForm() {
  const [sent, setSent] = useState(false);
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get("name") ?? ""); const message = String(form.get("message") ?? ""); const company = String(form.get("company") ?? ""); window.location.href = `mailto:hello@ashleighchua.com?subject=${encodeURIComponent(`A messy thing from ${name}`)}&body=${encodeURIComponent(`${message}\n\nWebsite / company: ${company}`)}`; setSent(true); };
  return <form className="grid gap-5" onSubmit={submit}><div className="grid gap-5 sm:grid-cols-2"><label className="field-label">Name<input required name="name" className="field" placeholder="Your name" /></label><label className="field-label">Email<input required name="email" type="email" className="field" placeholder="you@company.com" /></label></div><label className="field-label">Website / company <span className="font-normal text-background/35">(optional)</span><input name="company" className="field" placeholder="Where you’re building" /></label><label className="field-label">What are you trying to figure out?<textarea required name="message" rows={6} className="field resize-none" placeholder="Honestly? It’s a bit of a mess. Here’s what’s going on..." /></label><div className="flex flex-wrap items-center justify-between gap-4"><p className="text-xs text-background/40">No polished brief required.</p><Button type="submit" className="bg-accent-light text-foreground hover:bg-accent-light/90">Send the messy thing <ArrowRight /></Button></div>{sent && <p className="text-sm text-accent-light" role="status">Your email app should be opening now.</p>}</form>;
}

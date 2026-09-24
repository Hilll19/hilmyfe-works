'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { projects, skills, experience } from '@/lib/content';

function Arrow({ diagonal = false }: { diagonal?: boolean }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" /></svg>; }
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={false} whileInView={reduced ? {} : { opacity: [0.65, 1], y: [18, 0] }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 1] }}>{children}</motion.div>;
}

function ProjectVisual({ type }: { type: string }) {
  if (type === 'mes') return <div className="project-visual mes-visual" aria-hidden="true"><div className="visual-topline"><span>FACTORY OVERVIEW</span><span className="mint">10 NODES CONNECTED</span></div><div className="oee-layout"><div className="oee-gauge"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" /><circle className="gauge-value" cx="60" cy="60" r="48" /></svg><div><b>OEE</b><small>REAL-TIME MONITORING</small></div></div><div className="machine-grid">{Array.from({ length: 10 }, (_, i) => <div key={i}><i /><span>PLC_{String(i + 1).padStart(2, '0')}</span><div className="mini-signal">▁▂▅▂▆▃▅</div></div>)}</div></div><div className="visual-bottomline">MODBUS <span>→</span> MQTT <span>→</span> NODE-RED <span>→</span> SAP</div></div>;
  if (type === 'gateway') return <div className="project-visual gateway-visual" aria-hidden="true"><div className="visual-topline"><span>INTEGRATION ARCHITECTURE</span><span>SECURE BY DESIGN</span></div><div className="gateway-diagram"><div className="source-nodes"><span>LOGISTICS</span><span>PRODUCTION</span><span>E-MANIFEST</span></div><svg viewBox="0 0 110 140"><path d="M0 22H35L85 70H110M0 70H110M0 118H35L85 70" /></svg><div className="gateway-core"><span>⌘</span><b>API</b><small>GATEWAY</small></div><span className="connection-line" /><div className="cloud-node">GCP<small>CLOUD</small></div></div><div className="visual-bottomline">.NET 8 <span>/</span> NGINX <span>/</span> DOCKER <span>/</span> AZURE DEVOPS</div></div>;
  return <div className={`project-visual system-visual ${type}-visual`} aria-hidden="true"><div className="visual-topline"><span>{type === 'sap' ? 'PROCUREMENT, SIMPLIFIED' : type === 'warehouse' ? 'MATERIAL FLOW' : type === 'tracker' ? 'ASSET TRACEABILITY' : 'CONNECTED ADMINISTRATION'}</span><span>↗</span></div><div className="system-diagram">{(type === 'sap' ? ['REQUEST', 'APPROVE', 'SAP ECC'] : type === 'warehouse' ? ['SCAN', 'FIFO', 'STOCK SYNC'] : type === 'tracker' ? ['QR CODE', 'MOVEMENT', 'TRACE'] : ['REGISTER', 'BILLING', 'DOCUMENTS']).map((label, i) => <div key={label}><span className="diagram-icon">{type === 'tracker' && i === 0 ? '▦' : ['⌑', '≋', '▤'][i]}</span><small>{label}</small>{i < 2 && <i>⟶</i>}</div>)}</div><div className="visual-bottomline">{type === 'sap' ? '50 → ~35 SAP SEATS · 9 SUBSIDIARIES' : type === 'warehouse' ? 'RAW MATERIAL → PRODUCTION PLANNING' : type === 'tracker' ? '20,000–30,000 POLYBOXES IN SCOPE' : 'REGISTRATION → AUTOMATED DOCUMENTS'}</div></div>;
}

export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selected, setSelected] = useState<(typeof projects)[number] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hilmyfe-theme');
      if (saved === 'light') {
        setTheme('light');
        document.documentElement.dataset.theme = 'light';
      }
    } catch { /* Theme still works when storage is unavailable. */ }
  }, []);
  useEffect(() => {
    if (selected) { dialog.current?.showModal(); document.body.style.overflow = 'hidden'; }
    return () => { document.body.style.overflow = ''; };
  }, [selected]);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);
  const closeProject = () => { dialog.current?.close(); setSelected(null); };
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('hilmyfe-theme', next); } catch { /* Keep the selected theme for this visit. */ }
  };

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a href="#home" className="wordmark" aria-label="Hilmy Febrian home">h<span>f</span><span className="wordmark-period">.</span><small>HILMY FEBRIAN</small></a>
      <nav aria-label="Main navigation" id="main-navigation" className={menuOpen ? 'nav-links open' : 'nav-links'}>{[['Home', 'home'], ['About', 'about'], ['Works', 'works'], ['Contact', 'contact']].map(([title, id]) => <a href={`#${id}`} key={id} onClick={() => setMenuOpen(false)}>{title}<span>↗</span></a>)}</nav>
      <div className="header-actions">
        <button className="theme-toggle" type="button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'light'} onClick={toggleTheme}><span className="theme-icon" aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span><span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button>
        <a className="header-contact" href="mailto:hilworking0110@gmail.com">Let’s talk <Arrow diagonal /></a>
        <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close −' : 'Menu +'}</button>
      </div>
    </header>

    <main id="main">
      <div id="journey">
        <section className="hero section-shell" id="home" aria-labelledby="hero-title">
          <div className="hero-topnote"><span className="eyebrow"><i /> FULLSTACK DEVELOPER & DIGITALIZATION MANUFACTURING</span><span className="edition">PORTFOLIO / 2026</span></div>
          <div className="hero-copy">
            <p className="hero-intro">CODE MEETS THE FACTORY FLOOR.</p>
            <h1 id="hero-title">Digitalization<br /><span>Automation</span><br /><span className="headline-last">Connection<span className="mint">.</span></span></h1>
            <p className="hero-description">I build the software layer between<br className="desktop-break" /> the factory floor and the boardroom.</p>
            <p className="hero-domains">FULLSTACK DEVELOPMENT <span>/</span> SAP & ERP <span>/</span> INDUSTRIAL IoT</p>
            <div className="hero-actions"><a className="button button-primary" href="#works">Explore my work <Arrow diagonal /></a><a className="button button-quiet" href="/CV-Mochamad_Hilmy_Febrian_Eka_Cahyadi.docx" download>Download CV (DOCX) <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" stroke="currentColor" strokeWidth="1.5" /></svg></a></div>
          </div>
          <div className="scene-coordinate" aria-hidden="true"><span>FIG. 01 — THE SIGNAL</span><p>Every connected system<br />starts with a single signal.</p><div className="coordinate-rule" /><span>X 06.27 &nbsp; Y 107.12 &nbsp; Z 00.01</span></div>
          <div className="hero-bottom"><a href="#structure" className="scroll-cue"><span>↓</span> SCROLL TO CONNECT THE DOTS</a><p>MOCHAMAD HILMY FEBRIAN EKA CAHYADI<span>INDUSTRIAL DIGITALIZATION SPECIALIST</span></p><span className="hero-index">01 — 04</span></div>
        </section>

        <section id="structure" className="story-section section-shell" aria-labelledby="structure-title"><Reveal className="story-copy"><span className="eyebrow">01 / CAPTURE PRODUCTION DATA</span><h2 id="structure-title">I bring machine data<br /><span className="muted">into software.</span></h2><p>I connect PLC signals through Modbus, MQTT, and Node-RED so production data is available as it happens.</p><div className="story-protocol"><span>MODBUS</span><Arrow /><span>MQTT</span><Arrow /><span>NODE-RED</span></div></Reveal><span className="story-caption">MACHINES → DATA</span></section>
        <section className="story-section section-shell" aria-labelledby="factory-title"><Reveal className="story-copy"><span className="eyebrow">02 / MONITOR THE PRODUCTION FLOOR</span><h2 id="factory-title">I make production<br /><span className="muted">visible in real time.</span></h2><p>For 10 PLC-connected machines, I built an operator kiosk and dashboards showing OK/NG output, downtime, Availability, and OEE.</p><div className="story-protocol"><span>OK/NG</span><Arrow /><span>DOWNTIME</span><Arrow /><span>OEE</span></div></Reveal><span className="story-caption">DATA → DECISIONS</span></section>
        <section className="story-section section-shell" aria-labelledby="enterprise-title"><Reveal className="story-copy"><span className="eyebrow">03 / INTEGRATE WITH SAP</span><h2 id="enterprise-title">I connect production<br /><span className="muted">to enterprise systems.</span></h2><p>My MES confirms production quantities directly to SAP. I also build warehouse and procurement applications that make SAP workflows easier for teams to use.</p><a className="text-link" href="#works">Explore how I built these systems <Arrow diagonal /></a></Reveal><span className="story-caption">PRODUCTION → SAP</span></section>
      </div>

      <section className="impact-strip section-shell" aria-label="Experience and selected work"><div><strong>2.5<span>+</span></strong><p>Years building<br />fullstack systems</p></div><div><strong>10</strong><p>PLC machines<br />integrated into the MES</p></div><div><strong>9</strong><p>Dharma subsidiaries supported<br />by the PR/PO application</p></div><div><strong>3</strong><p>Backend systems connected<br />through one API gateway</p></div></section>

      <section id="works" className="works-section section-shell" aria-labelledby="works-title"><div className="section-heading"><Reveal><span className="eyebrow">// SELECTED WORKS</span><h2 id="works-title">Built for the<br /><span className="muted">real world.</span></h2></Reveal><p>Systems that move materials, connect machines,<br className="desktop-break" /> and make complex operations feel simple.<span>06 SELECTED PROJECTS / 03 INDUSTRIES</span></p></div>
        <div className="projects-grid">{projects.map(project => <Reveal key={project.id}>
          <article className="project-card">
            <button className="project-art-button" onClick={() => setSelected(project)} aria-label={`View ${project.name}`}><div className="project-art"><ProjectVisual type={project.type} /><span className="project-open"><Arrow diagonal /></span></div></button>
            <div className="project-meta"><span>{project.id} / {project.category}</span><span>{project.year}</span></div>
            <h3>{project.name}</h3>
            <p className="project-company">{project.company}</p>
            <p>{project.intro}</p>
            <ul className="project-highlights">{project.highlights.map(point => <li key={point}>{point}</li>)}</ul>
            <div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
            <button className="project-details-link" onClick={() => setSelected(project)} aria-label={`Read project details: ${project.name}`}>Read project details <Arrow diagonal /></button>
          </article>
        </Reveal>)}</div>
      </section>

      <section id="about" className="about-section section-shell" aria-labelledby="about-title"><Reveal className="about-intro"><span className="eyebrow">// THE ENGINEER BEHIND THE SYSTEMS</span><h2 id="about-title">I think in systems.<br /><span className="muted">I build for people.</span></h2><div className="about-columns"><div className="identity-block"><div className="identity-monogram">hf<span>.</span><small>CODE × INDUSTRY</small></div><span>MOCHAMAD HILMY FEBRIAN<br />EKA CAHYADI</span><p>Fullstack Developer &<br />Digitalization Manufacturing</p></div><div className="about-narrative"><p>I work where software meets the physical world—connecting factory equipment, enterprise systems, and the people who rely on them.</p><p>Over 2.5+ years, I’ve delivered end-to-end digital solutions across manufacturing, logistics, and fintech. From a QR scan on the warehouse floor to a production confirmation in SAP, I care about making every connection count.</p><div className="education"><span className="eyebrow">EDUCATION / 2021—2024</span><strong>BSc Information Technology</strong><span>President University</span></div></div></div></Reveal>
        <div className="capabilities"><div className="subsection-heading"><h3>The right tools.<br />The whole picture.</h3><span className="eyebrow">// TECHNICAL TOOLKIT</span></div><div className="skills-grid">{skills.map(([category, ...items], i) => <div className="skill-group" key={category}><span className="skill-number">0{i + 1}</span><h4>{category}</h4><div>{items.map(item => <span key={item}>{item}</span>)}</div></div>)}</div></div>
        <div className="experience"><div className="subsection-heading"><h3>Always building.<br />Always connecting.</h3><span className="eyebrow">// EXPERIENCE</span></div><div className="timeline">{experience.map(([date, role, company], i) => <div className="timeline-row" key={date}><span className="timeline-date">{date}</span><div><h4>{role}{i === 0 && <span className="current-role">CURRENT</span>}</h4><p>{company}</p></div><span className="timeline-index">0{i + 1}</span></div>)}</div></div>
      </section>

      <section id="contact" className="contact-section section-shell" aria-labelledby="contact-title"><span className="eyebrow">// THE NEXT CONNECTION</span><div className="contact-heading"><h2 id="contact-title">Let’s build<br />something<span className="mint">.</span></h2><a className="contact-arrow" href="mailto:hilworking0110@gmail.com" aria-label="Email Hilmy"><Arrow diagonal /></a></div><div className="contact-bottom"><p>Have a system to connect or a problem to solve?<br />Let’s turn it into something that works.</p><a href="mailto:hilworking0110@gmail.com" className="email-link">hilworking0110@gmail.com <Arrow diagonal /></a></div></section>
    </main>
    <footer className="site-footer section-shell"><span>© {new Date().getFullYear()} HILMY FEBRIAN</span><span>ENGINEERED WITH INTENTION.</span><div><a href="https://github.com/Hilll19" target="_blank" rel="noreferrer">GITHUB <Arrow diagonal /></a><a href="https://linkedin.com/in/hilmyfebrian-hildev" target="_blank" rel="noreferrer">LINKEDIN <Arrow diagonal /></a><a href="#home" aria-label="Back to top">BACK TO TOP ↑</a></div></footer>

    <dialog ref={dialog} className="project-dialog" data-lenis-prevent aria-labelledby="project-detail-title" onCancel={closeProject} onClose={() => setSelected(null)} onClick={event => { if (event.target === dialog.current) closeProject(); }}>
      {selected && <div className="dialog-content">
        <button className="dialog-close" onClick={closeProject} aria-label="Close project details" autoFocus>Close <span>×</span></button>
        <span className="eyebrow">PROJECT {selected.id} / {selected.category}</span>
        <h2 id="project-detail-title">{selected.name}</h2>
        <p className="dialog-company">{selected.company}</p>
        <p className="dialog-description">{selected.detail}</p>
        <div className="case-study-sections">{selected.sections.map(section => <section key={section.title}>
          <h3>{section.title}</h3>
          <ul>{section.points.map(point => <li key={point}>{point}</li>)}</ul>
        </section>)}</div>
        <section className="case-study-outcome"><h3>Outcome & impact</h3><div className="project-result"><strong>{selected.metric}</strong><span>{selected.unit}</span></div><p className="dialog-description">{selected.outcome}</p></section>
        <h3>System flow</h3><ol className="project-flow">{selected.flow.map((step, i) => <li key={step}><span>0{i + 1}</span>{step}</li>)}</ol>
        <ProjectVisual type={selected.type} />
        <p className="project-note">Architecture illustrations represent the system concept; they are not screenshots or live production telemetry.</p>
        <h3>Tech stack</h3><div className="project-tags">{selected.stack.map(tag => <span key={tag}>{tag}</span>)}</div>
        <a className="text-link" href="mailto:hilworking0110@gmail.com">Discuss a similar project <Arrow diagonal /></a>
      </div>}
    </dialog>
  </>;
}

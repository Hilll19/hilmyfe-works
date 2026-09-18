'use client';

import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { journey, stageIndex, stages } from '@/lib/scroll';

const SceneCanvas = dynamic(() => import('./SceneCanvas'), { ssr: false });
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function Experience() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const fill = useRef<HTMLDivElement>(null);
  const background = useRef<HTMLDivElement>(null);
  const markCompiling = useCallback(() => setLoadProgress(50), []);
  const markReady = useCallback(() => { setLoadProgress(100); setReady(true); }, []);
  const markFailed = useCallback(() => { setEnabled(false); setReady(false); }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | undefined;
    let trigger: ScrollTrigger | undefined;
    let raf: ((time: number) => void) | undefined;
    let idle: ReturnType<typeof setTimeout>;
    const configure = () => {
      trigger?.kill();
      lenis?.destroy();
      if (raf) gsap.ticker.remove(raf);
      clearTimeout(idle);
      const target = document.getElementById('journey');
      if (!target) return;
      journey.progress = 0;
      journey.reduced = preference.matches;
      setEnabled(false);
      setReady(false);
      setLoadProgress(0);
      if (!preference.matches) {
        lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: true });
        lenis.on('scroll', ScrollTrigger.update);
        raf = (time) => lenis?.raf(time * 1000);
        gsap.ticker.add(raf);
        idle = setTimeout(() => {
          try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2');
            if (gl) { gl.getExtension('WEBGL_lose_context')?.loseContext(); setEnabled(true); }
          } catch { /* The blueprint background remains visible without WebGL. */ }
        }, 150);
      }
      trigger = ScrollTrigger.create({
        trigger: target, start: 'top top', end: 'bottom bottom', scrub: preference.matches ? false : 1,
        animation: gsap.to(journey, { progress: 1, ease: 'none', onUpdate: () => {
          setStage(stageIndex(journey.progress));
          if (fill.current) fill.current.style.transform = `scaleX(${journey.progress})`;
          if (background.current) background.current.style.opacity = String(1 - Math.max(0, journey.progress - 0.86) * 4);
        } }),
      });
      ScrollTrigger.refresh();
    };
    configure();
    preference.addEventListener('change', configure);
    return () => { clearTimeout(idle); preference.removeEventListener('change', configure); trigger?.kill(); lenis?.destroy(); if (raf) gsap.ticker.remove(raf); journey.progress = 0; };
  }, []);

  return <>
    <div className="scene-backdrop" aria-hidden="true"><div className="blueprint-grid" /><div className="signal-halo" /></div>
    <div className="scene-layer" ref={background} aria-hidden="true">
      {enabled && <SceneBoundary onError={markFailed}><SceneCanvas onReady={markReady} onError={markFailed} onCompiling={markCompiling} /></SceneBoundary>}
    </div>
    {enabled && !ready && <div className="scene-loader" role="status"><span>{loadProgress === 0 ? 'LOADING 3D MODULE' : 'COMPILING SHADERS'}</span><b>{loadProgress}%</b><div><i style={{ width: `${loadProgress}%` }} /></div></div>}
    <div className="scene-status" aria-hidden="true"><span className="live-dot" />{enabled ? ready ? 'LIVE RENDER' : 'INITIALIZING SCENE' : 'BLUEPRINT VIEW'}<span className="status-divider" />{stages[stage]}</div>
    <div className="scroll-progress" aria-hidden="true"><div ref={fill} /></div>
  </>;
}

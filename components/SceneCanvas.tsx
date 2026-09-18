'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { journey } from '@/lib/scroll';

const mint = '#79eacf';
const particleVertex = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uPixelRatio;
  attribute vec3 aTarget;
  attribute float aSeed;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    float formation = smoothstep(0.10, 0.40, uProgress);
    float extrusion = smoothstep(0.38, 0.65, uProgress);
    vec3 signal = position;
    signal.y += sin(position.x * 1.2 + uTime * 0.32 + aSeed * 5.0) * 0.13;
    signal.z += cos(position.x * 0.7 + uTime * 0.25) * 0.13;
    vec3 target = aTarget;
    float factory = step(0.3, sin(target.x * 2.0) * cos(target.z * 2.0));
    target.y += factory * extrusion * (0.6 + aSeed * 1.5);
    vec3 pos = mix(signal, target, formation);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = min(7.0, (2.5 + aSeed * 3.0) * uPixelRatio * (8.0 / -mvPosition.z));
    vAlpha = (0.3 + aSeed * 0.7) * (1.0 - extrusion * 0.65);
    vSeed = aSeed;
  }
`;
const particleFragment = `
  varying float vAlpha;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 color = mix(vec3(0.28, 0.8, 0.71), vec3(1.0, 0.55, 0.24), step(0.96, vSeed));
    gl_FragColor = vec4(color, smoothstep(0.5, 0.06, d) * vAlpha);
  }
`;
const flowVertex = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const flowFragment = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float pulse = pow(max(0.0, sin(vUv.x * 35.0 - uTime * 2.0)), 12.0);
    vec3 color = mix(vec3(0.1, 0.48, 0.39), vec3(0.63, 1.0, 0.86), pulse);
    gl_FragColor = vec4(color, (0.28 + pulse * 0.72) * uOpacity);
  }
`;

function Signal({ mobile }: { mobile: boolean }) {
  const shader = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const count = mobile ? 1800 : 5200;
    const positions = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Deterministic seeds keep the scene stable across mounts and quality tiers.
      const seed = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
      const s = Math.abs(seed);
      const t = i / count * Math.PI * 2;
      const band = (i % 13) / 13;
      const radius = 2.5 + band * 1.25 + Math.sin(t * 5) * 0.12;
      positions.set([Math.cos(t) * radius, Math.sin(t * 3) * 0.4 + (band - 0.5) * 1.3, Math.sin(t) * radius], i * 3);
      targets.set([((i % 80) / 79 - 0.5) * 8, -0.9 + s * 0.05, (Math.floor(i / 80) / Math.ceil(count / 80) - 0.5) * 6], i * 3);
      seeds[i] = s;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
    return geo;
  }, [mobile]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uProgress: { value: 0 }, uPixelRatio: { value: mobile ? 1 : Math.min(window.devicePixelRatio, 2) } }), [mobile]);
  useFrame(({ clock }) => { if (shader.current) { shader.current.uniforms.uTime.value = clock.elapsedTime; shader.current.uniforms.uProgress.value = journey.progress; } });
  return <points geometry={geometry}><shaderMaterial ref={shader} uniforms={uniforms} vertexShader={particleVertex} fragmentShader={particleFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}

function Block({ position, scale, color = '#132b2b', edge = '#3d8578' }: { position: [number, number, number]; scale: [number, number, number]; color?: string; edge?: string }) {
  return <mesh position={position} scale={scale}><boxGeometry /><meshStandardMaterial color={color} metalness={0.65} roughness={0.38} /><Edges threshold={25} color={edge} /></mesh>;
}

function Robot({ position }: { position: [number, number, number] }) {
  const elbow = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (elbow.current) elbow.current.rotation.z = -0.65 + Math.sin(clock.elapsedTime * 0.45) * 0.09; });
  return <group position={position}>
    <Block position={[0, 0.1, 0]} scale={[0.55, 0.2, 0.55]} />
    <mesh position={[0, 0.33, 0]}><cylinderGeometry args={[0.16, 0.2, 0.3, 12]} /><meshStandardMaterial color="#db965b" metalness={0.5} roughness={0.3} /></mesh>
    <group position={[0, 0.45, 0]} rotation={[0, 0, 0.3]}>
      <Block position={[0, 0.36, 0]} scale={[0.19, 0.72, 0.2]} color="#b47643" edge="#eab279" />
      <group ref={elbow} position={[0, 0.72, 0]} rotation={[0, 0, -0.65]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.26, 12]} /><meshStandardMaterial color="#9bafb0" /></mesh>
        <Block position={[0, 0.28, 0]} scale={[0.14, 0.56, 0.15]} color="#b47643" edge="#eab279" />
        <Block position={[-0.06, 0.64, 0]} scale={[0.055, 0.19, 0.14]} /><Block position={[0.06, 0.64, 0]} scale={[0.055, 0.19, 0.14]} />
      </group>
    </group>
  </group>;
}

function Factory() {
  const group = useRef<THREE.Group>(null);
  useFrame(() => { if (group.current) { const reveal = THREE.MathUtils.smoothstep(journey.progress, 0.33, 0.64); group.current.scale.y = Math.max(0.001, reveal); group.current.position.y = -0.85; group.current.visible = journey.progress > 0.32; } });
  return <group ref={group}>
    <Block position={[0, -0.12, 0]} scale={[7.5, 0.2, 5.2]} color="#0c191d" edge="#4aa38e" />
    <gridHelper args={[7, 14, '#4a8a79', '#1c3c38']} position={[0, 0.002, 0]} />
    {[-2.45, -1.22, 0, 1.22, 2.45].map((x, i) => <group key={x}>
      {[-1.65, 1.65].map(z => <group key={z} position={[x, 0, z]}>
        <Block position={[0, 0.38, 0]} scale={[0.8, 0.76, 0.74]} />
        <Block position={[0, 0.82, 0.05]} scale={[0.73, 0.12, 0.68]} color="#315453" />
        <Block position={[0, 0.48, -0.38]} scale={[0.52, 0.3, 0.025]} color="#0a1016" edge="#62988a" />
        <mesh position={[0.24, 0.95, 0]}><boxGeometry args={[0.04, 0.1, 0.04]} /><meshBasicMaterial color={i === 3 ? '#e8a061' : mint} /></mesh>
      </group>)}
    </group>)}
    <Block position={[0, 0.25, 0]} scale={[6.5, 0.22, 0.65]} color="#1e3538" />
    {Array.from({ length: 25 }, (_, i) => <mesh key={i} position={[-3 + i * 0.25, 0.39, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.065, 0.065, 0.58, 8]} /><meshStandardMaterial color="#536d6a" metalness={0.8} roughness={0.25} /></mesh>)}
    <Robot position={[-1.8, 0, -0.8]} /><Robot position={[1.2, 0, 0.65]} />
    {[-2.4, 0, 2.5].map(x => <Block key={x} position={[x, 0.56, 0]} scale={[0.36, 0.24, 0.36]} color="#bb8756" edge="#efb575" />)}
    {[[-3.6, -2.45], [3.6, -2.45], [-3.6, 2.45], [3.6, 2.45]].map(([x, z], i) => <group key={i}>
      <Block position={[x, 1.1, z]} scale={[0.06, 2.2, 0.06]} edge="#335e57" />
      <mesh position={[x, 2.22, z]}><sphereGeometry args={[0.065, 8, 8]} /><meshBasicMaterial color={mint} /></mesh>
    </group>)}
    <Block position={[0, 2.2, -2.45]} scale={[7.2, 0.05, 0.05]} edge="#436e66" />
    <Block position={[0, 2.2, 2.45]} scale={[7.2, 0.05, 0.05]} edge="#436e66" />
  </group>;
}

function Connection({ offset }: { offset: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(offset, 0, -1.6), new THREE.Vector3(offset, 1.5, -2.2), new THREE.Vector3(offset * 0.5, 2.2, -2.5), new THREE.Vector3(0, 2.7, -2.6),
  ]), 50, 0.016, 5, false), [offset]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => { if (material.current) { material.current.uniforms.uTime.value = clock.elapsedTime + offset; material.current.uniforms.uOpacity.value = THREE.MathUtils.smoothstep(journey.progress, 0.63, 0.8); } });
  return <mesh geometry={geometry}><shaderMaterial ref={material} uniforms={uniforms} vertexShader={flowVertex} fragmentShader={flowFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>;
}

function Dashboard() {
  const group = useRef<THREE.Group>(null);
  const [shown, setShown] = useState(false);
  useFrame(() => {
    const visible = journey.progress > 0.66;
    if (visible !== shown) setShown(visible);
    if (group.current) group.current.scale.setScalar(THREE.MathUtils.smoothstep(journey.progress, 0.65, 0.86));
  });
  return <group ref={group} position={[0, 2.7, -2.6]}>
    {shown && <Html transform distanceFactor={5} style={{ pointerEvents: 'none' }} center>
      <div className="world-dashboard"><div className="dashboard-header"><span>PRODUCTION INTELLIGENCE</span><span>● CONNECTED</span></div><div className="dashboard-numbers"><div><b>10</b><small>CONNECTED PLCs</small></div><div><b>3</b><small>SYSTEM LAYERS</small></div><div><b>SAP</b><small>INTEGRATION</small></div></div><div className="dashboard-chart">{[25, 45, 33, 65, 55, 77, 60, 90, 68, 86, 73, 95, 79, 93, 88, 99].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div><div className="dashboard-footer">MODBUS → MQTT → NODE-RED → SAP <span>ARCHITECTURE DEMO</span></div></div>
    </Html>}
  </group>;
}

function CameraRig({ mobile }: { mobile: boolean }) {
  const { camera, pointer } = useThree();
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(9, 6.5, 11), new THREE.Vector3(8, 8.5, 10), new THREE.Vector3(6.5, 7, 10.5), new THREE.Vector3(8, 5.5, 11.5), new THREE.Vector3(9, 6.7, 13),
  ]), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const p = journey.progress;
    path.getPoint(p, pos);
    if (mobile) pos.multiplyScalar(1.3);
    camera.position.copy(pos);
    camera.position.x += pointer.x * 0.15;
    camera.position.y += pointer.y * 0.1;
    camera.lookAt(mobile ? -0.3 : -2.5, 0.2 + p * 0.6, 0);
  });
  return null;
}

function Ready({ onReady, onError }: { onReady: () => void; onError: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let active = true;
    gl.compileAsync(scene, camera).then(() => { if (active) onReady(); }).catch(() => { if (active) onError(); });
    gl.domElement.addEventListener('webglcontextlost', onError);
    return () => { active = false; gl.domElement.removeEventListener('webglcontextlost', onError); };
  }, [gl, scene, camera, onReady, onError]);
  return null;
}

export default function SceneCanvas({ onReady, onError, onCompiling }: { onReady: () => void; onError: () => void; onCompiling: () => void }) {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768 || navigator.hardwareConcurrency <= 4);
  const [active, setActive] = useState(true);
  useEffect(() => { onCompiling(); }, [onCompiling]);
  useEffect(() => {
    const media = matchMedia('(max-width: 767px)');
    const resize = () => setMobile(media.matches || navigator.hardwareConcurrency <= 4);
    const visibility = () => setActive(!document.hidden);
    media.addEventListener('change', resize);
    document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', resize); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  return <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, mobile ? 1.25 : 2]} camera={{ position: [9, 6.5, 11], fov: 42, near: 0.1, far: 80 }} gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}>
    <ambientLight intensity={0.7} /><directionalLight position={[5, 8, 3]} intensity={2.5} color="#b2ffe9" /><pointLight position={[-4, 3, 3]} intensity={12} color="#ec9e66" />
    <CameraRig mobile={mobile} /><Signal mobile={mobile} /><Factory /><Connection offset={-2.5} /><Connection offset={0} /><Connection offset={2.5} /><Dashboard /><Ready onReady={onReady} onError={onError} />
  </Canvas>;
}

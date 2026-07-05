// frontend/src/components/home/GlobalView.jsx

import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import './GlobalView.css';

const TABS = ['Overview', 'Geopolitics', 'Economy', 'Technology', 'Markets', 'Society', 'Environment'];

export default function GlobalView() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="globe-panel">
      <div className="globe-panel__header">
        <div className="globe-panel__title-block">
          <h2 className="globe-panel__title">GLOBAL INTELLIGENCE VIEW</h2>
          <div className="globe-panel__live">
            <span className="globe-panel__live-dot" />
            <span>Live</span>
          </div>
        </div>

        <div className="globe-panel__controls">
          <button className="globe-panel__control globe-panel__control--active"><GlobeIcon /></button>
          <button className="globe-panel__control"><NetworkIcon /></button>
          <button className="globe-panel__control"><ExpandIcon /></button>
        </div>
      </div>

      <div className="globe-panel__tabs">
        {TABS.map(tab => (
          <button key={tab}
            className={`globe-panel__tab ${activeTab === tab ? 'globe-panel__tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      <div className="globe-panel__globe">
        <ThreeGlobe />
        <FloatingNodes />
      </div>

      <div className="globe-panel__signal">
        <div className="globe-panel__signal-icon"><TrendUpIcon /></div>
        <div className="globe-panel__signal-content">
          <span className="globe-panel__signal-label">↑ RISING SIGNAL</span>
          <h3 className="globe-panel__signal-title">AI Infrastructure Investment Surge</h3>
          <p className="globe-panel__signal-desc">Major cloud providers increasing capex by 35%+</p>
          <div className="globe-panel__signal-meta">
            <span>2h ago</span><span className="globe-panel__signal-dot">•</span><span>Technology</span>
          </div>
        </div>
        <button className="globe-panel__signal-btn">→</button>
      </div>

      <div className="globe-panel__dots">
        <span className="globe-panel__dot globe-panel__dot--active" />
        <span className="globe-panel__dot" />
        <span className="globe-panel__dot" />
        <span className="globe-panel__dot" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   THREE.JS EARTH GLOBE
   Real earth with night lights, atmosphere, rotation
   ═══════════════════════════════════════════════════ */
function ThreeGlobe() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Earth group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Load earth textures (using free CDN textures)
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';

    const earthTexture = loader.load(
      'https://unpkg.com/three-globe/example/img/earth-night.jpg'
    );

    // Earth sphere
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.9,
      metalness: 0.05,
      emissive: new THREE.Color(0x222222),
      emissiveIntensity: 0.4
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    // Atmosphere glow — outer sphere with fresnel shader
    const atmosphereGeometry = new THREE.SphereGeometry(1.08, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.31, 0.56, 0.35, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphere);

    // Orbital rings — thin gold circles at angles
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0xCFC4A8,
      transparent: true,
      opacity: 0.35
    });

    // 3 orbital rings at different tilts
    const ringTilts = [
      { x: 0.3, y: 0, z: 0.2 },
      { x: -0.4, y: 0.3, z: -0.1 },
      { x: 0.2, y: -0.4, z: 0.4 }
    ];

    ringTilts.forEach(tilt => {
      const points = [];
      const radius = 1.35;
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(theta) * radius,
          0,
          Math.sin(theta) * radius
        ));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const ring = new THREE.Line(geo, ringMaterial);
      ring.rotation.set(tilt.x, tilt.y, tilt.z);
      ringGroup.add(ring);
    });

    // Small glowing dots on orbital rings
    const dotGeometry = new THREE.SphereGeometry(0.018, 8, 8);
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: 0xEAE6DC,
      transparent: true,
      opacity: 0.9
    });

    const dots = [];
    ringTilts.forEach((tilt, ringIdx) => {
      for (let i = 0; i < 4; i++) {
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        const angle = (i / 4) * Math.PI * 2 + ringIdx;
        const radius = 1.35;
        dot.userData = { ringIdx, angle, radius, tilt };
        ringGroup.add(dot);
        dots.push(dot);
      }
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Subtle green rim light
    const rimLight = new THREE.DirectionalLight(0x4F8F5A, 0.3);
    rimLight.position.set(-5, 0, -3);
    scene.add(rimLight);

    // Animation
    let animationId;
    let time = 0;

    const animate = () => {
      time += 0.003;
      earthGroup.rotation.y += 0.0008;

      // Animate dots along rings
      dots.forEach((dot) => {
        const { angle, radius, tilt } = dot.userData;
        const t = time * 0.3 + angle;

        // Position on ring
        const localX = Math.cos(t) * radius;
        const localZ = Math.sin(t) * radius;

        // Apply ring tilt
        const cy = Math.cos(tilt.y), sy = Math.sin(tilt.y);
        const cx = Math.cos(tilt.x), sx = Math.sin(tilt.x);

        let x = localX * cy;
        let y = localZ * sx;
        let z = -localX * sy + localZ * cx;

        dot.position.set(x, y, z);
      });

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      earthTexture.dispose();
    };
  }, []);

  return <div ref={mountRef} className="globe-canvas" />;
}

/* Floating node badges on top of globe */
function FloatingNodes() {
  return (
    <>
      <div className="globe-viz__node" style={{ left: '30%', top: '38%' }}>
        <NodeBadge type="chart" />
      </div>
      <div className="globe-viz__node" style={{ left: '54%', top: '32%' }}>
        <NodeBadge type="users" />
      </div>
      <div className="globe-viz__node" style={{ left: '72%', top: '42%' }}>
        <NodeBadge type="gov" />
      </div>
      <div className="globe-viz__node" style={{ left: '60%', top: '60%' }}>
        <NodeBadge type="leaf" />
      </div>
      <div className="globe-viz__node" style={{ left: '38%', top: '58%' }}>
        <NodeBadge type="doc" variant="green" />
      </div>
    </>
  );
}

function NodeBadge({ type, variant }) {
  return (
    <div className={`node-badge ${variant === 'green' ? 'node-badge--green' : ''}`}>
      <div className="node-badge__halo" />
      <div className="node-badge__core"><NodeIcon type={type} /></div>
    </div>
  );
}

function NodeIcon({ type }) {
  const props = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 };
  if (type === 'chart') return <svg {...props}><path d="M4 20V10M10 20V4M16 20v-8M4 20h16"/></svg>;
  if (type === 'users') return <svg {...props}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M14 20c0-2 2-4 4-4s4 2 4 4"/></svg>;
  if (type === 'gov')   return <svg {...props}><path d="M4 20h16M6 20v-8M10 20v-8M14 20v-8M18 20v-8M4 12h16M12 4l10 6H2l10-6z"/></svg>;
  if (type === 'leaf')  return <svg {...props}><path d="M6 20c0-8 6-14 14-14 0 8-6 14-14 14zM6 20l14-14"/></svg>;
  if (type === 'doc')   return <svg {...props}><path d="M6 3h9l5 5v13H6V3zM14 3v6h6M9 13h6M9 17h4"/></svg>;
  return null;
}

function GlobeIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 4 3 14 0 18M12 3c-3 4-3 14 0 18"/>
  </svg>;
}
function NetworkIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/>
    <path d="M7 6h10M7 18h10M5 8v8M19 8v8"/>
  </svg>;
}
function ExpandIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>
  </svg>;
}
function TrendUpIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 17l6-6 4 4 6-8"/><path d="M14 7h6v6"/>
  </svg>;
}

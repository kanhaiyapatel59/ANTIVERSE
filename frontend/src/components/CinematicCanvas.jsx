import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Helper: Procedural Earth Texture (Landmasses + Oceans + Night City Lights)
function createEarthTextures() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep Ocean Base
  ctx.fillStyle = '#040b18';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Oceans gradient depth
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#092147');
  oceanGrad.addColorStop(0.5, '#051633');
  oceanGrad.addColorStop(1, '#092147');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stylized Continents (Asia, Europe, Africa, Americas, Australia)
  ctx.fillStyle = '#173626';
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 1.5;

  const drawContinent = (points, cityDots = []) => {
    ctx.beginPath();
    points.forEach(([x, y], idx) => {
      const px = (x / 360) * canvas.width;
      const py = (1 - (y + 90) / 180) * canvas.height;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // City lights (Glow dots)
    ctx.fillStyle = '#ffb700';
    cityDots.forEach(([x, y]) => {
      const px = (x / 360) * canvas.width;
      const py = (1 - (y + 90) / 180) * canvas.height;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#173626';
  };

  // Asia / India
  drawContinent([
    [60, 35], [75, 30], [80, 10], [90, 22], [105, 10], 
    [120, 30], [140, 50], [120, 65], [80, 60], [60, 45]
  ], [[77, 28], [72, 19], [88, 22], [116, 40], [139, 35]]);

  // Europe / Africa
  drawContinent([
    [-10, 35], [30, 40], [45, 15], [40, -30], [15, -35],
    [0, 5], [-15, 15]
  ], [[0, 51], [12, 41], [37, 55], [31, 30]]);

  // Americas
  drawContinent([
    [-130, 50], [-70, 50], [-80, 25], [-60, -10], [-40, -15],
    [-70, -55], [-80, -20], [-100, 20], [-125, 35]
  ], [[-74, 40], [-118, 34], [-43, -22], [-77, 39]]);

  // Australia
  drawContinent([
    [115, -15], [150, -15], [150, -38], [115, -35]
  ], [[151, -33], [144, -37]]);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

// Procedural Cloud Texture
function createCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let i = 0; i < 350; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const rx = 20 + Math.random() * 60;
    const ry = 10 + Math.random() * 30;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

// 3D Earth Globe Component (Continuous Motion & Rotation for Home Page)
function EarthGlobe() {
  const earthGroupRef = useRef();
  const earthRef = useRef();
  const cloudsRef = useRef();
  const atmosphereRef = useRef();
  const satelliteRingRef = useRef();
  const radarRef = useRef();

  const earthTexture = useMemo(() => createEarthTextures(), []);
  const cloudTexture = useMemo(() => createCloudTexture(), []);

  // Dispose WebGL textures on unmount to release GPU memory & prevent context loss
  useEffect(() => {
    return () => {
      try {
        if (earthTexture) earthTexture.dispose();
        if (cloudTexture) cloudTexture.dispose();
      } catch (e) {
        // Ignore dispose errors on unmount
      }
    };
  }, [earthTexture, cloudTexture]);

  // Emergency Hotspots (Asia, Europe, Americas, Australia)
  const hotspots = useMemo(() => [
    { pos: [1.3, 0.8, 1.7], label: "SECTOR 4 FLOOD", color: "#ff0055" },
    { pos: [-1.5, 1.2, 1.3], label: "SECTOR 1 STORM", color: "#ffaa00" },
    { pos: [0.3, 1.9, 1.1], label: "EUROPE COMMAND", color: "#00f2fe" },
    { pos: [-1.9, -0.6, 1.0], label: "AMERICAS RELAY", color: "#00f2fe" }
  ], []);

  // Communication Arcs
  const arcs = useMemo(() => {
    const points = [];
    const p1 = new THREE.Vector3(1.3, 0.8, 1.7);
    const p2 = new THREE.Vector3(-1.5, 1.2, 1.3);
    const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(2.7);
    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    points.push(curve.getPoints(30));

    const p3 = new THREE.Vector3(1.3, 0.8, 1.7);
    const p4 = new THREE.Vector3(0.3, 1.9, 1.1);
    const mid2 = p3.clone().add(p4).multiplyScalar(0.5).normalize().multiplyScalar(2.6);
    const curve2 = new THREE.QuadraticBezierCurve3(p3, mid2, p4);
    points.push(curve2.getPoints(30));

    return points;
  }, []);

  useFrame((state, delta) => {
    // Continuous 360-degree dark earth rotation all the time
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.15;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.20;
    if (satelliteRingRef.current) satelliteRingRef.current.rotation.z += delta * 0.45;
    if (radarRef.current) radarRef.current.rotation.z -= delta * 0.90;

    // Mouse parallax tilt
    if (earthGroupRef.current) {
      const mouseX = state.mouse.x * 0.35;
      const mouseY = state.mouse.y * 0.35;
      earthGroupRef.current.rotation.x = THREE.MathUtils.lerp(earthGroupRef.current.rotation.x, mouseY, 0.05);
      earthGroupRef.current.rotation.y = THREE.MathUtils.lerp(earthGroupRef.current.rotation.y, mouseX, 0.05);
    }
  });

  return (
    <group ref={earthGroupRef} position={[0, 0, 0]}>
      {/* Primary 3D Dark Earth Sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.35, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.35}
          metalness={0.25}
        />
      </mesh>

      {/* Clouds Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.39, 64, 64]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent={true}
          opacity={0.38}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Atmospheric Glowing Halo */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.52, 48, 48]} />
        <meshBasicMaterial
          color="#00d2ff"
          transparent={true}
          opacity={0.22}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Satellite Orbit Rings */}
      <group ref={satelliteRingRef} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <ringGeometry args={[3.25, 3.28, 64]} />
          <meshBasicMaterial color="#00f2fe" transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
        {/* Orbiting Satellite Marker */}
        <mesh position={[3.26, 0, 0]}>
          <boxGeometry args={[0.09, 0.09, 0.09]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Radar Sweeping Beam Disk */}
      <group ref={radarRef} rotation={[0, 0, Math.PI / 6]}>
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[0.1, 3.6, 32, 1, 0, Math.PI / 4]} />
          <meshBasicMaterial color="#00f2fe" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Emergency Hotspots & Radar Pulse Overlays */}
      {hotspots.map((spot, idx) => (
        <group key={idx} position={spot.pos}>
          <mesh>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color={spot.color} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.09, 0.16, 16]} />
            <meshBasicMaterial color={spot.color} transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Communication Data Lines */}
      {arcs.map((pts, idx) => (
        <line key={idx}>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              count={pts.length}
              array={new Float32Array(pts.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#00f2fe" linewidth={2} transparent opacity={0.75} />
        </line>
      ))}
    </group>
  );
}

// Background Particles
function SpeedParticles({ count = 600 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const z = (Math.random() - 0.5) * 150;
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      temp.push({ x, y, z, speed: 0.3 + Math.random() * 0.8 });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    particles.forEach((p, i) => {
      p.z += p.speed;
      if (p.z > 50) p.z = -100;
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(0.1, 0.1, 1.2);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <boxGeometry args={[0.04, 0.04, 0.3]} />
      <meshBasicMaterial color="#00f2fe" transparent opacity={0.25} />
    </instancedMesh>
  );
}

// Camera Controller driving continuous framing & mouse tracking on Home Page
function CameraTimelineController({ onPhaseChange, isReplaying }) {
  const { camera } = useThree();

  useEffect(() => {
    // Initial Camera Intro Fly-in to Home Position
    camera.position.set(0, 8, 35);
    camera.lookAt(0, 0, 0);

    const tl = gsap.timeline();

    tl.to(camera.position, {
      z: 6.0,
      y: 0.3,
      x: 0,
      duration: 1.5,
      ease: "power3.out",
      onStart: () => onPhaseChange && onPhaseChange("3D Earth Active"),
    });

    return () => {
      tl.kill();
    };
  }, [camera, onPhaseChange, isReplaying]);

  useFrame((state) => {
    // Continuous mouse parallax camera movement
    const targetX = state.mouse.x * 0.4;
    const targetY = 0.3 + state.mouse.y * 0.3;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// React Error Boundary for 3D WebGL Canvas
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('⚠️ 3D WebGL Canvas Context Lost or Error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#030611] via-[#050c1e] to-[#030611] pointer-events-none z-0" />
      );
    }
    return this.props.children;
  }
}

export default function CinematicCanvas({ onPhaseChange, isReplaying }) {
  return (
    <CanvasErrorBoundary>
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <Canvas
          camera={{ position: [0, 0.3, 6.0], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: "default", failIfMajorPerformanceCaveat: false }}
          onCreated={({ gl }) => {
            const canvasEl = gl.domElement;
            const handleContextLost = (event) => {
              event.preventDefault();
              console.warn("⚠️ WebGL context lost captured. Gracefully preventing crash...");
            };
            canvasEl.addEventListener("webglcontextlost", handleContextLost, false);
          }}
          className="w-full h-full"
        >
          {/* Lighting for Dark Earth */}
          <ambientLight intensity={0.28} />
          <directionalLight position={[12, 10, 10]} intensity={2.0} color="#ffffff" />
          <pointLight position={[-15, 5, -20]} intensity={1.2} color="#ffaa00" />
          <pointLight position={[0, -10, 10]} intensity={0.6} color="#00f2fe" />

          {/* Scene Components */}
          <Stars radius={150} depth={60} count={7000} factor={4} saturation={0.5} fade speed={1.8} />
          <SpeedParticles count={500} />
          <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
            <EarthGlobe />
          </Float>

          {/* Camera Controller */}
          <CameraTimelineController
            key={isReplaying ? Date.now() : 'initial'}
            isReplaying={isReplaying}
            onPhaseChange={onPhaseChange}
          />
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}

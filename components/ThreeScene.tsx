
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import type { ThreeSceneHandle } from '../types';

interface ThreeSceneProps {
  armyMode: boolean;
  sakuraEnabled: boolean;
  lightstickOn: boolean;
  performanceMode: boolean;
  onBirthday: boolean;
}

const ThreeScene = forwardRef<ThreeSceneHandle, ThreeSceneProps>((props, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const [hintVisible, setHintVisible] = useState(true);

  // Refs to store three.js objects and mutable states
  const sceneInstance = useRef<any>({});

  useEffect(() => {
    if (!mountRef.current) return;
    
    const { armyMode, sakuraEnabled, lightstickOn, performanceMode } = props;
    const DPR = Math.min(isMobile ? 1.75 : 2, window.devicePixelRatio || 1);
    
    const buzz = (pattern: number | number[] = 20) => { if (navigator.vibrate) navigator.vibrate(pattern); };

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0a1a, 0.045);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(DPR);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 2.1, 9.2);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.58;
    controls.minDistance = 4;
    controls.maxDistance = 18;

    // ... Lights ...
    const hemi = new THREE.HemisphereLight(0xd6ccff, 0x120e2b, 0.9);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(6, 10, 6);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    scene.add(dir);
    const fill = new THREE.SpotLight(0x8b5cf6, 0.65, 40, Math.PI / 4, 0.5, 1);
    fill.position.set(-6, 7, 5);
    scene.add(fill);

    // ... Scene Objects ...
    const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 64), new THREE.MeshStandardMaterial({ color: 0x141233, roughness: 0.95 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const starCount = isMobile ? 900 : 1400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        const r = 60 + Math.random() * 80;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        starPos[i * 3 + 1] = r * Math.cos(ph);
        starPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const stars = new THREE.Points(
        new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(starPos, 3)),
        new THREE.PointsMaterial({ size: 0.05, color: 0xa78bfa, transparent: true, opacity: 0.82, depthWrite: false })
    );
    scene.add(stars);
    
    // ... Store instance variables ...
    sceneInstance.current = {
      renderer, camera, scene, controls, buzz, stars,
      firework: (origin?: THREE.Vector3) => firework(origin),
      confettiBurst: (center: THREE.Vector3, amount = 160) => confettiBurst(center, amount),
      heartPulse: () => heartPulse(),
    };

    // ... Functions (defined inside useEffect to capture scope) ...
    // FIX: Changed function declarations and assignments to const function expressions to avoid reassignment errors.
    const createHeart = function(size = 0.95, depth = 0.45, color = 0x8b5cf6) {
        const s = new THREE.Shape();
        s.moveTo(0, 0);
        s.bezierCurveTo(0, 0, -0.5, -0.5, -1.2, 0.1);
        s.bezierCurveTo(-2.2, 1.2, -0.8, 2.3, 0, 1.3);
        s.bezierCurveTo(0.8, 2.3, 2.2, 1.2, 1.2, 0.1);
        s.bezierCurveTo(0.5, -0.5, 0, 0, 0, 0);
        const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSegments: 8, steps: 2, bevelSize: 0.06, bevelThickness: 0.06 });
        geo.center(); geo.scale(size, size, size);
        const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.45, roughness: 0.15, emissive: 0x2f165f, emissiveIntensity: 0.28 });
        const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m;
    };
    const makeLanterns = function() {
        const lanternGroup = new THREE.Group(); scene.add(lanternGroup);
        const lanternsArr: any[] = []; const lanternCount = 10; const lanternRadius = 6;
        const hoopMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.4, metalness: 0.2 });
        for (let i = 0; i < lanternCount; i++) {
            const angle = i / lanternCount * Math.PI * 2;
            const g = new THREE.Group();
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xfff4d6, emissive: 0xffe1a1, emissiveIntensity: 0.65, side: THREE.DoubleSide, roughness: 0.6 }));
            const hoopGeo = new THREE.TorusGeometry(0.36, 0.03, 8, 16);
            const hoopT = new THREE.Mesh(hoopGeo, hoopMat); const hoopB = new THREE.Mesh(hoopGeo, hoopMat);
            hoopT.rotation.x = hoopB.rotation.x = Math.PI / 2; hoopT.position.y = 0.48; hoopB.position.y = -0.48;
            const light = new THREE.PointLight(0xffc58d, 1.0, 6, 2); light.position.set(0, 0.1, 0);
            g.add(body, hoopT, hoopB, light);
            const x = Math.cos(angle) * lanternRadius, z = Math.sin(angle) * lanternRadius;
            g.position.set(x, 2.6, z); g.lookAt(0, 2.0, 0); lanternGroup.add(g);
            lanternsArr.push({ group: g, light, baseY: g.position.y, phase: Math.random() * Math.PI * 2 });
        }
        return lanternsArr;
    };
    const makePetals = function() {
      const pSprites: THREE.Sprite[] = [];
      const basePetalCount = isMobile ? 120 : 180;
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const x = c.getContext('2d')!; x.translate(64, 72); x.rotate(-0.25);
      const g = x.createRadialGradient(0, 0, 5, 0, 0, 60);
      g.addColorStop(0, 'rgba(255,214,235,.95)'); g.addColorStop(1, 'rgba(238,125,189,.08)');
      x.fillStyle = g; x.beginPath(); x.moveTo(0, -48); x.quadraticCurveTo(26, -26, 0, 48); x.quadraticCurveTo(-26, -26, 0, -48); x.fill();
      const petalTex = new THREE.CanvasTexture(c);
      const petalMat = new THREE.SpriteMaterial({ map: petalTex, transparent: true, depthWrite: false, opacity: 0.9 });
      for (let i = 0; i < basePetalCount; i++) {
        const s = new THREE.Sprite(petalMat.clone());
        s.scale.setScalar(0.6 + Math.random() * 0.9);
        s.position.set((Math.random() - 0.5) * 16, 6 + Math.random() * 6, (Math.random() - 0.5) * 16);
        s.userData = { vy: -(0.01 + Math.random() * 0.02), vx: (Math.random() - 0.5) * 0.01, vz: (Math.random() - 0.5) * 0.01, rot: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.02 };
        pSprites.push(s); scene.add(s);
      }
      return pSprites;
    }
    const makeLightstick = function() {
        const stickGroup = new THREE.Group();
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 16), new THREE.MeshStandardMaterial({ color: 0x2d2857, metalness: 0.2, roughness: 0.6 }));
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 16), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.0, roughness: 0.25, transmission: 0.75, thickness: 0.4, transparent: true }));
        bulb.position.y = 1.1;
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x7c3aed, emissiveIntensity: 1.2 }));
        core.position.y = 1.1;
        const stickLight = new THREE.PointLight(0x9b7cfa, 1.1, 7, 2); stickLight.position.set(0, 1.1, 0);
        handle.castShadow = true;
        stickGroup.add(handle, bulb, core, stickLight);
        stickGroup.position.set(-1.8, 2.0, 1.2); stickGroup.rotation.z = 0.2;
        scene.add(stickGroup);
        return stickGroup;
    }
    const make3DText = function(text: string, { font, size = 0.8, height = 0.22, color = 0xffffff, y = 0 }: any) {
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.25, emissive: 0x120a2a, emissiveIntensity: 0.2 });
        const geo = new TextGeometry(text, { font, size, height, curveSegments: 12, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.02, bevelSegments: 5 });
        geo.center();
        const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.position.y = y; return mesh;
    };
    const makeTextBillboard = function(text: string, { font, color, y }: any) {
        const dpr = Math.min(2, devicePixelRatio || 1);
        const c = document.createElement('canvas'); const ctx = c.getContext('2d')!;
        ctx.font = font; const wPx = Math.ceil(ctx.measureText(text).width) + (28 * dpr) * 2;
        c.width = wPx; c.height = (96 * dpr) + (28 * dpr) * 2;
        ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = color; ctx.shadowBlur = 20 * dpr; ctx.fillStyle = color;
        ctx.fillText(text, c.width / 2, c.height / 2);
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
        sprite.scale.set(c.width * 0.012, c.height * 0.012, 1); sprite.position.set(0, y, 0); return sprite;
    };

    const heart = createHeart(); heart.position.set(0, 2.25, 0); scene.add(heart);
    
    const lanterns = makeLanterns();
    
    // ... Text ...
    const loader = new FontLoader();
    const FONT_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json';
    loader.load(FONT_URL, (font) => {
        scene.add(
            make3DText('Happy Birthday!', { font, size: 0.82, height: 0.25, y: 4.9 }),
            make3DText('Ava', { font, size: 1.0, color: 0xa78bfa, y: 4.0 }),
            make3DText('Sep 7', { font, size: 0.5, color: 0xf4c430, y: 3.2 })
        );
    });

    document.fonts.ready.then(() => {
        scene.add(
            makeTextBillboard('생일 축하해!', { font: '700 64px "Noto Sans KR"', color: '#a3e635', y: 2.5 }),
            makeTextBillboard('お誕生日おめでとう！', { font: '700 56px "Noto Sans JP"', color: '#60a5fa', y: 1.9 })
        );
    });

    const petalSprites = makePetals();
    const stick = makeLightstick();
    
    const fireworks: THREE.Points[] = [];
    const confettiMeshes: THREE.Mesh[] = [];
    
    // ... Update sceneInstance with objects that are now created ...
    Object.assign(sceneInstance.current, { heart, lanterns, petalSprites, stick, fireworks, confettiMeshes });

    function confettiBurst(center: THREE.Vector3, amount = 160) {
        const geo = new THREE.PlaneGeometry(0.15, 0.15);
        const group = new THREE.Group();
        for (let i = 0; i < amount; i++) {
            const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 1, depthWrite: false }));
            m.position.copy(center);
            m.userData = { vx: (Math.random() - 0.5) * 0.25, vy: Math.random() * 0.28 + 0.08, vz: (Math.random() - 0.5) * 0.25, spinX: (Math.random() - 0.5) * 0.3, spinY: (Math.random() - 0.5) * 0.3 };
            m.material.color.setHSL(Math.random(), 0.9, 0.55);
            group.add(m); confettiMeshes.push(m);
        }
        scene.add(group);
        buzz(18);
        setTimeout(() => { const fade = setInterval(() => { group.children.forEach(m => (m as THREE.Mesh<any, THREE.MeshBasicMaterial>).material.opacity -= 0.04); }, 40); setTimeout(() => { clearInterval(fade); scene.remove(group); }, 1200); }, 800);
    }
    function firework(origin = new THREE.Vector3((Math.random() - 0.5) * 8, 5 + Math.random() * 3, (Math.random() - 0.5) * 8), color = new THREE.Color().setHSL(Math.random(), 0.85, 0.6)) {
        const n = 240, pos = new Float32Array(n * 3), vel = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
            const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), sp = 0.02 + Math.random() * 0.08;
            const vx = Math.sin(ph) * Math.cos(th) * sp, vy = Math.cos(ph) * sp, vz = Math.sin(ph) * Math.sin(th) * sp;
            pos[i * 3] = origin.x; pos[i * 3 + 1] = origin.y; pos[i * 3 + 2] = origin.z;
            vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz;
        }
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('velocity', new THREE.BufferAttribute(vel, 3));
        const mat = new THREE.PointsMaterial({ size: 0.08, color, transparent: true, opacity: 1, depthWrite: false });
        const pts = new THREE.Points(geo, mat); (pts.userData as any).life = 1.0; scene.add(pts); fireworks.push(pts);
        buzz([10, 40, 20]);
    }
    function heartPulse() {
        let t0 = performance.now();
        const startColor = (heart.material as THREE.MeshStandardMaterial).color.clone();
        const endColor = new THREE.Color(0x9b7cfa);
        function step() {
            const k = Math.min(1, (performance.now() - t0) / 420);
            heart.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.18);
            (heart.material as THREE.MeshStandardMaterial).color.lerpColors(startColor, endColor, Math.sin(k * Math.PI));
            if (k < 1) requestAnimationFrame(step); else { heart.scale.setScalar(1); (heart.material as THREE.MeshStandardMaterial).color.copy(startColor); }
        }
        step();
    }
    
    // ... Animation Loop ...
    const clock = new THREE.Clock();
    let animationId: number;
    function animate() {
      const t = clock.getElapsedTime();
      animationId = requestAnimationFrame(animate);

      heart.rotation.y = t * 0.5;
      heart.position.y = 2.25 + Math.sin(t * 1.6) * 0.06;
      lanterns.forEach(l => { l.group.position.y = l.baseY + Math.sin(t * 1.6 + l.phase) * 0.18; });
      stars.rotation.y = t * 0.01;
      
      if (props.sakuraEnabled) {
          petalSprites.forEach(s => {
              s.userData.rot += s.userData.spin;
              (s.material as THREE.SpriteMaterial).rotation = s.userData.rot;
              s.position.x += s.userData.vx + Math.sin(t * 0.5 + s.position.y) * 0.002;
              s.position.z += s.userData.vz + Math.cos(t * 0.6 + s.position.x) * 0.002;
              s.position.y += s.userData.vy;
              if (s.position.y < -1) { s.position.y = 7 + Math.random() * 4; s.position.x = (Math.random() - 0.5) * 16; s.position.z = (Math.random() - 0.5) * 16; }
          });
      }

      confettiMeshes.forEach(m => {
          m.position.x += m.userData.vx; m.position.y += m.userData.vy; m.position.z += m.userData.vz;
          m.userData.vy -= 0.01;
          m.rotation.x += m.userData.spinX; m.rotation.y += m.userData.spinY;
      });

      for (let i = fireworks.length - 1; i >= 0; i--) {
          const p = fireworks[i]; const pos = p.geometry.getAttribute('position') as THREE.BufferAttribute; const vel = p.geometry.getAttribute('velocity') as THREE.BufferAttribute;
          for (let j = 0; j < pos.count; j++) {
              vel.array[j * 3 + 1] -= 0.0018;
              pos.array[j * 3] += vel.array[j * 3]; pos.array[j * 3 + 1] += vel.array[j * 3 + 1]; pos.array[j * 3 + 2] += vel.array[j * 3 + 2];
          }
          pos.needsUpdate = true; p.userData.life -= 0.018; (p.material as THREE.PointsMaterial).opacity = Math.max(0, p.userData.life);
          if (p.userData.life <= 0) { scene.remove(p); fireworks.splice(i, 1); }
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // ... Event Listeners ...
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // ... Interaction Logic ...
    let lastTap = 0, holdTimer: any = null, holding = false;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function worldPosFromPointer(e: PointerEvent, planeY=3.5){
        pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const t = (planeY - raycaster.ray.origin.y) / raycaster.ray.direction.y;
        return raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(t));
    }

    const onPointerDown = (e: PointerEvent) => {
        const t = Date.now();
        if (t - lastTap < 300) { // double-tap
            heartPulse(); buzz(16);
            lastTap = 0;
        } else {
            lastTap = t;
            holding = true;
            const pos = worldPosFromPointer(e);
            confettiBurst(pos, 140);
            holdTimer = setTimeout(function spawn() {
                if (!holding) return;
                confettiBurst(worldPosFromPointer(e), 90);
                holdTimer = setTimeout(spawn, 220);
            }, 420);
        }
        setHintVisible(false);
    };
    const onPointerUp = () => { holding = false; clearTimeout(holdTimer); };
    mountRef.current.addEventListener('pointerdown', onPointerDown);
    mountRef.current.addEventListener('pointerup', onPointerUp);
    mountRef.current.addEventListener('pointercancel', onPointerUp);
    mountRef.current.addEventListener('pointerleave', onPointerUp);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('pointerdown', onPointerDown);
        mountRef.current.removeEventListener('pointerup', onPointerUp);
        mountRef.current.removeEventListener('pointercancel', onPointerUp);
        mountRef.current.removeEventListener('pointerleave', onPointerUp);
        mountRef.current.removeChild(renderer.domElement);
      }
      // Proper Three.js cleanup
      scene.traverse(object => {
          if (object instanceof THREE.Mesh) {
              if (object.geometry) object.geometry.dispose();
              if (object.material) {
                  if (Array.isArray(object.material)) {
                      object.material.forEach(material => material.dispose());
                  } else {
                      object.material.dispose();
                  }
              }
          }
      });
      renderer.dispose();
    };
  }, []); // End of main useEffect

  // Prop-driven updates
  useEffect(() => {
    const { heart, stars, lanterns } = sceneInstance.current;
    if (!heart) return;
    document.body.style.background = props.armyMode ? 'radial-gradient(1200px 700px at 58% 24%, #3b2b7a, #0b0a1a)' : 'radial-gradient(1200px 700px at 60% 25%, #1a1635, #0b0a1a)';
    heart.material.color.set(props.armyMode ? 0x7c3aed : 0x8b5cf6);
    stars.material.color.set(props.armyMode ? 0xc4b5fd : 0xa78bfa);
    lanterns.forEach((l: any) => l.light.color.set(props.armyMode ? 0xb794f4 : 0xffc58d));
  }, [props.armyMode]);

  useEffect(() => {
    const { petalSprites } = sceneInstance.current;
    if (petalSprites) petalSprites.forEach((s: THREE.Sprite) => s.visible = props.sakuraEnabled);
  }, [props.sakuraEnabled]);
  
  useEffect(() => {
    const { stick } = sceneInstance.current;
    if (stick) stick.visible = props.lightstickOn;
  }, [props.lightstickOn]);
  
  useEffect(() => {
    const { renderer, stars, petalSprites } = sceneInstance.current;
    if (!renderer) return;
    renderer.shadowMap.enabled = !props.performanceMode;
    stars.material.size = props.performanceMode ? 0.04 : 0.05;
    petalSprites.forEach((s: THREE.Sprite, i: number) => { s.visible = props.sakuraEnabled && (!props.performanceMode || i % 2 === 0); });
  }, [props.performanceMode, props.sakuraEnabled]);

  useEffect(() => {
    if (props.onBirthday) {
      const { firework } = sceneInstance.current;
      if (firework) {
        for(let i=0;i<4;i++) setTimeout(() => firework(), i * 900);
        const id = setInterval(() => firework(), 4500);
        return () => clearInterval(id);
      }
    }
  }, [props.onBirthday]);


  useImperativeHandle(ref, () => ({
    triggerFireworks: () => {
        sceneInstance.current.firework?.();
    },
    playChime: () => {
        let audioCtx = sceneInstance.current.audioCtx;
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            sceneInstance.current.audioCtx = audioCtx;
        }
        const seq = [440, 554, 659, 880];
        let t = audioCtx.currentTime;
        seq.forEach((f) => {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.type = 'sine'; o.frequency.value = f;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.25, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
            o.connect(g).connect(audioCtx.destination);
            o.start(t); o.stop(t + 0.3);
            t += 0.07;
        });
        sceneInstance.current.buzz?.([10, 40, 10]);
    },
    toggleFullscreen: async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen?.();
            } else {
                await document.exitFullscreen?.();
            }
        } catch (e) { console.error("Fullscreen failed:", e); }
    },
    toggleTilt: async (): Promise<boolean> => {
        let tiltEnabled = false;
        const enabled = () => {
            tiltEnabled = true;
            const { camera, buzz } = sceneInstance.current;
            
            const handleOrientation = (e: DeviceOrientationEvent) => {
                const yaw = (e.gamma || 0) / 45; // left/right
                const pitch = (e.beta || 0) / 60; // forward/back
                camera.position.x = yaw * 1.0;
                camera.position.y = 2.1 + pitch * 0.6;
            };
            
            let lastShake = 0;
            const handleMotion = (e: DeviceMotionEvent) => {
                const a = e.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
                const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
                if (mag > 18 && Date.now() - lastShake > 1200) {
                    lastShake = Date.now();
                    sceneInstance.current.firework?.();
                }
            };

            window.addEventListener('deviceorientation', handleOrientation, true);
            window.addEventListener('devicemotion', handleMotion, true);
            buzz?.(10);
            sceneInstance.current.cleanupTilt = () => {
                window.removeEventListener('deviceorientation', handleOrientation, true);
                window.removeEventListener('devicemotion', handleMotion, true);
            }
        };

        try {
            if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
                const r1 = await (DeviceMotionEvent as any).requestPermission();
                const r2 = typeof (DeviceOrientationEvent as any).requestPermission === 'function'
                    ? await (DeviceOrientationEvent as any).requestPermission() : 'granted';
                if (r1 === 'granted' && r2 === 'granted') enabled();
            } else {
                enabled();
            }
        } catch (e) {
            console.error("Tilt permission denied:", e);
        }
        return tiltEnabled;
    },
  }));

  return (
    <>
      <div ref={mountRef} className="fixed inset-0 z-0" />
      <div className="fixed inset-[-10px] pointer-events-none bg-[radial-gradient(60%_60%_at_50%_50%,_transparent_55%,_rgba(0,0,0,.22)_100%)] z-[5]"></div>
      {hintVisible && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[calc(120px+env(safe-area-inset-bottom))] bg-[rgba(17,14,38,.7)] border border-[rgba(167,139,250,.4)] rounded-xl px-3 py-2 text-sm z-20 backdrop-blur-sm transition-opacity duration-500">
          Tap, double‑tap, long‑press • Tilt/Shake for more 🎉
        </div>
      )}
      <div className="fixed right-[10px] bottom-[calc(12px+env(safe-area-inset-bottom))] z-[11] text-xs opacity-60 pointer-events-none">
        Fan‑made • Three.js • No lyrics used
      </div>
    </>
  );
});

export default ThreeScene;

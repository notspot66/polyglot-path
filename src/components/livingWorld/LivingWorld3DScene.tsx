import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { WorldLocation, LocationId } from '../../types';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/audio';

interface LivingWorld3DSceneProps {
  locations: WorldLocation[];
  unlockedLocationIds: LocationId[];
  userXp: number;
  onSelectLocation: (loc: WorldLocation) => void;
  selectedLocation: WorldLocation | null;
}

export const LivingWorld3DScene: React.FC<LivingWorld3DSceneProps> = ({
  locations,
  unlockedLocationIds,
  userXp,
  onSelectLocation,
  selectedLocation,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredLocationId, setHoveredLocationId] = useState<LocationId | null>(null);
  const [screenCoords, setScreenCoords] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});

  // Refs for Three.js instances to avoid re-creation on render
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingMeshesRef = useRef<Map<LocationId, THREE.Group>>(new Map());

  // Mouse drag orbit state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3.4, radius: 46 });

  // Update camera position from spherical angles
  const updateCameraFromAngles = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 2, 0);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0e141e);
    scene.fog = new THREE.FogExp2(0x0e141e, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraFromAngles();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xd9e8ff, 0.7);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0x38bdf8, 0x166534, 0.6);
    scene.add(hemisphereLight);

    const sunLight = new THREE.DirectionalLight(0xfff5db, 1.4);
    sunLight.position.set(24, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    const d = 35;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // 5. Stylized City Base Island
    const islandGeo = new THREE.CylinderGeometry(30, 32, 3, 40);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x111b27,
      roughness: 0.8,
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.y = -1.5;
    island.receiveShadow = true;
    scene.add(island);

    // Plaza Grass Surface
    const groundGeo = new THREE.CircleGeometry(29.5, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.02;
    ground.receiveShadow = true;
    scene.add(ground);

    // Winding Cobblestone Plaza Cross Roads
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const ringRoadGeo = new THREE.RingGeometry(11, 15, 36);
    const ringRoad = new THREE.Mesh(ringRoadGeo, roadMat);
    ringRoad.rotation.x = -Math.PI / 2;
    ringRoad.position.y = 0.04;
    ringRoad.receiveShadow = true;
    scene.add(ringRoad);

    const crossRoad1Geo = new THREE.PlaneGeometry(5, 56);
    const crossRoad1 = new THREE.Mesh(crossRoad1Geo, roadMat);
    crossRoad1.rotation.x = -Math.PI / 2;
    crossRoad1.position.y = 0.03;
    crossRoad1.receiveShadow = true;
    scene.add(crossRoad1);

    const crossRoad2Geo = new THREE.PlaneGeometry(56, 5);
    const crossRoad2 = new THREE.Mesh(crossRoad2Geo, roadMat);
    crossRoad2.rotation.x = -Math.PI / 2;
    crossRoad2.position.y = 0.035;
    crossRoad2.receiveShadow = true;
    scene.add(crossRoad2);

    // Decorative Central Fountain
    const fountainGroup = new THREE.Group();
    const basinGeo = new THREE.CylinderGeometry(3.5, 3.8, 1, 16);
    const basinMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.y = 0.5;
    fountainGroup.add(basin);

    const waterGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.8, 16);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, transparent: true, opacity: 0.85 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.6;
    fountainGroup.add(water);

    const centerPillarGeo = new THREE.CylinderGeometry(0.6, 0.8, 2.5, 12);
    const centerPillar = new THREE.Mesh(centerPillarGeo, basinMat);
    centerPillar.position.y = 1.3;
    fountainGroup.add(centerPillar);
    scene.add(fountainGroup);

    // Helper: Add stylized cartoon trees
    const createTree = (x: number, z: number, scale: number = 1) => {
      const treeGroup = new THREE.Group();
      const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, 1.8 * scale, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = (1.8 * scale) / 2;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });
      const foliage1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4 * scale), leavesMat);
      foliage1.position.y = 2.4 * scale;
      foliage1.castShadow = true;
      treeGroup.add(foliage1);

      const foliage2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0 * scale), leavesMat);
      foliage2.position.y = 3.3 * scale;
      foliage2.castShadow = true;
      treeGroup.add(foliage2);

      treeGroup.position.set(x, 0, z);
      scene.add(treeGroup);
    };

    // Plant scattered decorative trees around city
    const treePositions = [
      [-6, -4, 0.9],
      [7, 6, 1.1],
      [-5, 7, 0.8],
      [8, -6, 1.0],
      [-22, -18, 1.2],
      [22, -18, 1.1],
      [-24, 18, 1.3],
      [24, 20, 1.2],
      [-10, 22, 1.0],
      [10, 22, 1.0],
    ];
    treePositions.forEach(([x, z, s]) => createTree(x, z, s));

    // 6. BUILDINGS GENERATION
    buildingMeshesRef.current.clear();

    locations.forEach((loc) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(loc.threeCoords[0], 0, loc.threeCoords[2]);

      // Base footprint
      const footGeo = new THREE.BoxGeometry(7, 0.4, 7);
      const footMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.y = 0.2;
      bGroup.add(foot);

      if (loc.id === 'cafe') {
        // Spanish Café: Terracotta walls with striped awnings & outdoor tables
        const mainGeo = new THREE.BoxGeometry(6, 4.5, 5);
        const mainMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
        const main = new THREE.Mesh(mainGeo, mainMat);
        main.position.y = 2.45;
        main.castShadow = true;
        main.receiveShadow = true;
        bGroup.add(main);

        // Slanted Roof
        const roofGeo = new THREE.ConeGeometry(4.8, 2, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 5.7;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        bGroup.add(roof);

        // Striped Awning
        const awningGeo = new THREE.BoxGeometry(4.8, 0.3, 2);
        const awningMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
        const awning = new THREE.Mesh(awningGeo, awningMat);
        awning.position.set(0, 2.5, 3.2);
        awning.rotation.x = 0.25;
        bGroup.add(awning);

        // Outdoor Bistro table
        const table = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1, 10), new THREE.MeshStandardMaterial({ color: 0x475569 }));
        table.position.set(2, 0.5, 4);
        bGroup.add(table);
      } else if (loc.id === 'shop') {
        // Shopping Boutique: Rose-pink modern fashion shop with display canopy
        const shopGeo = new THREE.BoxGeometry(6.2, 5.2, 5.2);
        const shopMat = new THREE.MeshStandardMaterial({ color: 0xdb2777, roughness: 0.4 });
        const shop = new THREE.Mesh(shopGeo, shopMat);
        shop.position.y = 2.8;
        shop.castShadow = true;
        bGroup.add(shop);

        // Top decorative parapet
        const parapetGeo = new THREE.BoxGeometry(6.6, 0.8, 5.6);
        const parapetMat = new THREE.MeshStandardMaterial({ color: 0x9d174d });
        const parapet = new THREE.Mesh(parapetGeo, parapetMat);
        parapet.position.y = 5.6;
        bGroup.add(parapet);

        // Glass Front Windows
        const windowGeo = new THREE.BoxGeometry(4.5, 2.2, 0.2);
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x67e8f9, roughness: 0.1 });
        const win = new THREE.Mesh(windowGeo, windowMat);
        win.position.set(0, 2, 2.7);
        bGroup.add(win);
      } else if (loc.id === 'airport') {
        // Airport: Sleek curved futuristic terminal with radar tower
        const terminalGeo = new THREE.BoxGeometry(8, 3.8, 5.5);
        const terminalMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
        const terminal = new THREE.Mesh(terminalGeo, terminalMat);
        terminal.position.y = 2.1;
        terminal.castShadow = true;
        bGroup.add(terminal);

        // Control Tower
        const towerGeo = new THREE.CylinderGeometry(1.2, 1.5, 5, 12);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x0369a1 });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.set(-2.5, 5, 0);
        bGroup.add(tower);

        // Radar Dish
        const dishGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.8, 12);
        const dish = new THREE.Mesh(dishGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
        dish.position.set(-2.5, 7.8, 0);
        bGroup.add(dish);
      } else if (loc.id === 'hotel') {
        // Grand Hotel: 3-Story Indigo Tower with welcoming canopy
        const towerGeo = new THREE.BoxGeometry(5.8, 7.2, 5.8);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.5 });
        const hotelTower = new THREE.Mesh(towerGeo, towerMat);
        hotelTower.position.y = 3.8;
        hotelTower.castShadow = true;
        bGroup.add(hotelTower);

        // Rooftop Penthouse
        const pentGeo = new THREE.BoxGeometry(4, 1.6, 4);
        const pent = new THREE.Mesh(pentGeo, new THREE.MeshStandardMaterial({ color: 0x5b21b6 }));
        pent.position.y = 7.8;
        bGroup.add(pent);

        // Hotel Signboard
        const sign = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 0.4), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
        sign.position.set(0, 9, 0);
        bGroup.add(sign);
      } else if (loc.id === 'school') {
        // Academy: Collegiate blue hall with bell tower
        const schoolGeo = new THREE.BoxGeometry(6.4, 4.6, 5);
        const schoolMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
        const school = new THREE.Mesh(schoolGeo, schoolMat);
        school.position.y = 2.5;
        school.castShadow = true;
        bGroup.add(school);

        // Steeple / Bell Tower
        const steeple = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.5, 4), new THREE.MeshStandardMaterial({ color: 0x1e3a8a }));
        steeple.position.y = 6.4;
        steeple.rotation.y = Math.PI / 4;
        bGroup.add(steeple);
      } else {
        // Park: Botanical Gazebo & Bridge over blooming garden
        const gazeboBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.8, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0x059669 }));
        gazeboBase.position.y = 0.3;
        bGroup.add(gazeboBase);

        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.8, 6), pillarMat);
          p.position.set(Math.cos(angle) * 2.2, 1.8, Math.sin(angle) * 2.2);
          bGroup.add(p);
        }

        const pagodaRoof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
        pagodaRoof.position.y = 3.8;
        bGroup.add(pagodaRoof);
      }

      scene.add(bGroup);
      buildingMeshesRef.current.set(loc.id, bGroup);
    });

    // 7. Floating Dust/Firefly Sparkle Particles
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 55;
      positions[i + 1] = Math.random() * 18 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 55;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.45,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 8. Animation & Projection Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating animation on particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 1; i < particleCount * 3; i += 3) {
        let y = posAttr.array[i];
        y += Math.sin(elapsedTime * 1.5 + i) * 0.015;
        if (y > 20) y = 1;
        posAttr.array[i] = y;
      }
      posAttr.needsUpdate = true;

      // Gentle hover pulsing on buildings
      buildingMeshesRef.current.forEach((mesh, id) => {
        if (hoveredLocationId === id || selectedLocation?.id === id) {
          mesh.scale.set(1.04, 1.04, 1.04);
        } else {
          mesh.scale.set(1, 1, 1);
        }
      });

      // Project 3D positions to 2D screen coordinates for UI Badges
      const newCoords: Record<string, { x: number; y: number; visible: boolean }> = {};
      const tempVec = new THREE.Vector3();

      locations.forEach((loc) => {
        tempVec.set(loc.threeCoords[0], 6.5, loc.threeCoords[2]);
        tempVec.project(camera);

        // Check if in front of camera
        const isVisible = tempVec.z < 1;
        const x = (tempVec.x * 0.5 + 0.5) * width;
        const y = (-(tempVec.y * 0.5) + 0.5) * height;
        newCoords[loc.id] = { x, y, visible: isVisible };
      });

      setScreenCoords(newCoords);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      groundGeo.dispose();
      islandGeo.dispose();
    };
  }, [locations, updateCameraFromAngles]);

  // Mouse / Touch Drag Orbit Controls
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraAngleRef.current.theta -= deltaX * 0.008;
    cameraAngleRef.current.phi = Math.max(0.3, Math.min(Math.PI / 2.3, cameraAngleRef.current.phi - deltaY * 0.008));

    updateCameraFromAngles();
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-[520px] sm:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-[#0e141e] cursor-grab active:cursor-grabbing select-none"
    >
      {/* 3D Scene Instruction Floating Pill */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-xs font-bold shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
        <span>Drag to rotate 3D City · Tap any building to enter</span>
      </div>

      {/* Floating 2D UI Badges pinned onto 3D projected building coordinates */}
      {locations.map((loc) => {
        const coords = screenCoords[loc.id];
        if (!coords || !coords.visible) return null;

        const isUnlocked = unlockedLocationIds.includes(loc.id) || userXp >= loc.minXpRequired;
        const isHovered = hoveredLocationId === loc.id;
        const isSelected = selectedLocation?.id === loc.id;

        return (
          <div
            key={loc.id}
            style={{
              transform: `translate(${coords.x}px, ${coords.y}px) translate(-50%, -100%)`,
            }}
            className="absolute top-0 left-0 z-20 pointer-events-auto transition-transform duration-75"
          >
            <button
              onMouseEnter={() => setHoveredLocationId(loc.id)}
              onMouseLeave={() => setHoveredLocationId(null)}
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                onSelectLocation(loc);
              }}
              className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl shadow-xl transition-all cursor-pointer backdrop-blur-md border ${
                isSelected
                  ? 'bg-emerald-500 text-white scale-110 border-white ring-4 ring-emerald-500/40'
                  : isUnlocked
                  ? 'bg-[#161b22]/95 hover:bg-[#21262d] text-white hover:scale-105 border-slate-700 hover:border-emerald-500'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 opacity-85'
              }`}
            >
              {/* Character Avatar or Lock */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-xs ${
                  isUnlocked ? 'bg-white/10' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isUnlocked ? loc.character.avatar : <Lock className="w-4 h-4 text-slate-500" />}
              </div>

              {/* Location Name & Character */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="font-black text-xs text-white group-hover:text-emerald-400 transition-colors">
                    {loc.name}
                  </span>
                  {isUnlocked && (
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                      OPEN
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[130px]">
                  {isUnlocked ? `${loc.character.name} (${loc.character.role})` : `Unlocks at ${loc.minXpRequired} XP`}
                </span>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
};

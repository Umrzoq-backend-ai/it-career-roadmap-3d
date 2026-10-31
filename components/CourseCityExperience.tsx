'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  COURSE_MODULES,
  COURSE_PROJECTS,
  CourseDistrict,
  LessonItem,
  TechBadge,
} from '@/lib/course-data';
import {
  IT_CAREER_TRACKS,
  getCityDataForTrack,
} from '@/lib/it-tracks-data';
import {
  createCityGridTexture,
  createContactShadowTexture,
  createRobotCharacter,
  createCentralCoreHub,
  createDeliveryRover,
  createModuleBuilding,
  createProjectBuilding,
} from '@/components/three/city-builders';
import CareerRoadmapModal from '@/components/CareerRoadmapModal';
import {
  Map,
  Footprints,
  Play,
  Square,
  HelpCircle,
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowLeft,
  X,
  BookOpen,
  Check,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  Terminal,
  CheckCircle2,
  Sparkles,
  Building2,
  Compass,
} from 'lucide-react';

// Tech Badge Helper to show domain-authentic icons/badges for every lesson & topic
function TechLogoBadge({ tech, customLabel }: { tech: TechBadge; customLabel?: string }) {
  if (customLabel) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/95 border border-sky-500/40 text-[10px] font-mono font-bold text-sky-300 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635]" />
        {customLabel}
      </span>
    );
  }
  switch (tech) {
    case 'python':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-950/90 border border-blue-500/40 text-[10px] font-mono font-bold text-yellow-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          Python
        </span>
      );
    case 'oop':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          OOP
        </span>
      );
    case 'sql':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950/90 border border-sky-500/40 text-[10px] font-mono font-bold text-sky-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          SQL
        </span>
      );
    case 'telegram':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-900/90 border border-sky-400/50 text-[10px] font-mono font-bold text-sky-100 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-300"></span>
          PTB Bot
        </span>
      );
    case 'django':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Django
        </span>
      );
    case 'drf':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-950/90 border border-teal-500/40 text-[10px] font-mono font-bold text-teal-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          DRF API
        </span>
      );
    case 'docker':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-900/80 border border-blue-400/40 text-[10px] font-mono font-bold text-blue-200 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
          DevOps
        </span>
      );
    case 'fastapi':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          FastAPI
        </span>
      );
    default:
      return null;
  }
}

// Pre-allocated scratch vectors outside render loop (Zero GC)
const _projVec = new THREE.Vector3();
const _robotTarget = new THREE.Vector3(-18, 0, 18);
const _camTargetPos = new THREE.Vector3(0, 36, 44);
const _camLookTarget = new THREE.Vector3(0, 0, 2);
const _moveDir = new THREE.Vector3();
const _planeIntersect = new THREE.Vector3();
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export default function CourseCityExperience() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const playerLabelRef = useRef<HTMLDivElement | null>(null);

  // Active IT Career Direction (15 Tracks)
  const [activeTrackId, setActiveTrackId] = useState<string>('data-science');
  const [showTrackDropdown, setShowTrackDropdown] = useState<boolean>(false);
  const [headerTrackSearch, setHeaderTrackSearch] = useState<string>('');

  // Navigation & Category states
  const [activeSelectionType, setActiveSelectionType] = useState<'module' | 'project'>('module');
  const [activeModuleId, setActiveModuleId] = useState<string>('python-basics');
  const [activeProjectId, setActiveProjectId] = useState<string>('proj-cn');
  const [dockTab, setDockTab] = useState<'modules' | 'projects'>('modules');
  const [activeDistrict, setActiveDistrict] = useState<CourseDistrict | 'ALL'>('ALL');
  const [labelFilter, setLabelFilter] = useState<'all' | 'modules' | 'projects'>('all');

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'map' | 'walk'>('map');
  const [isTouring, setIsTouring] = useState<boolean>(false);
  const [nearestId, setNearestId] = useState<string>('python-basics');
  const [nearestIsProject, setNearestIsProject] = useState<boolean>(false);

  const [discoveredIds, setDiscoveredIds] = useState<string[]>(['python-basics', 'proj-cn']);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [lessonSearch, setLessonSearch] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);
  const [showProjectsModal, setShowProjectsModal] = useState<boolean>(false);
  const [showRoadmapsModal, setShowRoadmapsModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Hydrate saved progress asynchronously after mount to avoid SSR hydration mismatches
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      try {
        const savedTrack = localStorage.getItem('it_roadmap_active_track');
        if (savedTrack && IT_CAREER_TRACKS.some((t) => t.id === savedTrack)) {
          setActiveTrackId(savedTrack);
        }
        const savedDiscovered = localStorage.getItem('pb_discovered_items');
        if (savedDiscovered) {
          const parsed = JSON.parse(savedDiscovered);
          if (Array.isArray(parsed)) setDiscoveredIds(parsed);
        }
        const savedLessons = localStorage.getItem('pb_completed_lessons');
        if (savedLessons) {
          const parsed = JSON.parse(savedLessons);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setCompletedLessons(parsed);
          }
        }
      } catch {}
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  const selectTrack = useCallback((trackId: string) => {
    setActiveTrackId(trackId);
    setActiveDistrict('ALL');
    setShowTrackDropdown(false);
    setHeaderTrackSearch('');
    try {
      localStorage.setItem('it_roadmap_active_track', trackId);
    } catch {}
  }, []);

  // Mutable refs for 3D loop access without tearing down WebGL
  const stateRef = useRef({
    viewMode: 'map' as 'map' | 'walk',
    activeSelectionType: 'module' as 'module' | 'project',
    activeModuleId: 'python-basics',
    activeProjectId: 'proj-cn',
    nearestId: 'python-basics',
    nearestIsProject: false,
    drawerOpen: false,
    cameraTransitioning: false,
    keys: {} as Record<string, boolean>,
  });

  useEffect(() => {
    stateRef.current.viewMode = viewMode;
  }, [viewMode]);

  useEffect(() => {
    stateRef.current.activeSelectionType = activeSelectionType;
  }, [activeSelectionType]);

  useEffect(() => {
    stateRef.current.activeModuleId = activeModuleId;
  }, [activeModuleId]);

  useEffect(() => {
    stateRef.current.activeProjectId = activeProjectId;
  }, [activeProjectId]);

  useEffect(() => {
    stateRef.current.drawerOpen = drawerOpen;
  }, [drawerOpen]);

  const markItemDiscovered = useCallback((id: string) => {
    setDiscoveredIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('pb_discovered_items', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleLessonComplete = useCallback((lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = { ...prev, [lessonId]: !prev[lessonId] };
      try {
        localStorage.setItem('pb_completed_lessons', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Navigate to a Module in 3D
  const navigateToModule = useCallback(
    (modId: string, openDrawer = true) => {
      const mod = COURSE_MODULES.find((m) => m.id === modId);
      if (!mod) return;

      setActiveSelectionType('module');
      setActiveModuleId(modId);
      setDockTab('modules');
      setNearestId(modId);
      setNearestIsProject(false);
      markItemDiscovered(modId);
      if (openDrawer) setDrawerOpen(true);

      const [bx, , bz] = mod.position;
      const offsetZ = bz > 10 ? -5.2 : 5.2;
      _robotTarget.set(bx, 0, bz + offsetZ);

      const shiftX = openDrawer ? 5.0 : 0;
      _camLookTarget.set(bx + shiftX, 1.8, bz);
      _camTargetPos.set(bx + shiftX + 10, 16.5, bz + 18.0);
      stateRef.current.cameraTransitioning = true;
    },
    [markItemDiscovered]
  );

  // Navigate to a Project in 3D
  const navigateToProject = useCallback(
    (projId: string, openDrawer = true) => {
      const proj = COURSE_PROJECTS.find((p) => p.id === projId);
      if (!proj) return;

      setActiveSelectionType('project');
      setActiveProjectId(projId);
      setDockTab('projects');
      setNearestId(projId);
      setNearestIsProject(true);
      markItemDiscovered(projId);
      if (openDrawer) setDrawerOpen(true);

      const [px, , pz] = proj.position;
      const offsetZ = pz > 10 ? -5.2 : 5.2;
      _robotTarget.set(px, 0, pz + offsetZ);

      const shiftX = openDrawer ? 5.0 : 0;
      _camLookTarget.set(px + shiftX, 1.8, pz);
      _camTargetPos.set(px + shiftX + 10, 16.5, pz + 18.0);
      stateRef.current.cameraTransitioning = true;
    },
    [markItemDiscovered]
  );

  // Reset camera to full city overview
  const resetToMapOverview = useCallback(() => {
    setViewMode('map');
    setDrawerOpen(false);
    setIsTouring(false);
    _camLookTarget.set(0, 0, 1);
    _camTargetPos.set(0, 36, 44);
    stateRef.current.cameraTransitioning = true;
  }, []);

  // Guided Tour ("Sayohat") across both modules and projects
  useEffect(() => {
    if (!isTouring) return;
    const tourList = [
      ...COURSE_MODULES.map((m) => ({ id: m.id, isProj: false })),
      ...COURSE_PROJECTS.map((p) => ({ id: p.id, isProj: true })),
    ];
    let idx = 0;

    const timer = window.setInterval(() => {
      const item = tourList[idx % tourList.length];
      if (item.isProj) {
        navigateToProject(item.id, true);
      } else {
        navigateToModule(item.id, true);
      }
      idx++;
    }, 5500);

    return () => window.clearInterval(timer);
  }, [isTouring, navigateToModule, navigateToProject]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      stateRef.current.keys[e.code] = true;

      if (
        ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          e.code
        )
      ) {
        setIsTouring(false);
      }

      if (e.code === 'KeyE') {
        if (stateRef.current.nearestIsProject) {
          navigateToProject(stateRef.current.nearestId, true);
        } else {
          navigateToModule(stateRef.current.nearestId, true);
        }
      } else if (e.code === 'Escape') {
        setDrawerOpen(false);
        setSelectedLesson(null);
        setShowProjectsModal(false);
        setShowHelpModal(false);
        setIsTouring(false);
      } else if (e.code === 'KeyH') {
        setDockCollapsed((prev) => !prev);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [navigateToModule, navigateToProject]);

  // Main WebGL / Three.js Scene Setup (mounts once in isolated ref, with 2D 3D-projection fallback if WebGL is disabled)
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || window.innerHeight || 720;

    let renderer: THREE.WebGLRenderer | null = null;
    let isSoftwareGl = false;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          failIfMajorPerformanceCaveat: false,
        });
      } catch {
        renderer = null;
      }
    }

    let fallbackCanvas: HTMLCanvasElement | null = null;
    let fallbackCtx: CanvasRenderingContext2D | null = null;

    if (renderer) {
      try {
        const gl = renderer.getContext();
        const ext = gl?.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl?.RENDERER;
        const gpu = param && gl ? String(gl.getParameter(param)) : '';
        isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        isSoftwareGl = false;
      }

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = width;
      fallbackCanvas.height = height;
      fallbackCanvas.style.width = `${width}px`;
      fallbackCanvas.style.height = `${height}px`;
      fallbackCanvas.style.display = 'block';
      fallbackCtx = fallbackCanvas.getContext('2d');
    }

    const activeDomElement = renderer ? renderer.domElement : fallbackCanvas!;
    container.innerHTML = '';
    container.appendChild(activeDomElement);

    const maxAnisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;

    // Scene & Environment Reflections + Matching Horizon Fog
    const scene = new THREE.Scene();
    const bgHex = 0x090d16;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.0095);

    if (renderer) {
      try {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
        pmremGenerator.dispose();
      } catch {
        // Fallback to direct 3-point lighting if PMREM float textures are unsupported by GPU driver
      }
    }

    // Camera & Controls (Tuned for spacious 74x74 arena)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 300);
    camera.position.set(0, 36, 44);
    camera.lookAt(0, 0, 2);

    const controls = new OrbitControls(camera, activeDomElement);
    controls.target.set(0, 0, 2);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.18;
    controls.minPolarAngle = Math.PI / 6;
    controls.minDistance = 12;
    controls.maxDistance = 95;

    const onControlStart = () => {
      stateRef.current.cameraTransitioning = false;
    };
    controls.addEventListener('start', onControlStart);

    // Studio 3-Point Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.9);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    keyLight.position.set(30, 48, 32);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    const d = 44;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 5;
    keyLight.shadow.camera.far = 130;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 0.85);
    rimLight.position.set(-35, 25, -30);
    scene.add(rimLight);

    // Large City Platform Slab (74 x 74)
    const platformSize = 74;
    const baseSlabGeo = new THREE.BoxGeometry(platformSize, 1.4, platformSize);
    const baseSlabMat = new THREE.MeshStandardMaterial({
      color: 0x0b111e,
      roughness: 0.7,
      metalness: 0.3,
    });
    const baseSlab = new THREE.Mesh(baseSlabGeo, baseSlabMat);
    baseSlab.position.y = -0.7;
    baseSlab.receiveShadow = true;
    scene.add(baseSlab);

    // Top Grid Surface
    const gridTex = createCityGridTexture(maxAnisotropy);
    const topGridGeo = new THREE.PlaneGeometry(platformSize - 0.4, platformSize - 0.4);
    topGridGeo.rotateX(-Math.PI / 2);
    const topGridMat = new THREE.MeshStandardMaterial({
      map: gridTex,
      roughness: 0.65,
      metalness: 0.2,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    const topGrid = new THREE.Mesh(topGridGeo, topGridMat);
    topGrid.position.y = 0.01;
    topGrid.receiveShadow = true;
    scene.add(topGrid);

    // Glowing Cyan Outer Frame
    const outerFrameEdges = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(platformSize + 0.15, 1.42, platformSize + 0.15)
    );
    const outerFrameLines = new THREE.LineSegments(
      outerFrameEdges,
      new THREE.LineBasicMaterial({ color: 0x22d3ee })
    );
    outerFrameLines.position.y = -0.68;
    scene.add(outerFrameLines);

    // Background Skyline Silhouettes
    const bgTowerCount = 44;
    const bgTowerGeo = new THREE.BoxGeometry(1, 1, 1);
    const bgTowerMat = new THREE.MeshStandardMaterial({
      color: 0x111928,
      roughness: 0.8,
      metalness: 0.3,
    });
    const bgSkyline = new THREE.InstancedMesh(bgTowerGeo, bgTowerMat, bgTowerCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < bgTowerCount; i++) {
      const angle = -Math.PI * 0.9 + (i / bgTowerCount) * Math.PI * 1.0;
      const dist = 58 + (i % 4) * 8;
      const h = 10 + ((i * 7) % 22);
      const w = 3.2 + (i % 3) * 1.1;
      dummy.position.set(Math.sin(angle) * dist, h / 2 - 2, Math.cos(angle) * dist - 10);
      dummy.scale.set(w, h, w);
      dummy.updateMatrix();
      bgSkyline.setMatrixAt(i, dummy.matrix);
    }
    bgSkyline.instanceMatrix.needsUpdate = true;
    bgSkyline.computeBoundingSphere();
    scene.add(bgSkyline);

    // Instanced Street Bollards across intersections
    const bollardCoords: [number, number][] = [
      [-32, -32], [-18, -32], [0, -32], [18, -32], [32, -32],
      [-32, -18], [-14, -18], [14, -18], [32, -18],
      [-32, 0], [-14, 0], [14, 0], [32, 0],
      [-32, 18], [-14, 18], [14, 18], [32, 18],
      [-32, 32], [-18, 32], [0, 32], [18, 32], [32, 32],
    ];
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
    const capGeo = new THREE.BoxGeometry(0.4, 0.12, 0.4);
    const capMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });

    const poleInst = new THREE.InstancedMesh(poleGeo, poleMat, bollardCoords.length);
    const capInst = new THREE.InstancedMesh(capGeo, capMat, bollardCoords.length);

    bollardCoords.forEach(([bx, bz], idx) => {
      dummy.scale.set(1, 1, 1);
      dummy.position.set(bx, 0.4, bz);
      dummy.updateMatrix();
      poleInst.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(bx, 0.84, bz);
      dummy.updateMatrix();
      capInst.setMatrixAt(idx, dummy.matrix);
    });
    poleInst.instanceMatrix.needsUpdate = true;
    capInst.instanceMatrix.needsUpdate = true;
    poleInst.computeBoundingSphere();
    capInst.computeBoundingSphere();
    scene.add(poleInst);
    scene.add(capInst);

    // Central AI Core Hub
    const centralHub = createCentralCoreHub();
    centralHub.group.position.set(0, 0, 0);
    scene.add(centralHub.group);

    // Autonomous Delivery Rovers
    const rover1 = createDeliveryRover();
    const rover2 = createDeliveryRover();
    scene.add(rover1);
    scene.add(rover2);

    // Colliders and animated parts collections
    const colliders: THREE.Mesh[] = [];
    const animatedBuildingParts: THREE.Object3D[] = [];

    // Add All 7 Course Module Buildings
    for (const mod of COURSE_MODULES) {
      const { group, collider, animatedParts } = createModuleBuilding(mod, maxAnisotropy);
      scene.add(group);
      colliders.push(collider);
      animatedBuildingParts.push(...animatedParts);
    }

    // Add All 7 Flagship Company Project Buildings
    for (const proj of COURSE_PROJECTS) {
      const { group, collider, animatedParts } = createProjectBuilding(proj, maxAnisotropy);
      scene.add(group);
      colliders.push(collider);
      animatedBuildingParts.push(...animatedParts);
    }

    // Hero Robot Character ("SIZ")
    const shadowTex = createContactShadowTexture();
    const robot = createRobotCharacter(maxAnisotropy, shadowTex);
    robot.group.position.set(-18, 0, 18);
    _robotTarget.copy(robot.group.position);
    scene.add(robot.group);

    // 3D Navigation Waypoint Path Line & Animated Beacon Ring
    const navLinePoints = [
      new THREE.Vector3(-18, 0.14, 18),
      new THREE.Vector3(-18, 0.14, 18),
    ];
    const navLineGeo = new THREE.BufferGeometry().setFromPoints(navLinePoints);
    const navLineMat = new THREE.LineBasicMaterial({
      color: 0xa3e635,
      transparent: true,
      opacity: 0.85,
    });
    const navLine = new THREE.Line(navLineGeo, navLineMat);
    scene.add(navLine);

    const destRingGeo = new THREE.RingGeometry(0.7, 0.95, 36);
    destRingGeo.rotateX(-Math.PI / 2);
    const destRingMat = new THREE.MeshBasicMaterial({
      color: 0xa3e635,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    const destRing = new THREE.Mesh(destRingGeo, destRingMat);
    destRing.position.set(-18, 0.08, 18);
    scene.add(destRing);

    // Pre-warm shaders safely when hardware WebGL is active
    if (renderer && !isSoftwareGl) {
      try {
        renderer.compile(scene, camera);
      } catch {
        // Ignore shader pre-compile warning on restricted drivers
      }
    }

    // Raycast handling for clicks on Modules, Projects, or Floor
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return;

      const rect = activeDomElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!renderer) {
        scene.updateMatrixWorld();
      }
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(colliders, false);

      if (hits.length > 0) {
        const data = hits[0].object.userData;
        setIsTouring(false);
        if (data.isProject && data.projectId) {
          navigateToProject(data.projectId, true);
        } else if (data.moduleId) {
          navigateToModule(data.moduleId, true);
        }
        return;
      }

      // If clicking ground, drive the robot
      if (raycaster.ray.intersectPlane(_groundPlane, _planeIntersect)) {
        const clampedX = THREE.MathUtils.clamp(_planeIntersect.x, -33, 33);
        const clampedZ = THREE.MathUtils.clamp(_planeIntersect.z, -33, 33);
        _robotTarget.set(clampedX, 0, clampedZ);
      }
    };

    let lastHoverTime = 0;
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 50) return;
      lastHoverTime = now;

      const rect = activeDomElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (!renderer) {
        scene.updateMatrixWorld();
      }
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(colliders, false);
      activeDomElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };

    activeDomElement.addEventListener('pointerdown', onPointerDown);
    activeDomElement.addEventListener('pointerup', onPointerUp);
    activeDomElement.addEventListener('pointermove', onPointerMove);

    // Animation Loop with Software-WebGL Guard & 2D Projected Fallback
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      if (!renderer) {
        frameId = window.setTimeout(cb, 32);
        return;
      }
      let gl: WebGL2RenderingContext | null = null;
      try {
        gl = renderer.getContext() as WebGL2RenderingContext | null;
      } catch {
        gl = null;
      }
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : null;
        if (gl && state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync && gl) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const drawFallbackScene = (cw: number, ch: number) => {
      if (!fallbackCtx || !fallbackCanvas) return;
      if (fallbackCanvas.width !== cw || fallbackCanvas.height !== ch) {
        fallbackCanvas.width = cw;
        fallbackCanvas.height = ch;
      }
      const ctx = fallbackCtx;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, cw, ch);

      const projPt = (x: number, y: number, z: number) => {
        _projVec.set(x, y, z);
        _projVec.project(camera);
        return {
          x: (_projVec.x * 0.5 + 0.5) * cw,
          y: (-(_projVec.y * 0.5) + 0.5) * ch,
          visible: _projVec.z <= 1,
        };
      };

      // Draw ground platform polygon
      const corners = [
        projPt(-36, 0, -36),
        projPt(36, 0, -36),
        projPt(36, 0, 36),
        projPt(-36, 0, 36),
      ];
      if (corners.every((c) => c.visible)) {
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i].x, corners[i].y);
        ctx.closePath();
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.75)';
      ctx.lineWidth = 1;
      for (let g = -32; g <= 32; g += 8) {
        const a = projPt(g, 0.02, -34);
        const b = projPt(g, 0.02, 34);
        if (a.visible && b.visible) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        const c = projPt(-34, 0.02, g);
        const d = projPt(34, 0.02, g);
        if (c.visible && d.visible) {
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(d.x, d.y);
          ctx.stroke();
        }
      }

      // Draw 3D Isometric Boxes for all 14 Landmarks
      const drawBuildingBox = (
        bx: number,
        bz: number,
        halfW: number,
        h: number,
        color: string
      ) => {
        const b0 = projPt(bx - halfW, 0, bz - halfW);
        const b1 = projPt(bx + halfW, 0, bz - halfW);
        const b2 = projPt(bx + halfW, 0, bz + halfW);
        const b3 = projPt(bx - halfW, 0, bz + halfW);
        const t0 = projPt(bx - halfW, h, bz - halfW);
        const t1 = projPt(bx + halfW, h, bz - halfW);
        const t2 = projPt(bx + halfW, h, bz + halfW);
        const t3 = projPt(bx - halfW, h, bz + halfW);
        if (!b0.visible || !t0.visible) return;

        // Base pad glow
        ctx.beginPath();
        ctx.moveTo(b0.x, b0.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(b3.x, b3.y);
        ctx.closePath();
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Front faces
        ctx.beginPath();
        ctx.moveTo(b3.x, b3.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(b2.x, b2.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(30, 41, 59, 0.92)';
        ctx.fill();
        ctx.stroke();

        // Roof
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.28;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      };

      for (const mod of COURSE_MODULES) {
        drawBuildingBox(mod.position[0], mod.position[2], 2.6, 4.2, mod.color);
      }
      for (const proj of COURSE_PROJECTS) {
        drawBuildingBox(proj.position[0], proj.position[2], 2.5, 4.0, proj.color);
      }

      // Draw Robot & Navigation Line
      const rPos = projPt(robot.group.position.x, 0.5, robot.group.position.z);
      const tPos = projPt(_robotTarget.x, 0.2, _robotTarget.z);
      if (rPos.visible && tPos.visible && robot.group.position.distanceTo(_robotTarget) > 0.4) {
        ctx.beginPath();
        ctx.setLineDash([6, 4]);
        ctx.moveTo(rPos.x, rPos.y);
        ctx.lineTo(tPos.x, tPos.y);
        ctx.strokeStyle = '#a3e635';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (rPos.visible) {
        ctx.beginPath();
        ctx.arc(rPos.x, rPos.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#a3e635';
        ctx.fill();
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Animate Central Core
      centralHub.innerCore.rotation.y = elapsed * 0.8;
      centralHub.innerCore.rotation.x = elapsed * 0.5;
      centralHub.wireCage.rotation.y = -elapsed * 0.35;
      centralHub.orbitRing1.rotation.z = elapsed * 0.6;
      centralHub.orbitRing2.rotation.x = elapsed * 0.5;

      // Animate Building Props
      for (const part of animatedBuildingParts) {
        part.rotation.y = elapsed * 0.7;
      }

      // Animate Delivery Rovers on Outer Loop
      const loopHalf = 18.0;
      const updateRover = (roverObj: THREE.Group, phaseOffset: number) => {
        const t = ((elapsed * 0.045 + phaseOffset) % 1) * 4;
        const side = Math.floor(t);
        const f = t - side;
        if (side === 0) {
          roverObj.position.set(-loopHalf + f * loopHalf * 2, 0, loopHalf);
          roverObj.rotation.y = 0;
        } else if (side === 1) {
          roverObj.position.set(loopHalf, 0, loopHalf - f * loopHalf * 2);
          roverObj.rotation.y = Math.PI / 2;
        } else if (side === 2) {
          roverObj.position.set(loopHalf - f * loopHalf * 2, 0, -loopHalf);
          roverObj.rotation.y = Math.PI;
        } else {
          roverObj.position.set(-loopHalf, 0, -loopHalf + f * loopHalf * 2);
          roverObj.rotation.y = -Math.PI / 2;
        }
      };
      updateRover(rover1, 0);
      updateRover(rover2, 0.5);

      // Robot Controls
      const keys = stateRef.current.keys;
      _moveDir.set(0, 0, 0);
      if (keys['KeyW'] || keys['ArrowUp']) _moveDir.z -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) _moveDir.z += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) _moveDir.x -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) _moveDir.x += 1;

      let robotMoving = false;
      if (_moveDir.lengthSq() > 0) {
        _moveDir.normalize();
        const speed = 12.0;
        robot.group.position.x = THREE.MathUtils.clamp(
          robot.group.position.x + _moveDir.x * speed * delta,
          -33,
          33
        );
        robot.group.position.z = THREE.MathUtils.clamp(
          robot.group.position.z + _moveDir.z * speed * delta,
          -33,
          33
        );
        _robotTarget.copy(robot.group.position);

        const targetAngle = Math.atan2(_moveDir.x, _moveDir.z);
        robot.bodyGroup.rotation.y = THREE.MathUtils.damp(
          robot.bodyGroup.rotation.y,
          targetAngle,
          12,
          delta
        );
        robotMoving = true;
      } else {
        const distToTarget = robot.group.position.distanceTo(_robotTarget);
        if (distToTarget > 0.15) {
          _moveDir.copy(_robotTarget).sub(robot.group.position).normalize();
          const targetAngle = Math.atan2(_moveDir.x, _moveDir.z);
          robot.bodyGroup.rotation.y = THREE.MathUtils.damp(
            robot.bodyGroup.rotation.y,
            targetAngle,
            10,
            delta
          );
          robot.group.position.x = THREE.MathUtils.damp(
            robot.group.position.x,
            _robotTarget.x,
            4.5,
            delta
          );
          robot.group.position.z = THREE.MathUtils.damp(
            robot.group.position.z,
            _robotTarget.z,
            4.5,
            delta
          );
          robotMoving = true;
        }
      }

      robot.bodyGroup.position.y = Math.sin(elapsed * 4.5) * 0.04;
      if (robotMoving) {
        for (const w of robot.wheels) {
          w.rotation.x += delta * 10;
        }
      }

      // Update 3D Navigation Path & Beacon
      const distRemaining = robot.group.position.distanceTo(_robotTarget);
      if (distRemaining > 0.4) {
        navLine.visible = true;
        destRing.visible = true;
        const posAttr = navLine.geometry.getAttribute('position') as THREE.BufferAttribute;
        posAttr.setXYZ(0, robot.group.position.x, 0.14, robot.group.position.z);
        posAttr.setXYZ(1, _robotTarget.x, 0.14, _robotTarget.z);
        posAttr.needsUpdate = true;
        destRing.position.set(_robotTarget.x, 0.08, _robotTarget.z);
        const s = 1 + Math.sin(elapsed * 5) * 0.12;
        destRing.scale.set(s, s, 1);
      } else {
        navLine.visible = false;
        destRing.visible = false;
      }

      // Nearest landmark proximity detection (combines modules and projects)
      let closestId = stateRef.current.nearestId;
      let closestIsProj = stateRef.current.nearestIsProject;
      let minDist = Infinity;

      for (const mod of COURSE_MODULES) {
        const d = Math.hypot(robot.group.position.x - mod.position[0], robot.group.position.z - mod.position[2]);
        if (d < minDist) {
          minDist = d;
          closestId = mod.id;
          closestIsProj = false;
        }
      }

      for (const proj of COURSE_PROJECTS) {
        const d = Math.hypot(robot.group.position.x - proj.position[0], robot.group.position.z - proj.position[2]);
        if (d < minDist) {
          minDist = d;
          closestId = proj.id;
          closestIsProj = true;
        }
      }

      if (closestId !== stateRef.current.nearestId || closestIsProj !== stateRef.current.nearestIsProject) {
        stateRef.current.nearestId = closestId;
        stateRef.current.nearestIsProject = closestIsProj;
        setNearestId(closestId);
        setNearestIsProject(closestIsProj);
      }

      // Camera Choreography
      if (stateRef.current.viewMode === 'walk' && !stateRef.current.cameraTransitioning) {
        const desiredLookX = robot.group.position.x + (stateRef.current.drawerOpen ? 4.0 : 0);
        const desiredLookZ = robot.group.position.z;
        controls.target.x = THREE.MathUtils.damp(controls.target.x, desiredLookX, 5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, 1.2, 5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, desiredLookZ, 5, delta);

        camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredLookX + 9.5, 4, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 15.5, 4, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredLookZ + 16.5, 4, delta);
      } else if (stateRef.current.cameraTransitioning) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _camTargetPos.x, 4.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _camTargetPos.y, 4.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _camTargetPos.z, 4.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _camLookTarget.x, 5.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _camLookTarget.y, 5.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _camLookTarget.z, 5.5, delta);

        if (camera.position.distanceTo(_camTargetPos) < 0.25) {
          stateRef.current.cameraTransitioning = false;
        }
      }

      controls.update();
      if (!renderer) {
        camera.updateMatrixWorld();
      }

      // Project 3D-to-2D Floating Labels (both modules and projects)
      const cw = activeDomElement.clientWidth || container?.clientWidth || window.innerWidth;
      const ch = activeDomElement.clientHeight || container?.clientHeight || window.innerHeight;

      const updateLabel = (id: string, x: number, y: number, z: number) => {
        const btn = labelRefs.current[id];
        if (!btn) return;
        _projVec.set(x, y, z);
        _projVec.project(camera);
        if (_projVec.z > 1) {
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
        } else {
          const sx = (_projVec.x * 0.5 + 0.5) * cw;
          const sy = (-(_projVec.y * 0.5) + 0.5) * ch;
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          btn.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -100%)`;
        }
      };

      for (const mod of COURSE_MODULES) {
        const topY = mod.buildingType === 'crm_highrise' ? 9.2 : 7.0;
        updateLabel(mod.id, mod.position[0], topY, mod.position[2]);
      }
      for (const proj of COURSE_PROJECTS) {
        const topY = proj.buildingType === 'murad_crm' ? 9.2 : 6.8;
        updateLabel(proj.id, proj.position[0], topY, proj.position[2]);
      }

      if (playerLabelRef.current) {
        _projVec.set(robot.group.position.x, 2.4, robot.group.position.z);
        _projVec.project(camera);
        if (_projVec.z > 1) {
          playerLabelRef.current.style.opacity = '0';
        } else {
          const sx = (_projVec.x * 0.5 + 0.5) * cw;
          const sy = (-(_projVec.y * 0.5) + 0.5) * ch;
          playerLabelRef.current.style.opacity = '1';
          playerLabelRef.current.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -100%)`;
        }
      }

      if (renderer) {
        try {
          renderer.render(scene, camera);
        } catch {
          // Ignore transient WebGL context loss frame error
        }
      } else {
        drawFallbackScene(cw, ch);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (renderer) {
        renderer.setSize(w, h);
      } else if (fallbackCanvas) {
        fallbackCanvas.width = w;
        fallbackCanvas.height = h;
        fallbackCanvas.style.width = `${w}px`;
        fallbackCanvas.style.height = `${h}px`;
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('start', onControlStart);
      activeDomElement.removeEventListener('pointerdown', onPointerDown);
      activeDomElement.removeEventListener('pointerup', onPointerUp);
      activeDomElement.removeEventListener('pointermove', onPointerMove);
      controls.dispose();
      renderer?.dispose();
    };
  }, [navigateToModule, navigateToProject]);

  // Dynamically map the active IT direction (out of all 15 tracks) onto the 14 3D City buildings
  const {
    track: activeTrack,
    modules: currentModules,
    projects: currentProjects,
    districts: currentDistricts,
  } = useMemo(() => getCityDataForTrack(activeTrackId), [activeTrackId]);

  const headerFilteredTracks = useMemo(() => {
    const q = headerTrackSearch.toLowerCase().trim();
    if (!q) return IT_CAREER_TRACKS;
    return IT_CAREER_TRACKS.filter(
      (t) =>
        t.uzbekTitle.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.logoText.toLowerCase().includes(q)
    );
  }, [headerTrackSearch]);

  const activeModule =
    currentModules.find((m) => m.id === activeModuleId) || currentModules[0];
  const activeProject =
    currentProjects.find((p) => p.id === activeProjectId) || currentProjects[0];

  const nearestModule =
    currentModules.find((m) => m.id === nearestId) || currentModules[0];
  const nearestProject =
    currentProjects.find((p) => p.id === nearestId) || currentProjects[0];

  const activeModuleIdx = currentModules.findIndex((m) => m.id === activeModule.id);
  const prevModule =
    currentModules[(activeModuleIdx - 1 + currentModules.length) % currentModules.length];
  const nextModule = currentModules[(activeModuleIdx + 1) % currentModules.length];

  const activeProjIdx = currentProjects.findIndex((p) => p.id === activeProject.id);
  const prevProject =
    currentProjects[(activeProjIdx - 1 + currentProjects.length) % currentProjects.length];
  const nextProject = currentProjects[(activeProjIdx + 1) % currentProjects.length];

  const filteredLessons = activeModule.lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
      (l.techLabel && l.techLabel.toLowerCase().includes(lessonSearch.toLowerCase()))
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#090d16] select-none font-sans">
      {/* 1. Dedicated Isolated WebGL Canvas Mount Ref */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full z-0" />

      {/* 2. Floating 3D-Anchored Large Number Labels in World Space (Modules & Projects) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Character SIZ Marker */}
        <div
          ref={playerLabelRef}
          className="absolute top-0 left-0 flex flex-col items-center pointer-events-none z-20 transition-transform duration-75"
        >
          <div className="px-2.5 py-0.5 rounded-md bg-[#a3e635] text-[#090d16] font-mono font-black text-[11px] tracking-wider shadow-[0_0_16px_rgba(163,230,53,0.9)] border border-[#d9f99d] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#090d16] animate-ping" />
            SIZ
          </div>
          <div className="w-0.5 h-3 bg-gradient-to-b from-[#a3e635] to-transparent" />
        </div>

        {/* 7 Course Module Badges (Dynamically reflecting whichever of the 15 IT directions is active) */}
        {currentModules.map((mod) => {
          const isCurrent = activeSelectionType === 'module' && mod.id === activeModuleId;
          const isDimmed = labelFilter === 'projects';
          return (
            <div
              key={mod.id}
              ref={(el) => {
                labelRefs.current[mod.id] = el;
              }}
              className={`absolute top-0 left-0 flex flex-col items-center pointer-events-auto transition-all duration-200 z-10 ${
                isDimmed ? 'opacity-20 scale-90 pointer-events-none' : 'opacity-100'
              }`}
            >
              <button
                onClick={() => {
                  setIsTouring(false);
                  navigateToModule(mod.id, true);
                }}
                className={`relative flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#090f1d]/95 backdrop-blur-md border-2 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.7)] hover:scale-110 cursor-pointer whitespace-nowrap group ${
                  isCurrent
                    ? 'border-[#a3e635] shadow-[0_0_25px_rgba(163,230,53,0.4)] scale-105'
                    : 'border-slate-700/80 hover:border-slate-400'
                }`}
              >
                {/* Large Glowing Number Badge */}
                <div
                  style={{
                    backgroundColor: `${mod.color}25`,
                    borderColor: mod.color,
                    color: mod.color,
                  }}
                  className="w-10 h-10 rounded-xl border-2 flex items-center justify-center font-mono font-black text-lg tracking-tight shrink-0 shadow-inner"
                >
                  {mod.index}
                </div>

                {/* Module Tag & Title */}
                <div className="flex flex-col text-left pr-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      style={{ color: mod.color }}
                      className="text-[9px] font-mono font-extrabold tracking-widest uppercase"
                    >
                      MODUL {mod.index}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#a3e635] transition-colors" />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {mod.district}
                    </span>
                  </div>
                  <span className="text-xs font-black text-white group-hover:text-[#a3e635] transition-colors leading-snug">
                    {mod.shortTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {mod.lessons.length} ta mavzu
                  </span>
                </div>
              </button>

              {/* Anchor Stem Pin to Building Roof */}
              <div
                style={{ backgroundColor: isCurrent ? mod.color : 'rgba(148, 163, 184, 0.45)' }}
                className="w-0.5 h-3 shadow-md"
              />
              <div
                style={{ backgroundColor: mod.color }}
                className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
              />
            </div>
          );
        })}

        {/* 7 Flagship Project Badges (Dynamically reflecting active IT direction's 7 projects) */}
        {currentProjects.map((proj) => {
          const isCurrent = activeSelectionType === 'project' && proj.id === activeProjectId;
          const isDimmed = labelFilter === 'modules';
          return (
            <div
              key={proj.id}
              ref={(el) => {
                labelRefs.current[proj.id] = el;
              }}
              className={`absolute top-0 left-0 flex flex-col items-center pointer-events-auto transition-all duration-200 z-10 ${
                isDimmed ? 'opacity-20 scale-90 pointer-events-none' : 'opacity-100'
              }`}
            >
              <button
                onClick={() => {
                  setIsTouring(false);
                  navigateToProject(proj.id, true);
                }}
                className={`relative flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#090f1d]/95 backdrop-blur-md border-2 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.7)] hover:scale-110 cursor-pointer whitespace-nowrap group ${
                  isCurrent
                    ? 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.4)] scale-105'
                    : 'border-slate-700/80 hover:border-slate-400'
                }`}
              >
                {/* Brand Logo & Code Box */}
                <div
                  style={{
                    backgroundColor: proj.brandBg,
                    color: proj.brandColor,
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black font-mono text-[11px] shrink-0 shadow-md border border-white/20"
                >
                  {proj.brandText}
                </div>

                {/* Project Tag & Title */}
                <div className="flex flex-col text-left pr-1 max-w-[210px]">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[9px] font-mono font-bold tracking-wider uppercase">
                      LOYIHA {proj.code}
                    </span>
                  </div>
                  <span className="text-xs font-black text-white group-hover:text-yellow-300 transition-colors leading-snug truncate">
                    {proj.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    {proj.company}
                  </span>
                </div>
              </button>

              {/* Anchor Stem Pin to Building Roof */}
              <div
                style={{ backgroundColor: isCurrent ? proj.color : 'rgba(234, 179, 8, 0.45)' }}
                className="w-0.5 h-3 shadow-md"
              />
              <div
                style={{ backgroundColor: proj.color }}
                className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
              />
            </div>
          );
        })}
      </div>

      {/* 3. Top Navigation HUD Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 pointer-events-none">
        {/* Left: Brand Lockup + Live 15-Track Search & Switcher */}
        <div className="flex items-center gap-2.5 pointer-events-auto relative">
          <button
            onClick={resetToMapOverview}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div
              style={{
                backgroundColor: activeTrack.logoBg,
                color: activeTrack.logoColor,
                borderColor: activeTrack.color,
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs shadow-[0_0_15px_rgba(163,230,53,0.3)] border-2"
            >
              {activeTrack.logoText}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white leading-tight group-hover:text-[#a3e635] transition-colors">
                  IT Roadmaps 3D
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#a3e635]/15 border border-[#a3e635]/40 text-[#a3e635] font-mono text-[9px] font-bold">
                  15 SOHA
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-300 mt-0.5 tracking-tight font-bold">
                {activeTrack.uzbekTitle}
              </span>
            </div>
          </button>

          {/* Quick Track Search / Switcher Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowTrackDropdown((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111827]/95 border border-[#a3e635]/60 hover:border-[#a3e635] text-xs font-bold text-white shadow-lg transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#a3e635]" />
              <span className="hidden md:inline">Sohani almashtirish</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showTrackDropdown && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0b1120] border border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-3 z-50">
                <div className="relative mb-2.5">
                  <Search className="w-3.5 h-3.5 text-[#a3e635] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={headerTrackSearch}
                    onChange={(e) => setHeaderTrackSearch(e.target.value)}
                    placeholder="Qidiring: Data Science, Kiberxavfsizlik, AI, Flutter..."
                    autoFocus
                    className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#a3e635]"
                  />
                  {headerTrackSearch && (
                    <button
                      onClick={() => setHeaderTrackSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                  {headerFilteredTracks.map((tr, i) => {
                    const isAct = tr.id === activeTrackId;
                    return (
                      <button
                        key={tr.id}
                        onClick={() => {
                          selectTrack(tr.id);
                          resetToMapOverview();
                        }}
                        className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                          isAct
                            ? 'bg-[#a3e635]/20 border border-[#a3e635]/50 text-white'
                            : 'hover:bg-slate-800/80 text-slate-200 border border-transparent'
                        }`}
                      >
                        <div
                          style={{ backgroundColor: tr.logoBg, color: tr.logoColor }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-[10px] shrink-0"
                        >
                          {tr.logoText}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">
                            {String(i + 1).padStart(2, '0')}. {tr.uzbekTitle}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {tr.tagline}
                          </div>
                        </div>
                        {isAct && (
                          <span className="text-[9px] font-mono font-bold text-[#a3e635] shrink-0">
                            FAOL
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Mode Switcher & District Quick Jump */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center p-1 rounded-xl bg-[#111827]/95 border border-slate-800 shadow-xl">
            <button
              onClick={resetToMapOverview}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'map'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Xarita</span>
            </button>
            <button
              onClick={() => {
                setViewMode('walk');
                setIsTouring(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'walk'
                  ? 'bg-slate-800 text-[#a3e635] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Erkin yurish</span>
            </button>
          </div>

          {/* Category Filter (All vs Modules vs Projects) */}
          <div className="hidden lg:flex items-center p-1 rounded-xl bg-[#111827]/95 border border-slate-800 shadow-xl">
            <button
              onClick={() => {
                setLabelFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                labelFilter === 'all'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Barchasi (14)
            </button>
            <button
              onClick={() => {
                setLabelFilter('modules');
                setDockTab('modules');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                labelFilter === 'modules'
                  ? 'bg-[#a3e635] text-[#090d16] font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Modullar (01–07)</span>
            </button>
            <button
              onClick={() => {
                setLabelFilter('projects');
                setDockTab('projects');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                labelFilter === 'projects'
                  ? 'bg-yellow-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              <span>Loyihalar (01–07)</span>
            </button>
          </div>

          {/* Dynamic Quick Districts for Active IT Track */}
          <div className="hidden 2xl:flex items-center p-1 rounded-xl bg-[#111827]/95 border border-slate-800 shadow-xl">
            {(['ALL', ...currentDistricts] as const).map((dist) => {
              const isAct = activeDistrict === dist;
              return (
                <button
                  key={dist}
                  onClick={() => {
                    setActiveDistrict(dist);
                    setIsTouring(false);
                    if (dist === 'ALL') {
                      resetToMapOverview();
                    } else {
                      const first = currentModules.find((m) => m.district === dist);
                      if (first) navigateToModule(first.id, true);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isAct
                      ? 'bg-slate-700 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {dist === 'ALL' ? 'Hududlar' : dist}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: 15 IT Roadmaps & TZ | Loyihalar Parki | Sayohat | Help | Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowRoadmapsModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#a3e635] hover:bg-[#bef264] text-[#090d16] text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-[0_0_20px_rgba(163,230,53,0.35)] group"
          >
            <Compass className="w-4 h-4 text-[#090d16] group-hover:rotate-45 transition-transform" />
            <span>15 IT Soha & TZ</span>
          </button>

          <button
            onClick={() => setShowProjectsModal(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111827]/95 border border-yellow-400/50 text-yellow-300 hover:bg-yellow-400 hover:text-[#090d16] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-md"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Loyihalar (7)</span>
          </button>

          <button
            onClick={() => setIsTouring((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              isTouring
                ? 'bg-[#a3e635] text-[#090d16] border-[#a3e635]'
                : 'bg-[#111827]/95 text-slate-200 border-slate-800 hover:border-slate-700'
            }`}
          >
            {isTouring ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>To‘xtatish</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Sayohat</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            title="Boshqaruv va Yordam"
            className="p-2 rounded-xl bg-[#111827]/95 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="To‘liq ekran"
            className="p-2 rounded-xl bg-[#111827]/95 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer hidden sm:flex"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 4. Center-Bottom Proximity Prompt ("[E] KASHF ETING ->") */}
      {!drawerOpen && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <button
            onClick={() => {
              if (nearestIsProject) {
                navigateToProject(nearestProject.id, true);
              } else {
                navigateToModule(nearestModule.id, true);
              }
            }}
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl bg-[#111827]/95 border border-slate-700/90 hover:border-[#a3e635] shadow-2xl transition-all cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-mono font-bold text-slate-200 group-hover:bg-[#a3e635] group-hover:text-[#090d16] group-hover:border-[#a3e635] transition-colors">
              E
            </span>
            <div className="text-left pr-2">
              <div className="text-[10px] font-mono tracking-wider text-[#a3e635] uppercase">
                {activeTrack.uzbekTitle} •{' '}
                {nearestIsProject
                  ? 'LOYIHANI KASHF ETING'
                  : `${Number(nearestModule.index)}-MODULNI KASHF ETING`}
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{nearestIsProject ? nearestProject.title : nearestModule.shortTitle}</span>
                <span className="text-xs font-normal text-slate-400">
                  {nearestIsProject
                    ? `(${nearestProject.company})`
                    : `(${nearestModule.lessons.length} ta mavzu)`}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#a3e635] group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      )}

      {/* 5. Right-Side Interactive Drawer (Curriculum Drawer OR Project Deep-Dive) */}
      {drawerOpen && (
        <aside className="absolute top-16 right-5 bottom-20 w-[420px] max-w-[92vw] z-30 rounded-2xl bg-[#0e1422]/98 border border-slate-800/90 shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
          {/* Drawer Top Navigation Toggle between Module and Project */}
          <div className="px-6 pt-4 pb-3 border-b border-slate-800/80 bg-[#090d16]/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSelectionType('module')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeSelectionType === 'module'
                    ? 'bg-[#a3e635] text-[#090d16]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mavzular ({activeModule.lessons.length})
              </button>
              <button
                onClick={() => setActiveSelectionType('project')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeSelectionType === 'project'
                    ? 'bg-[#a3e635] text-[#090d16]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Loyiha Binosi
              </button>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {activeSelectionType === 'module' ? (
            /* MODULE CURRICULUM VIEW */
            <>
              <div className="px-6 pt-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-[#a3e635] uppercase truncate pr-2">
                    {activeTrack.uzbekTitle}
                  </span>
                  {discoveredIds.includes(activeModule.id) && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#a3e635]" />
                      <span>Kashf etildi</span>
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-2.5 mt-2">
                  <span
                    style={{ color: activeModule.color }}
                    className="text-4xl font-extrabold font-mono tracking-tight tabular-nums"
                  >
                    {activeModule.index}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono font-bold text-slate-200 tracking-wide">
                      MODUL • {activeModule.district}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      07 DAN · {activeModule.lessons.length} TA QADAMMA-QADAM MAVZU
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mt-2 leading-snug">
                  {activeModule.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {activeModule.subtitle}
                </p>

                {/* Lesson Search */}
                <div className="relative mt-3">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lessonSearch}
                    onChange={(e) => setLessonSearch(e.target.value)}
                    placeholder="Modul ichidan mavzu qidiring..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#151e30] border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>

              {/* Scrollable Curriculum with Tech Badges & Explanations for Every Lesson */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#a3e635]" />
                      <span>Bosqichlar ro‘yxati ({filteredLessons.length})</span>
                    </div>
                    <span>TUSHUNTIRISH</span>
                  </div>

                  <div className="divide-y divide-slate-800/70 border-t border-b border-slate-800/70">
                    {filteredLessons.map((lesson) => {
                      const isDone = !!completedLessons[lesson.id];
                      return (
                        <div
                          key={lesson.id}
                          className="py-2.5 flex items-center justify-between gap-2.5 group hover:bg-slate-800/30 px-1.5 -mx-1.5 rounded-lg transition-colors"
                        >
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <button
                              onClick={() => toggleLessonComplete(lesson.id)}
                              title="O‘rganildi deb belgilash"
                              className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors cursor-pointer ${
                                isDone
                                  ? 'bg-[#a3e635] border-[#a3e635] text-[#090d16]'
                                  : 'border-slate-600 hover:border-slate-400'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <button
                              onClick={() => setSelectedLesson(lesson)}
                              className="text-left min-w-0 flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-2 mb-0.5">
                                <TechLogoBadge
                                  tech={lesson.tech}
                                  customLabel={lesson.techLabel}
                                />
                                <span className="text-[10px] font-mono text-[#a3e635] font-bold tabular-nums shrink-0">
                                  #{lesson.number}
                                </span>
                              </div>
                              <span
                                className={`text-xs font-medium leading-snug transition-colors line-clamp-2 ${
                                  isDone
                                    ? 'line-through text-slate-500'
                                    : 'text-slate-100 group-hover:text-white'
                                }`}
                              >
                                {lesson.title}
                              </span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setSelectedLesson(lesson)}
                              className="px-2 py-1 rounded-md bg-slate-800/90 hover:bg-[#a3e635] text-[10px] font-mono font-bold text-slate-200 hover:text-[#090d16] transition-colors cursor-pointer"
                            >
                              Tahlil
                            </button>
                            {lesson.url && (
                              <a
                                href={lesson.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Telegram darsni ochish"
                                className="p-1.5 rounded-md bg-slate-800/80 hover:bg-[#a3e635] text-slate-300 hover:text-[#090d16] transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Outcome */}
                <div className="p-3.5 rounded-xl bg-[#151e30]/90 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-[#a855f7] uppercase mb-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>MODUL NATIJASI</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeModule.outcome}
                  </p>
                </div>
              </div>

              {/* Module Nav Footer */}
              <div className="p-3.5 border-t border-slate-800/80 bg-[#0b101b] flex items-center gap-2">
                <button
                  onClick={() => navigateToModule(prevModule.id, true)}
                  title={`Oldingi: ${prevModule.shortTitle}`}
                  className="w-10 h-10 rounded-xl bg-[#151e30] border border-slate-800 hover:border-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateToModule(nextModule.id, true)}
                  className="flex-1 h-10 rounded-xl bg-[#a3e635] hover:bg-[#bef264] text-[#090d16] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
                >
                  <span>Keyingi modul: {nextModule.shortTitle}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* PROJECT DEEP-DIVE VIEW */
            <>
              <div className="px-6 pt-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono tracking-widest text-[#a3e635] uppercase">
                    {activeProject.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    LOYIHA {activeProject.code} / 07
                  </span>
                </div>

                <div className="flex items-center gap-3.5 mt-2">
                  <div
                    style={{
                      backgroundColor: activeProject.brandBg,
                      color: activeProject.brandColor,
                    }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black font-mono text-base shrink-0 shadow-md border border-white/20"
                  >
                    {activeProject.brandText}
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white leading-snug">
                      {activeProject.title}
                    </h2>
                    <span className="text-xs text-slate-400">
                      {activeProject.company}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {activeProject.description}
                </p>

                {/* Tech Stack Badges */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {activeProject.techLabels
                    ? activeProject.techLabels.map((lbl) => (
                        <TechLogoBadge key={lbl} tech="python" customLabel={lbl} />
                      ))
                    : activeProject.techStack.map((tech) => (
                        <TechLogoBadge key={tech} tech={tech} />
                      ))}
                </div>
              </div>

              {/* Project Architecture Features */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div>
                  <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2.5">
                    LOYIHA ARXITEKTURASI VA IMKONIYATLARI
                  </div>
                  <div className="space-y-2">
                    {activeProject.features.map((feat, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-[#151e30] border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#a3e635] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#151e30]/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-[#a3e635] uppercase tracking-wider block mb-1">
                    PORTFOLIO VA ISHGA KIRISH QIYMATI
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ushbu amaliy loyiha {activeTrack.uzbekTitle} yo‘nalishi bo‘yicha texnik suhbatdan (Technical Interview) muvaffaqiyatli o‘tish uchun GitHub rezyumengizga qo‘shiladi.
                  </p>
                </div>
              </div>

              {/* Project Nav Footer */}
              <div className="p-3.5 border-t border-slate-800/80 bg-[#0b101b] flex items-center gap-2">
                <button
                  onClick={() => navigateToProject(prevProject.id, true)}
                  title={`Oldingi: ${prevProject.title}`}
                  className="w-10 h-10 rounded-xl bg-[#151e30] border border-slate-800 hover:border-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateToProject(nextProject.id, true)}
                  className="flex-1 h-10 rounded-xl bg-[#a3e635] hover:bg-[#bef264] text-[#090d16] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg truncate px-3"
                >
                  <span className="truncate">Keyingi loyiha: {nextProject.title}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </>
          )}
        </aside>
      )}

      {/* 6. Unified Collapsible Bottom Dock (Modules & Projects Tabs for Active Track) */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-[96vw] transition-transform duration-200 pointer-events-auto ${
          dockCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Handle & Tab Switcher */}
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <div className="flex items-center p-0.5 rounded-lg bg-[#111827]/95 border border-slate-800 shadow-md">
            <button
              onClick={() => setDockTab('modules')}
              className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                dockTab === 'modules'
                  ? 'bg-slate-800 text-[#a3e635] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeTrack.logoText} Modullar (7)
            </button>
            <button
              onClick={() => setDockTab('projects')}
              className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                dockTab === 'projects'
                  ? 'bg-slate-800 text-[#a3e635] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeTrack.logoText} Loyihalar (7)
            </button>
          </div>

          <button
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111827]/95 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer"
          >
            {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Dock Items Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0e1422]/95 border border-slate-800/90 shadow-2xl overflow-x-auto max-w-[95vw]">
          {dockTab === 'modules'
            ? currentModules.map((mod) => {
                const isSelected = activeSelectionType === 'module' && mod.id === activeModuleId;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setIsTouring(false);
                      navigateToModule(mod.id, true);
                    }}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#1a2438] text-white border border-slate-600 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#151e30]/60 border border-transparent'
                    }`}
                  >
                    <span
                      style={{ color: mod.color }}
                      className="font-mono font-extrabold text-xs tabular-nums"
                    >
                      {mod.index}
                    </span>
                    <span>{mod.shortTitle}</span>
                    {isSelected && (
                      <span
                        style={{ backgroundColor: mod.color }}
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      />
                    )}
                  </button>
                );
              })
            : currentProjects.map((proj) => {
                const isSelected = activeSelectionType === 'project' && proj.id === activeProjectId;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setIsTouring(false);
                      navigateToProject(proj.id, true);
                    }}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#1a2438] text-white border border-slate-600 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#151e30]/60 border border-transparent'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: proj.brandBg, color: proj.brandColor }}
                      className="px-1.5 h-4 rounded font-black font-mono text-[9px] flex items-center justify-center shrink-0"
                    >
                      {proj.brandText}
                    </span>
                    <span className="max-w-[160px] truncate">{proj.title}</span>
                    {isSelected && (
                      <span
                        style={{ backgroundColor: proj.color }}
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
        </div>
      </div>

      {/* 7. Enriched Step-by-Step Lesson Explanation Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-xl rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TechLogoBadge
                  tech={selectedLesson.tech}
                  customLabel={selectedLesson.techLabel}
                />
                <span className="text-xs font-mono font-bold text-[#a3e635]">
                  Bosqich #{selectedLesson.number}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  • {activeTrack.uzbekTitle}
                </span>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-extrabold text-white leading-snug">
              {selectedLesson.title}
            </h3>

            {/* Beginner-Friendly Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-[10px] font-mono font-bold text-[#a3e635] uppercase tracking-wider">
                BU MAVZU NIMA HAQIDA? (ODDIY TILDA)
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedLesson.explanation ||
                  'Ushbu dars amaliy vazifalar, arxitektura tushuntirishi va real misollar bilan taqdim etiladi.'}
              </p>
            </div>

            {selectedLesson.whyLearn && (
              <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-1.5">
                <div className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                  AMALIYOTDA VA LOYIHADA QAYERDA ISHLATILADI?
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedLesson.whyLearn}
                </p>
              </div>
            )}

            {selectedLesson.exampleCode && (
              <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre">
                {selectedLesson.exampleCode}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => toggleLessonComplete(selectedLesson.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  completedLessons[selectedLesson.id]
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {completedLessons[selectedLesson.id]
                    ? 'O‘rganildi deb belgilangan'
                    : 'O‘rganildi deb belgilash'}
                </span>
              </button>

              {selectedLesson.url && (
                <a
                  href={selectedLesson.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#bef264] text-[#090d16] text-xs font-bold transition-colors"
                >
                  <span>Dars manbasini ochish</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. Showcase Projects Modal for the Active IT Direction */}
      {showProjectsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-4xl max-h-[88vh] rounded-2xl bg-[#0e1422] border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#a3e635] uppercase tracking-wider">
                  {activeTrack.uzbekTitle.toUpperCase()} • PORTFOLIO LOYIHALARI
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  3D Shaharda joylashgan 7 ta amaliy loyiha
                </h2>
              </div>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    setShowProjectsModal(false);
                    navigateToProject(proj.id, true);
                  }}
                  className="p-4 rounded-2xl bg-[#151e30] border border-slate-800 hover:border-[#a3e635] transition-all flex items-center gap-4 cursor-pointer group"
                >
                  <div
                    style={{
                      backgroundColor: proj.brandBg,
                      color: proj.brandColor,
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-black font-mono text-sm shrink-0 shadow-md border border-white/10"
                  >
                    {proj.brandText}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      LOYIHA {proj.code} · {proj.company}
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5 group-hover:text-[#a3e635] transition-colors line-clamp-1">
                      {proj.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {proj.subtitle}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {proj.techLabels
                        ? proj.techLabels.slice(0, 3).map((lbl) => (
                            <TechLogoBadge key={lbl} tech="python" customLabel={lbl} />
                          ))
                        : proj.techStack.map((tech) => (
                            <TechLogoBadge key={tech} tech={tech} />
                          ))}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#a3e635] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-md rounded-2xl bg-[#0e1422] border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                3D Shahar va 15 Yo‘nalish Boshqaruvi
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span>IT Yo‘nalishni almashtirish</span>
                <span className="font-mono text-[#a3e635] font-bold">Tepa qidiruv / 15 Soha</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span>Robotni yurgazish</span>
                <span className="font-mono text-[#a3e635] font-bold">W, A, S, D / Strelkalar</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span>Xaritada istalgan nuqtaga borish</span>
                <span className="font-mono text-[#a3e635] font-bold">Sichqoncha bilan bosish</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span>Yaqin bino ma’lumotini ochish</span>
                <span className="font-mono text-[#a3e635] font-bold">E tugmasi</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span>Kamerani aylantirish & zoom</span>
                <span className="font-mono text-[#a3e635] font-bold">Sichqoncha chap tugmasi + Scroll</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Global 15 IT Career Roadmaps & Full TZ Modal */}
      <CareerRoadmapModal
        isOpen={showRoadmapsModal}
        onClose={() => setShowRoadmapsModal(false)}
        currentTrackId={activeTrackId}
        onSelectTrackForMap={(trackId) => {
          selectTrack(trackId);
          setShowRoadmapsModal(false);
          resetToMapOverview();
        }}
      />
    </div>
  );
}

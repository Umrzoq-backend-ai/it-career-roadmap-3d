import * as THREE from 'three';
import { CourseModule, CourseProjectItem } from '@/lib/course-data';

// Helper to create sharp procedural CanvasTexture with SRGBColorSpace & Anisotropy
export function createSignTexture(
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  width = 512,
  height = 256,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Ensure roundRect is always available even on older Linux/Chromium browsers
    if (typeof ctx.roundRect !== 'function') {
      (ctx as unknown as Record<string, unknown>).roundRect = function (
        x: number,
        y: number,
        w: number,
        h: number,
        radii?: number | number[]
      ) {
        const r = typeof radii === 'number' ? radii : Array.isArray(radii) ? radii[0] || 0 : 0;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };
    }
    try {
      drawFn(ctx, width, height);
    } catch {
      // Fallback if any canvas instruction fails
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

// Soft radial contact shadow texture
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Create the expanded Asphalt + Tech Grid Ground Texture for a large 74x74 arena
export function createCityGridTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep obsidian slate base
  ctx.fillStyle = '#0a0f1a';
  ctx.fillRect(0, 0, size, size);

  // Subtle tile grid
  const cells = 36;
  const cellSize = size / cells;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 2;

  for (let i = 0; i <= cells; i++) {
    const p = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  // Tech circuit accents
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1.5;
  for (let gx = 0; gx < cells; gx++) {
    for (let gy = 0; gy < cells; gy++) {
      if ((gx + gy) % 4 === 0) {
        const x0 = gx * cellSize + 8;
        const y0 = gy * cellSize + 8;
        ctx.strokeRect(x0, y0, cellSize - 16, cellSize - 16);
      }
    }
  }

  // Main cross avenues & multiple boulevard rings
  ctx.fillStyle = '#111827';
  const center = size / 2;
  const roadW = 120;
  ctx.fillRect(80, center - roadW / 2, size - 160, roadW);
  ctx.fillRect(center - roadW / 2, 80, roadW, size - 160);

  // Inner ring road
  ctx.lineWidth = 80;
  ctx.strokeStyle = '#111827';
  ctx.strokeRect(480, 480, size - 960, size - 960);

  // Outer ring road connecting projects
  ctx.lineWidth = 90;
  ctx.strokeStyle = '#111827';
  ctx.strokeRect(220, 220, size - 440, size - 440);

  // Road edge glow lines
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.strokeRect(440, 440, size - 880, size - 880);
  ctx.strokeRect(520, 520, size - 1040, size - 1040);
  ctx.strokeRect(175, 175, size - 350, size - 350);
  ctx.strokeRect(265, 265, size - 530, size - 530);

  // Dashed center lane lines
  ctx.save();
  ctx.setLineDash([20, 20]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.4)';
  ctx.strokeRect(480, 480, size - 960, size - 960);
  ctx.strokeRect(220, 220, size - 440, size - 440);

  ctx.beginPath();
  ctx.moveTo(100, center);
  ctx.lineTo(size - 100, center);
  ctx.moveTo(center, 100);
  ctx.lineTo(center, size - 100);
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

// Create the Hero Robot ("SIZ") — 9-part composite procedural group
export function createRobotCharacter(maxAnisotropy = 4, shadowTex: THREE.Texture): {
  group: THREE.Group;
  bodyGroup: THREE.Group;
  wheels: THREE.Mesh[];
  beacon: THREE.Mesh;
} {
  const group = new THREE.Group();
  const bodyGroup = new THREE.Group();
  group.add(bodyGroup);

  // 1. Contact shadow
  const shadowGeo = new THREE.PlaneGeometry(2.2, 2.2);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.65,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.02;
  group.add(shadowMesh);

  // 2. Wheeled hover base platform
  const baseGeo = new THREE.CylinderGeometry(0.62, 0.68, 0.22, 24);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.35,
    metalness: 0.75,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.22;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  bodyGroup.add(baseMesh);

  // 3. Four wheels
  const wheels: THREE.Mesh[] = [];
  const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.14, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.7,
    metalness: 0.2,
  });
  const wheelPositions: [number, number, number][] = [
    [-0.52, 0.2, 0.32],
    [0.52, 0.2, 0.32],
    [-0.52, 0.2, -0.32],
    [0.52, 0.2, -0.32],
  ];
  for (const [wx, wy, wz] of wheelPositions) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(wx, wy, wz);
    bodyGroup.add(w);
    wheels.push(w);
  }

  // 4. Lower white trim torso
  const lowerTorsoGeo = new THREE.BoxGeometry(0.86, 0.38, 0.72);
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.25,
    metalness: 0.15,
  });
  const lowerTorso = new THREE.Mesh(lowerTorsoGeo, whiteMat);
  lowerTorso.position.y = 0.52;
  lowerTorso.castShadow = true;
  bodyGroup.add(lowerTorso);

  // 5. Upper lime-green main cube head/chest (like screenshot)
  const headGeo = new THREE.BoxGeometry(0.94, 0.78, 0.82);
  const limeMat = new THREE.MeshStandardMaterial({
    color: 0xa3e635,
    roughness: 0.32,
    metalness: 0.12,
  });
  const headMesh = new THREE.Mesh(headGeo, limeMat);
  headMesh.position.y = 1.08;
  headMesh.castShadow = true;
  bodyGroup.add(headMesh);

  // 6. Robot Face Visor Screen (front +Z)
  const visorTex = createSignTexture((ctx, w, h) => {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    // Glowing happy robot eyes
    ctx.fillStyle = '#a3e635';
    ctx.beginPath();
    ctx.roundRect(70, 55, 65, 55, 16);
    ctx.roundRect(w - 135, 55, 65, 55, 16);
    ctx.fill();
    // Smile line
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(w / 2, 130, 45, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }, 256, 192, maxAnisotropy);

  const visorGeo = new THREE.PlaneGeometry(0.74, 0.52);
  const visorMat = new THREE.MeshBasicMaterial({ map: visorTex });
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, 1.1, 0.415);
  bodyGroup.add(visorMesh);

  // 7. Side articulated arms
  const armGeo = new THREE.CapsuleGeometry(0.11, 0.35, 8, 12);
  const armMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.4,
    metalness: 0.6,
  });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-0.6, 0.95, 0);
  leftArm.castShadow = true;
  bodyGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(0.6, 0.95, 0);
  rightArm.castShadow = true;
  bodyGroup.add(rightArm);

  // 8. Antenna & glowing top beacon
  const antStemGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.32, 12);
  const antStem = new THREE.Mesh(antStemGeo, armMat);
  antStem.position.y = 1.62;
  bodyGroup.add(antStem);

  const beaconGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xa3e635,
    emissive: 0xa3e635,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 1.82;
  bodyGroup.add(beacon);

  // 9. Floating "[ SIZ ]" badge above robot (Sprite so it always faces camera cleanly)
  const sizTex = createSignTexture((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    // Lime rounded rectangle
    ctx.fillStyle = '#a3e635';
    ctx.beginPath();
    ctx.roundRect(24, 16, w - 48, h - 68, 24);
    ctx.fill();
    // Down pointer triangle
    ctx.beginPath();
    ctx.moveTo(w / 2 - 22, h - 52);
    ctx.lineTo(w / 2 + 22, h - 52);
    ctx.lineTo(w / 2, h - 18);
    ctx.closePath();
    ctx.fill();

    // Text "SIZ"
    ctx.fillStyle = '#090d16';
    ctx.font = '800 68px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SIZ', w / 2, (h - 52) / 2 + 12);
  }, 256, 160, maxAnisotropy);

  const sizMat = new THREE.SpriteMaterial({
    map: sizTex,
    transparent: true,
    depthWrite: false,
  });
  const sizSprite = new THREE.Sprite(sizMat);
  sizSprite.scale.set(1.65, 1.05, 1);
  sizSprite.position.set(0, 2.65, 0);
  bodyGroup.add(sizSprite);

  return { group, bodyGroup, wheels, beacon };
}

// Create the Central Glowing AI / Backend Core Plaza (like screenshot 1 & 2)
export function createCentralCoreHub(): {
  group: THREE.Group;
  innerCore: THREE.Mesh;
  wireCage: THREE.LineSegments;
  orbitRing1: THREE.Mesh;
  orbitRing2: THREE.Mesh;
} {
  const group = new THREE.Group();

  // Concentric neon ground rings
  const ringConfigs = [
    { rIn: 4.8, rOut: 5.05, color: 0x22d3ee, y: 0.03 },
    { rIn: 4.1, rOut: 4.25, color: 0xec4899, y: 0.035 },
    { rIn: 3.1, rOut: 3.22, color: 0x22d3ee, y: 0.04 },
  ];

  for (const rc of ringConfigs) {
    const rGeo = new THREE.RingGeometry(rc.rIn, rc.rOut, 64);
    rGeo.rotateX(-Math.PI / 2);
    const rMat = new THREE.MeshBasicMaterial({
      color: rc.color,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    const rMesh = new THREE.Mesh(rGeo, rMat);
    rMesh.position.y = rc.y;
    group.add(rMesh);
  }

  // Dark circular pedestal pad
  const padGeo = new THREE.CylinderGeometry(3.0, 3.2, 0.16, 48);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.6,
  });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.position.y = 0.08;
  pad.receiveShadow = true;
  group.add(pad);

  // Glowing inner icosahedron
  const innerGeo = new THREE.IcosahedronGeometry(1.15, 0);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x22d3ee,
    emissiveIntensity: 1.4,
    roughness: 0.15,
    metalness: 0.1,
  });
  const innerCore = new THREE.Mesh(innerGeo, innerMat);
  innerCore.position.y = 2.6;
  group.add(innerCore);

  // Outer geodesic wireframe cage
  const cageGeo = new THREE.IcosahedronGeometry(2.15, 1);
  const wireGeo = new THREE.WireframeGeometry(cageGeo);
  const wireMat = new THREE.LineBasicMaterial({
    color: 0x5eead4,
    transparent: true,
    opacity: 0.75,
  });
  const wireCage = new THREE.LineSegments(wireGeo, wireMat);
  wireCage.position.y = 2.6;
  group.add(wireCage);

  // Orbital rings around the sphere
  const torusGeo1 = new THREE.TorusGeometry(2.65, 0.045, 12, 64);
  const torusMat1 = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const orbitRing1 = new THREE.Mesh(torusGeo1, torusMat1);
  orbitRing1.position.y = 2.6;
  orbitRing1.rotation.x = Math.PI / 3;
  group.add(orbitRing1);

  const torusGeo2 = new THREE.TorusGeometry(2.9, 0.045, 12, 64);
  const torusMat2 = new THREE.MeshBasicMaterial({ color: 0xf472b6 });
  const orbitRing2 = new THREE.Mesh(torusGeo2, torusMat2);
  orbitRing2.position.y = 2.6;
  orbitRing2.rotation.y = Math.PI / 4;
  orbitRing2.rotation.x = -Math.PI / 4;
  group.add(orbitRing2);

  return { group, innerCore, wireCage, orbitRing1, orbitRing2 };
}

// Create a small autonomous delivery truck (like in screenshot 1 & 2)
export function createDeliveryRover(): THREE.Group {
  const rover = new THREE.Group();

  const chassisGeo = new THREE.BoxGeometry(1.3, 0.45, 0.85);
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.4,
    metalness: 0.3,
  });
  const chassis = new THREE.Mesh(chassisGeo, chassisMat);
  chassis.position.y = 0.35;
  chassis.castShadow = true;
  rover.add(chassis);

  // Cabin
  const cabGeo = new THREE.BoxGeometry(0.45, 0.42, 0.78);
  const cabMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    roughness: 0.3,
    metalness: 0.2,
  });
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(0.38, 0.72, 0);
  cab.castShadow = true;
  rover.add(cab);

  // Cargo boxes in back
  const cargo1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.45, 0.68),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 })
  );
  cargo1.position.set(-0.28, 0.75, 0);
  rover.add(cargo1);

  // 4 wheels
  const wGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12);
  wGeo.rotateX(Math.PI / 2);
  const wMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  const coords: [number, number, number][] = [
    [-0.4, 0.16, 0.44],
    [0.4, 0.16, 0.44],
    [-0.4, 0.16, -0.44],
    [0.4, 0.16, -0.44],
  ];
  for (const [x, y, z] of coords) {
    const w = new THREE.Mesh(wGeo, wMat);
    w.position.set(x, y, z);
    rover.add(w);
  }

  return rover;
}

// Create each of the 7 Architectural Module Buildings as 6–12 part procedural groups
export function createModuleBuilding(
  mod: CourseModule,
  maxAnisotropy = 4
): {
  group: THREE.Group;
  collider: THREE.Mesh;
  animatedParts: THREE.Object3D[];
} {
  const group = new THREE.Group();
  group.position.set(mod.position[0], 0, mod.position[2]);
  const animatedParts: THREE.Object3D[] = [];

  const accentColor = new THREE.Color(mod.color);

  // 1. Base Platform Pad with Glowing Neon Border & Ground Ring
  const padW = 8.4;
  const padD = 8.4;
  const padGeo = new THREE.BoxGeometry(padW, 0.28, padD);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x161f30,
    roughness: 0.55,
    metalness: 0.4,
  });
  const padMesh = new THREE.Mesh(padGeo, padMat);
  padMesh.position.y = 0.14;
  padMesh.receiveShadow = true;
  group.add(padMesh);

  // Glowing neon border frame around pad
  const borderEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(padW + 0.08, 0.3, padD + 0.08));
  const borderMat = new THREE.LineBasicMaterial({ color: accentColor });
  const borderLines = new THREE.LineSegments(borderEdges, borderMat);
  borderLines.position.y = 0.15;
  group.add(borderLines);

  // Glowing circular ring on top of the pad
  const ringGeo = new THREE.RingGeometry(3.55, 3.72, 48);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.y = 0.29;
  group.add(ringMesh);

  // Corner mini glowing bollards on the pad
  const bollardPositions: [number, number][] = [
    [-3.7, -3.7],
    [3.7, -3.7],
    [-3.7, 3.7],
    [3.7, 3.7],
  ];
  for (const [bx, bz] of bollardPositions) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.55, 8),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 })
    );
    stem.position.set(bx, 0.55, bz);
    group.add(stem);

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.08, 0.28),
      new THREE.MeshBasicMaterial({ color: accentColor })
    );
    cap.position.set(bx, 0.84, bz);
    group.add(cap);
  }

  // Build specific architecture per module type
  if (mod.buildingType === 'workshop') {
    // 01: PYTHON WORKSHOP (like photo 5: dark workshop, CN neon sign, >_ hello, world rooftop screen)
    const mainBody = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 2.8, 4.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.35 })
    );
    mainBody.position.y = 1.68;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    group.add(mainBody);

    // Roof overhang with lime neon trim
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 0.32, 4.6),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.5 })
    );
    roof.position.y = 3.24;
    roof.castShadow = true;
    group.add(roof);

    // Front CN badge sign (left side of front wall)
    const cnTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#090d16';
      ctx.font = '900 130px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PY', w / 2, h / 2);
    }, 256, 256, maxAnisotropy);
    const cnSign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.2),
      new THREE.MeshBasicMaterial({ map: cnTex })
    );
    cnSign.position.set(-1.3, 1.85, 2.12);
    group.add(cnSign);

    // Front glass doors (right side)
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 1.9),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        roughness: 0.1,
        metalness: 0.8,
      })
    );
    door.position.set(1.1, 1.25, 2.12);
    group.add(door);

    // Rooftop terminal monitor: ">_ hello, world"
    const termBox = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 1.55, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.6 })
    );
    termBox.position.set(0, 4.15, 0);
    termBox.castShadow = true;
    group.add(termBox);

    const termTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = '#a3e635';
      ctx.font = '700 46px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('>_ hello, world', w / 2, h / 2 - 18);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 26px sans-serif';
      ctx.fillText('PYTHON WORKSHOP', w / 2, h / 2 + 42);
    }, 512, 256, maxAnisotropy);
    const termScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(3.15, 1.3),
      new THREE.MeshBasicMaterial({ map: termTex })
    );
    termScreen.position.set(0, 4.15, 0.61);
    group.add(termScreen);
  } else if (mod.buildingType === 'oop_tower') {
    // 02: OOP & ADVANCED PYTHON LAB
    const baseLab = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 2.4, 4.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.45 })
    );
    baseLab.position.y = 1.48;
    baseLab.castShadow = true;
    group.add(baseLab);

    const upperTower = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.6, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.7 })
    );
    upperTower.position.set(-0.5, 3.98, -0.3);
    upperTower.castShadow = true;
    group.add(upperTower);

    // Sign billboard
    const oopTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 10;
      ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.fillStyle = '#22d3ee';
      ctx.font = '800 58px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('class OOP:', w / 2, h / 2 - 22);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 32px sans-serif';
      ctx.fillText('PRAC 2 & 3 · MULTITASK', w / 2, h / 2 + 42);
    }, 512, 256, maxAnisotropy);

    const oopSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.5),
      new THREE.MeshBasicMaterial({ map: oopTex })
    );
    oopSign.position.set(0, 1.8, 2.22);
    group.add(oopSign);

    // Rotating cyan data cube on roof
    const cube = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.75, 0),
      new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x0891b2,
        emissiveIntensity: 0.9,
        wireframe: false,
        roughness: 0.2,
      })
    );
    cube.position.set(-0.5, 6.1, -0.3);
    group.add(cube);
    animatedParts.push(cube);
  } else if (mod.buildingType === 'database') {
    // 03: DATABASE & SQL (like photo 1 & 2: Asaxiy sign + stacked cylindrical database silos)
    const dbMain = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 3.4, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.4 })
    );
    dbMain.position.set(-0.6, 1.98, 0);
    dbMain.castShadow = true;
    dbMain.receiveShadow = true;
    group.add(dbMain);

    const dbRoof = new THREE.Mesh(
      new THREE.BoxGeometry(4.7, 0.28, 4.3),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.6 })
    );
    dbRoof.position.set(-0.6, 3.82, 0);
    group.add(dbRoof);

    // White "asaxiy" / "DATABASE / SQL" sign on front facade
    const dbSignTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 20);
      ctx.fill();
      ctx.fillStyle = '#0284c7';
      ctx.font = '900 74px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▲ SQL & DB', w / 2, h / 2 - 14);
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 32px monospace';
      ctx.fillText('JOINS · ACID · SQLITE', w / 2, h / 2 + 52);
    }, 512, 220, maxAnisotropy);

    const signBacking = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 1.35, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
    );
    signBacking.position.set(-0.6, 2.75, 2.05);
    group.add(signBacking);

    const signFront = new THREE.Mesh(
      new THREE.PlaneGeometry(3.25, 1.22),
      new THREE.MeshBasicMaterial({ map: dbSignTex })
    );
    signFront.position.set(-0.6, 2.75, 2.16);
    group.add(signFront);

    // 3-tier Cylindrical SQL Database Silo on right side (just like screenshot!)
    for (let i = 0; i < 3; i++) {
      const disk = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.05, 0.52, 28),
        new THREE.MeshStandardMaterial({
          color: 0x0ea5e9,
          emissive: 0x0284c7,
          emissiveIntensity: 0.35,
          roughness: 0.25,
          metalness: 0.5,
        })
      );
      disk.position.set(2.15, 0.65 + i * 0.68, 0.8);
      disk.castShadow = true;
      group.add(disk);
    }
  } else if (mod.buildingType === 'bot_store') {
    // 04: TELEGRAM BOT / SMART KORZINKA / FAST FOOD BOT (like photo 1: magenta roof, shop awning, phone totem)
    const storeBody = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 2.4, 4.2),
      new THREE.MeshStandardMaterial({ color: 0x3b0764, roughness: 0.5, metalness: 0.25 })
    );
    storeBody.position.y = 1.48;
    storeBody.castShadow = true;
    group.add(storeBody);

    // Vibrant Magenta Roof Overhang
    const magRoof = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.42, 4.9),
      new THREE.MeshStandardMaterial({ color: 0xdb2777, roughness: 0.3, metalness: 0.2 })
    );
    magRoof.position.y = 2.88;
    magRoof.castShadow = true;
    group.add(magRoof);

    // Front Marquee Sign: "FAST FOOD BOT / PTB"
    const botTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#1f1235';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FAST FOOD & PTB BOT', w / 2, h / 2);
    }, 512, 128, maxAnisotropy);
    const marquee = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 0.68),
      new THREE.MeshBasicMaterial({ map: botTex })
    );
    marquee.position.set(0, 2.28, 2.12);
    group.add(marquee);

    // Shop glass windows
    const glassWin = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 1.3),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.25,
        roughness: 0.15,
        metalness: 0.8,
      })
    );
    glassWin.position.set(0, 1.05, 2.12);
    group.add(glassWin);

    // Rooftop Smartphone Totem (like the vertical monolith on the pink roof in screenshot 1)
    const phoneMonolith = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 2.3, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 })
    );
    phoneMonolith.position.set(1.1, 4.2, 0.4);
    phoneMonolith.castShadow = true;
    group.add(phoneMonolith);

    const phoneScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95, 2.0),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e })
    );
    phoneScreen.position.set(1.1, 4.2, 0.54);
    group.add(phoneScreen);
  } else if (mod.buildingType === 'crm_highrise') {
    // 05: DJANGO & WEB ARCHITECTURE (like photo 1 & 2: Tall purple-windowed Murad Buildings tower + CRM/API annex)
    const towerW = 3.3;
    const towerH = 6.8;
    const towerD = 3.3;
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(towerW, towerH, towerD),
      new THREE.MeshStandardMaterial({ color: 0x2e1f47, roughness: 0.4, metalness: 0.45 })
    );
    tower.position.set(-0.9, towerH / 2 + 0.28, -0.4);
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);

    // Glowing purple window grid on front & right face of tower
    const winTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#231836';
      ctx.fillRect(0, 0, w, h);
      const cols = 3;
      const rows = 5;
      const padX = 28;
      const padY = 32;
      const cellW = (w - padX * (cols + 1)) / cols;
      const cellH = (h - padY * (rows + 1)) / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#c084fc' : '#9333ea';
          ctx.beginPath();
          ctx.roundRect(
            padX + c * (cellW + padX),
            padY + r * (cellH + padY),
            cellW,
            cellH,
            8
          );
          ctx.fill();
        }
      }
    }, 256, 512, maxAnisotropy);

    const frontWins = new THREE.Mesh(
      new THREE.PlaneGeometry(towerW - 0.2, towerH - 1.1),
      new THREE.MeshBasicMaterial({ map: winTex })
    );
    frontWins.position.set(-0.9, towerH / 2 + 0.1, -0.4 + towerD / 2 + 0.02);
    group.add(frontWins);

    // Rooftop "M" / "DJANGO" Crown Sign
    const mTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 105px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DJ', w / 2, h / 2 - 12);
      ctx.fillStyle = '#c084fc';
      ctx.font = '700 28px sans-serif';
      ctx.fillText('DJANGO · MAXWAY · CRM', w / 2, h / 2 + 54);
    }, 320, 200, maxAnisotropy);

    const crownSign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 1.35),
      new THREE.MeshBasicMaterial({ map: mTex })
    );
    crownSign.position.set(-0.9, towerH + 0.95, -0.4 + towerD / 2);
    group.add(crownSign);

    // Secondary Annex Building ("CRM / API") on the right
    const annex = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 4.4, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.5 })
    );
    annex.position.set(1.75, 2.48, 0.3);
    annex.castShadow = true;
    group.add(annex);
  } else if (mod.buildingType === 'devops_dome') {
    // 06: DRF & DEVOPS ARCHITECTURE (Geodesic dome on roof + Artel/DRF sign)
    const hubBody = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 3.0, 4.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.55 })
    );
    hubBody.position.y = 1.78;
    hubBody.castShadow = true;
    group.add(hubBody);

    const drfTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = '#34d399';
      ctx.font = '900 64px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DRF & DEVOPS', w / 2, h / 2 - 18);
      ctx.fillStyle = '#ecfdf5';
      ctx.font = '600 28px monospace';
      ctx.fillText('DOCKER · CELERY · REDIS', w / 2, h / 2 + 42);
    }, 512, 220, maxAnisotropy);

    const drfSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.45),
      new THREE.MeshBasicMaterial({ map: drfTex })
    );
    drfSign.position.set(0, 1.95, 2.12);
    group.add(drfSign);

    // Geodesic wireframe sphere on the roof (like photo 1 & 3)
    const domeGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const domeWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(domeGeo),
      new THREE.LineBasicMaterial({ color: 0x34d399 })
    );
    domeWire.position.set(0, 4.65, 0);
    group.add(domeWire);
    animatedParts.push(domeWire);
  } else if (mod.buildingType === 'launchpad') {
    // 07: FASTAPI & STARTUP ROCKET LAUNCHPAD (like photo 5: rocket on circular pad + gantry tower)
    const launchBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.6, 0.5, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.6 })
    );
    launchBase.position.y = 0.52;
    launchBase.castShadow = true;
    group.add(launchBase);

    // Rocket Fuselage
    const rocketGroup = new THREE.Group();
    rocketGroup.position.set(0.3, 0.78, 0);
    group.add(rocketGroup);

    const fuselage = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.68, 3.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.75 })
    );
    fuselage.position.y = 1.6;
    fuselage.castShadow = true;
    rocketGroup.add(fuselage);

    // Lime/Yellow Nose Cone
    const noseCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.62, 1.35, 24),
      new THREE.MeshStandardMaterial({
        color: 0xa3e635,
        emissive: 0x65a30d,
        emissiveIntensity: 0.35,
        roughness: 0.25,
      })
    );
    noseCone.position.y = 3.87;
    noseCone.castShadow = true;
    rocketGroup.add(noseCone);

    // 4 Rocket Fins
    for (let f = 0; f < 4; f++) {
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 1.1, 0.65),
        new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.3, metalness: 0.5 })
      );
      const angle = (f * Math.PI) / 2;
      fin.position.set(Math.cos(angle) * 0.72, 0.65, Math.sin(angle) * 0.72);
      fin.rotation.y = -angle;
      rocketGroup.add(fin);
    }

    // Launch Umbilical Gantry Tower
    const gantryPillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 4.6, 0.32),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.4, metalness: 0.7 })
    );
    gantryPillar.position.set(-1.35, 2.55, 0);
    gantryPillar.castShadow = true;
    group.add(gantryPillar);

    const gantryArm = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.22, 0.24),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.4, metalness: 0.7 })
    );
    gantryArm.position.set(-0.65, 4.5, 0);
    group.add(gantryArm);
  }

  // 3D In-World Holographic Number Beacon rising high above the building
  const beaconGroup = new THREE.Group();
  const beaconHeight = mod.buildingType === 'crm_highrise' ? 8.4 : 6.3;
  beaconGroup.position.set(0, beaconHeight, 0);

  // Vertical light laser needle pointing down to roof
  const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
  const beamMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0.75,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = -0.9;
  beaconGroup.add(beam);

  // Big Glowing Number Disc Billboard
  const numTex = createSignTexture((ctx, w, h) => {
    ctx.fillStyle = '#0a0f1d';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = mod.color;
    ctx.lineWidth = 14;
    ctx.stroke();

    ctx.fillStyle = mod.color;
    ctx.font = '900 130px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mod.index, w / 2, h / 2);
  }, 256, 256, maxAnisotropy);

  const numPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.6),
    new THREE.MeshBasicMaterial({
      map: numTex,
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  beaconGroup.add(numPlane);

  // Rotating outer halo ring
  const haloGeo = new THREE.RingGeometry(0.95, 1.08, 32);
  const haloMesh = new THREE.Mesh(
    haloGeo,
    new THREE.MeshBasicMaterial({
      color: accentColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    })
  );
  beaconGroup.add(haloMesh);

  group.add(beaconGroup);
  animatedParts.push(beaconGroup);

  // Invisible raycast proxy box for reliable, fast click & hover detection
  const colliderGeo = new THREE.BoxGeometry(7.8, 8.5, 7.8);
  const colliderMat = new THREE.MeshBasicMaterial({ visible: false });
  const collider = new THREE.Mesh(colliderGeo, colliderMat);
  collider.position.y = 4.25;
  collider.userData = { moduleId: mod.id, isProject: false };
  group.add(collider);

  return { group, collider, animatedParts };
}

// Create 3D Architectural Buildings for the 7 Flagship Company Projects
export function createProjectBuilding(
  proj: CourseProjectItem,
  maxAnisotropy = 4
): {
  group: THREE.Group;
  collider: THREE.Mesh;
  animatedParts: THREE.Object3D[];
} {
  const group = new THREE.Group();
  group.position.set(proj.position[0], 0, proj.position[2]);
  const animatedParts: THREE.Object3D[] = [];
  const accentColor = new THREE.Color(proj.color);

  // 1. Project Base Pad
  const padW = 7.6;
  const padD = 7.6;
  const padGeo = new THREE.BoxGeometry(padW, 0.28, padD);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x111928,
    roughness: 0.55,
    metalness: 0.45,
  });
  const padMesh = new THREE.Mesh(padGeo, padMat);
  padMesh.position.y = 0.14;
  padMesh.receiveShadow = true;
  group.add(padMesh);

  // Glowing neon frame around pad
  const borderEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(padW + 0.08, 0.3, padD + 0.08));
  const borderLines = new THREE.LineSegments(
    borderEdges,
    new THREE.LineBasicMaterial({ color: accentColor })
  );
  borderLines.position.y = 0.15;
  group.add(borderLines);

  // Glowing project zone ring
  const ringGeo = new THREE.RingGeometry(3.1, 3.28, 40);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMesh = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({
      color: accentColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    })
  );
  ringMesh.position.y = 0.29;
  group.add(ringMesh);

  // 2. Specialized Building Architecture with Authentic Company Logos
  if (proj.buildingType === 'cn_finance') {
    // 01: Cho'ntak nazoratchisi (CN - Shaxsiy Moliya)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 2.6, 3.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 })
    );
    body.position.y = 1.58;
    body.castShadow = true;
    group.add(body);

    // Large CN Lime Billboard
    const cnTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 10;
      ctx.strokeRect(8, 8, w - 16, h - 16);

      // CN lime badge
      ctx.fillStyle = '#a3e635';
      ctx.beginPath();
      ctx.roundRect(32, 28, 140, 140, 20);
      ctx.fill();

      ctx.fillStyle = '#090d16';
      ctx.font = '900 80px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CN', 102, 98);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 36px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText("CHO'NTAK", 195, 75);
      ctx.fillText("NAZORATCHISI", 195, 120);

      ctx.fillStyle = '#a3e635';
      ctx.font = '600 24px monospace';
      ctx.fillText("01 · SHAXSIY MOLIYA", 40, 205);
    }, 512, 256, maxAnisotropy);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 1.9),
      new THREE.MeshBasicMaterial({ map: cnTex })
    );
    sign.position.set(0, 2.2, 1.92);
    group.add(sign);
  } else if (proj.buildingType === 'asaxiy_bot') {
    // 02: Asaxiy onlayn savdo boti (asaxiy - Savdo boti)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 2.8, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.5 })
    );
    body.position.y = 1.68;
    body.castShadow = true;
    group.add(body);

    // Asaxiy White Billboard
    const asaxiyTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 24);
      ctx.fill();

      // Blue Triangle 'A' logo
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(70, 140);
      ctx.lineTo(110, 50);
      ctx.lineTo(150, 140);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(90, 120);
      ctx.lineTo(110, 80);
      ctx.lineTo(130, 120);
      ctx.closePath();
      ctx.fill();

      // "asaxiy" bold text
      ctx.fillStyle = '#0284c7';
      ctx.font = '900 68px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('asaxiy', 170, 95);

      ctx.fillStyle = '#0f172a';
      ctx.font = '700 26px sans-serif';
      ctx.fillText("ONLAYN SAVDO BOTI · SQL", 50, 195);
    }, 512, 256, maxAnisotropy);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 1.95),
      new THREE.MeshBasicMaterial({ map: asaxiyTex })
    );
    sign.position.set(0, 2.3, 2.02);
    group.add(sign);
  } else if (proj.buildingType === 'murad_crm') {
    // 03: Murad Buildings sotuv CRM tizimi (M - Sotuv va CRM)
    const towerH = 6.2;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, towerH, 3.8),
      new THREE.MeshStandardMaterial({ color: 0x241442, roughness: 0.35, metalness: 0.6 })
    );
    body.position.y = towerH / 2 + 0.28;
    body.castShadow = true;
    group.add(body);

    // Murad Buildings 'M' Crown Billboard
    const muradTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#110b24';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, w - 12, h - 12);

      // White Serif 'M'
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 96px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', w / 2, 75);

      ctx.fillStyle = '#c084fc';
      ctx.font = '700 28px sans-serif';
      ctx.fillText('MURAD BUILDINGS', w / 2, 140);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 22px monospace';
      ctx.fillText('SOTUV CRM TIZIMI', w / 2, 185);
    }, 512, 256, maxAnisotropy);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 1.6),
      new THREE.MeshBasicMaterial({ map: muradTex })
    );
    sign.position.set(0, 3.2, 1.92);
    group.add(sign);
  } else if (proj.buildingType === 'artel_ai') {
    // 04: Artel AI servisi (artel - AI Servis)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 2.4, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.4, metalness: 0.4 })
    );
    body.position.y = 1.48;
    body.castShadow = true;
    group.add(body);

    const artelTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 20);
      ctx.fill();

      // Green 'artel' lowercase lettering
      ctx.fillStyle = '#059669';
      ctx.font = '900 84px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('artel', w / 2, 85);

      ctx.fillStyle = '#0f172a';
      ctx.font = '800 30px sans-serif';
      ctx.fillText('AI SERVIS & ENTERPRISE', w / 2, 165);
    }, 512, 256, maxAnisotropy);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 1.9),
      new THREE.MeshBasicMaterial({ map: artelTex })
    );
    sign.position.set(0, 2.0, 2.02);
    group.add(sign);
  } else if (proj.buildingType === 'uzum_agents') {
    // 05: Uzum market AI agentlari (uzum market - AI Agentlar)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 2.8, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x3b0764, roughness: 0.35, metalness: 0.5 })
    );
    body.position.y = 1.68;
    body.castShadow = true;
    group.add(body);

    const uzumTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#1c0738';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, w - 12, h - 12);

      // Purple 'U' rounded icon
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.roundRect(40, 35, 120, 120, 24);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 75px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('U', 100, 95);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 42px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('uzum', 185, 75);
      ctx.font = '600 32px sans-serif';
      ctx.fillText('market', 185, 120);

      ctx.fillStyle = '#c084fc';
      ctx.font = '700 24px monospace';
      ctx.fillText('05 · AI AGENTLARI', 45, 205);
    }, 512, 256, maxAnisotropy);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 1.9),
      new THREE.MeshBasicMaterial({ map: uzumTex })
    );
    sign.position.set(0, 2.1, 2.02);
    group.add(sign);
  } else if (proj.buildingType === 'beeline_ai') {
    // 06: Beeline Operator AI (Beeline - AI Operator)
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.3, 4.8, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.7 })
    );
    body.position.y = 2.68;
    body.castShadow = true;
    group.add(body);

    const beelineTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 24);
      ctx.fill();

      // Yellow & Black striped circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(105, 95, 55, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#eab308';
      ctx.fillRect(50, 40, 110, 110);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(50, 60, 110, 18);
      ctx.fillRect(50, 96, 110, 18);
      ctx.fillRect(50, 132, 110, 18);
      ctx.restore();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 58px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Beeline', 180, 95);

      ctx.fillStyle = '#0f172a';
      ctx.font = '700 26px sans-serif';
      ctx.fillText('OPERATOR AI · TELEKOM', 45, 195);
    }, 512, 256, maxAnisotropy);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.8),
      new THREE.MeshBasicMaterial({ map: beelineTex })
    );
    sign.position.set(0, 2.8, 2.36);
    group.add(sign);
  } else if (proj.buildingType === 'korzinka_mobile') {
    // 07: Smart Korzinka mobile (korzinka - Mobil Mahsulot)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 2.5, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.45, metalness: 0.3 })
    );
    body.position.y = 1.53;
    body.castShadow = true;
    group.add(body);

    const korzinkaTex = createSignTexture((ctx, w, h) => {
      ctx.fillStyle = '#fef2f2';
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 24);
      ctx.fill();

      // Red shopping cart / basket icon
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(95, 95, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(72, 85, 46, 22);

      ctx.fillStyle = '#dc2626';
      ctx.font = '900 62px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('korzinka', 160, 95);

      ctx.fillStyle = '#0f172a';
      ctx.font = '800 28px sans-serif';
      ctx.fillText('SMART KORZINKA MOBILE', 45, 195);
    }, 512, 256, maxAnisotropy);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 1.95),
      new THREE.MeshBasicMaterial({ map: korzinkaTex })
    );
    sign.position.set(0, 2.05, 2.02);
    group.add(sign);
  }

  // 3D In-World Holographic Project Number & Brand Beacon
  const projBeacon = new THREE.Group();
  const pHeight = proj.buildingType === 'murad_crm' ? 8.4 : 5.8;
  projBeacon.position.set(0, pHeight, 0);

  // Vertical light laser needle pointing down to roof
  const pBeamGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
  const pBeamMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0.75,
  });
  const pBeam = new THREE.Mesh(pBeamGeo, pBeamMat);
  pBeam.position.y = -0.9;
  projBeacon.add(pBeam);

  // High-contrast Project Number Canvas
  const pNumTex = createSignTexture((ctx, w, h) => {
    ctx.fillStyle = proj.brandBg || '#0a0f1d';
    ctx.beginPath();
    ctx.roundRect(10, 10, w - 20, h - 20, 36);
    ctx.fill();

    ctx.strokeStyle = proj.color;
    ctx.lineWidth = 14;
    ctx.stroke();

    // Top: Number
    ctx.fillStyle = proj.brandColor || '#ffffff';
    ctx.font = '900 96px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(proj.code, w / 2, h / 2 - 24);

    // Bottom: Brand text
    ctx.font = '800 44px sans-serif';
    ctx.fillText(proj.brandText, w / 2, h / 2 + 52);
  }, 256, 256, maxAnisotropy);

  const pPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.6),
    new THREE.MeshBasicMaterial({
      map: pNumTex,
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  projBeacon.add(pPlane);

  // Rotating outer halo ring
  const pHaloGeo = new THREE.RingGeometry(0.95, 1.08, 32);
  const pHaloMesh = new THREE.Mesh(
    pHaloGeo,
    new THREE.MeshBasicMaterial({
      color: accentColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    })
  );
  projBeacon.add(pHaloMesh);

  group.add(projBeacon);
  animatedParts.push(projBeacon);

  // Invisible raycast proxy box for reliable click & hover detection
  const colliderGeo = new THREE.BoxGeometry(7.6, 8.5, 7.6);
  const colliderMat = new THREE.MeshBasicMaterial({ visible: false });
  const collider = new THREE.Mesh(colliderGeo, colliderMat);
  collider.position.y = 4.25;
  collider.userData = { projectId: proj.id, isProject: true };
  group.add(collider);

  return { group, collider, animatedParts };
}


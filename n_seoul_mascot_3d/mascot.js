import * as THREE from "three";

const canvas = document.querySelector("[data-mascot-canvas]");
const canvasWrap = document.querySelector("[data-canvas-wrap]");
const loadingMessage = document.querySelector("[data-loading-message]");
const errorMessage = document.querySelector("[data-error-message]");
const motionButtons = [...document.querySelectorAll("[data-motion]")];
const travelButton = document.querySelector("[data-toggle-travel]");
const motionStatus = document.querySelector("[data-motion-status]");

if (!canvas || !canvasWrap) {
  throw new Error("마스코트 캔버스를 찾을 수 없습니다.");
}

canvas.tabIndex = 0;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const CREAM = 0xffdda0;
const CREAM_LIGHT = 0xffe9b9;
const SHIRT_GREEN = 0xaab968;
const SHIRT_DARK = 0x98a75b;
const FACE_BROWN = 0x5b2d1d;
const PAW_BROWN = 0x563022;

let renderer;
let camera;
let scene;
let mascot;
let clock;
let animationFrameId;
let visibilityObserver;
let visibilityCheckFrameId;
let isCanvasVisible = true;
let isDocumentVisible = !document.hidden;
let isContextLost = false;
let currentMotion = "idle";
let previousMotion = "idle";
let motionStartedAt = 0;
let motionBlend = 1;
let shouldTravel = true;
let viewYaw = 0;
let targetViewYaw = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartYaw = 0;

function createMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.78,
    metalness: 0,
    side: options.side ?? THREE.FrontSide,
    polygonOffset: options.polygonOffset ?? false,
    polygonOffsetFactor: options.polygonOffsetFactor ?? 0,
    polygonOffsetUnits: options.polygonOffsetUnits ?? 0,
    bumpMap: options.bumpMap ?? null,
    bumpScale: options.bumpScale ?? 0,
  });
}

function createMicroBumpTexture(size = 64) {
  const data = new Uint8Array(size * size);
  let seed = 9473;
  for (let index = 0; index < data.length; index += 1) {
    seed = (seed * 16807) % 2147483647;
    const grain = (seed / 2147483647) * 30;
    const weave = ((index % size) % 4 === 0 ? 8 : 0) + (Math.floor(index / size) % 5 === 0 ? 6 : 0);
    data[index] = 112 + Math.round(grain + weave);
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 7);
  texture.needsUpdate = true;
  return texture;
}

function createEllipticalBand(name, rings, material, radialSegments = 72) {
  const profileCurve = new THREE.CatmullRomCurve3(
    rings.map((ring) => new THREE.Vector3(ring.radiusX, ring.y, ring.radiusZ)),
    false,
    "centripetal",
  );
  const smoothRings = profileCurve.getPoints(Math.max(20, (rings.length - 1) * 6)).map((point) => ({
    radiusX: point.x,
    y: point.y,
    radiusZ: point.z,
  }));
  const positions = [];
  const uvs = [];
  const indices = [];

  smoothRings.forEach((ring, ringIndex) => {
    for (let segment = 0; segment <= radialSegments; segment += 1) {
      const u = segment / radialSegments;
      const angle = u * Math.PI * 2;
      positions.push(Math.cos(angle) * ring.radiusX, ring.y, Math.sin(angle) * ring.radiusZ + (ring.offsetZ ?? 0));
      uvs.push(u, ringIndex / (smoothRings.length - 1));
    }
  });

  for (let ringIndex = 0; ringIndex < smoothRings.length - 1; ringIndex += 1) {
    for (let segment = 0; segment < radialSegments; segment += 1) {
      const current = ringIndex * (radialSegments + 1) + segment;
      const next = current + radialSegments + 1;
      indices.push(current, current + 1, next, next, current + 1, next + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return createMesh(geometry, material, name);
}

function createEllipseSeam(name, radiusX, radiusZ, material, thickness = 0.024) {
  const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusZ, 0, Math.PI * 2, false, 0);
  const points = curve.getPoints(96).map((point) => new THREE.Vector3(point.x, 0, point.y));
  const loop = new THREE.CatmullRomCurve3(points, true, "centripetal");
  return createMesh(new THREE.TubeGeometry(loop, 96, thickness, 7, true), material, name);
}

function createStitchRing(name, radiusX, radiusZ, y, material, count = 44) {
  const stitchGeometry = new THREE.BoxGeometry(0.055, 0.012, 0.018);
  const stitches = new THREE.InstancedMesh(stitchGeometry, material, count);
  stitches.name = name;
  stitches.castShadow = false;
  stitches.receiveShadow = true;

  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3(1, 1, 1);
  const xAxis = new THREE.Vector3(1, 0, 0);

  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    position.set(Math.cos(angle) * radiusX, y, Math.sin(angle) * radiusZ);
    tangent.set(-Math.sin(angle) * radiusX, 0, Math.cos(angle) * radiusZ).normalize();
    quaternion.setFromUnitVectors(xAxis, tangent);
    matrix.compose(position, quaternion, scale);
    stitches.setMatrixAt(index, matrix);
  }
  stitches.instanceMatrix.needsUpdate = true;
  return stitches;
}

function createMesh(geometry, material, name, castShadow = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  return mesh;
}

function createEllipsoid(name, radius, scale, material, segments = 48) {
  const mesh = createMesh(
    new THREE.SphereGeometry(radius, segments, Math.max(24, Math.round(segments * 0.66))),
    material,
    name,
  );
  mesh.scale.set(...scale);
  return mesh;
}

function createCapsule(name, radius, length, material) {
  return createMesh(new THREE.CapsuleGeometry(radius, length, 10, 24), material, name);
}

function createEar(name, side, materials) {
  const ear = new THREE.Group();
  ear.name = name;
  ear.position.set(side * 1.13, 2.03, 0.02);
  ear.rotation.z = side * -0.13;

  const outer = createMesh(
    new THREE.TorusGeometry(0.31, 0.16, 18, 52),
    materials.cream,
    `${name}_outer`,
  );
  outer.scale.set(1, 1.06, 0.82);

  const back = createEllipsoid(`${name}_back`, 0.46, [1, 1.06, 0.3], materials.cream, 36);
  back.position.z = -0.2;

  const inner = createEllipsoid(`${name}_inner`, 0.35, [1, 1.04, 0.2], materials.earInner, 32);
  inner.position.z = -0.075;

  ear.add(back, outer, inner);
  return ear;
}

function createEye(name, side, materials) {
  const eyeGroup = new THREE.Group();
  eyeGroup.name = name;
  eyeGroup.position.set(side * 0.48, 1.15, 1.09);
  eyeGroup.rotation.x = -0.04;

  const eye = createEllipsoid(`${name}_body`, 0.14, [0.72, 1.3, 0.38], materials.face, 28);
  const highlight = createEllipsoid(`${name}_highlight`, 0.025, [0.7, 1, 0.35], materials.white, 16);
  highlight.position.set(-0.025, 0.075, 0.055);
  eyeGroup.add(eye, highlight);
  return eyeGroup;
}

function createHeartLogo(material) {
  const logo = new THREE.Group();
  logo.name = "heart_n_logo";
  logo.position.set(0, 0.02, 1.43);
  logo.scale.setScalar(0.4);

  const heartPoints = [];
  for (let index = 0; index <= 96; index += 1) {
    const angle = (index / 96) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(angle), 3);
    const y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
    heartPoints.push(new THREE.Vector3(x / 14, y / 14, 0));
  }
  const heartCurve = new THREE.CatmullRomCurve3(heartPoints, true, "centripetal");
  const heart = createMesh(new THREE.TubeGeometry(heartCurve, 96, 0.042, 7, true), material, "heart_outline", false);

  const nShape = new THREE.Shape();
  nShape.moveTo(-0.38, -0.42);
  nShape.lineTo(-0.18, -0.42);
  nShape.lineTo(-0.18, 0.35);
  nShape.lineTo(0.22, -0.42);
  nShape.lineTo(0.42, -0.42);
  nShape.lineTo(0.42, 0.42);
  nShape.lineTo(0.22, 0.42);
  nShape.lineTo(0.22, -0.02);
  nShape.lineTo(-0.18, 0.42);
  nShape.lineTo(-0.38, 0.42);
  nShape.closePath();
  const letter = createMesh(new THREE.ExtrudeGeometry(nShape, { depth: 0.022, bevelEnabled: false }), material, "logo_n", false);
  letter.position.set(-0.02, -0.05, 0.02);

  logo.add(heart, letter);
  return logo;
}

function createPawDetails(side, materials) {
  const details = new THREE.Group();
  details.name = side < 0 ? "left_paw_details" : "right_paw_details";
  details.position.set(0, -0.455, 0.06);

  const mainPad = createEllipsoid("main_pad", 0.3, [1.15, 0.15, 0.83], materials.paw, 24);
  mainPad.castShadow = false;
  mainPad.position.set(0, 0, 0.12);
  details.add(mainPad);

  const toeOffsets = [-0.34, -0.17, 0, 0.17, 0.34];
  toeOffsets.forEach((offset, index) => {
    const toe = createEllipsoid(`toe_pad_${index + 1}`, 0.095, [1, 0.18, 1.15], materials.paw, 18);
    toe.castShadow = false;
    toe.position.set(offset, 0, 0.42 - Math.abs(offset) * 0.25);
    details.add(toe);
  });

  return details;
}

function createArm(side, materials) {
  const pivot = new THREE.Group();
  pivot.name = side < 0 ? "left_shoulder_pivot" : "right_shoulder_pivot";
  pivot.position.set(side * 1.48, 0.38, 0.02);

  const sleeve = createEllipticalBand(
    side < 0 ? "left_sleeve" : "right_sleeve",
    [
      { y: 0.32, radiusX: 0.35, radiusZ: 0.34 },
      { y: 0.14, radiusX: 0.43, radiusZ: 0.4 },
      { y: -0.1, radiusX: 0.45, radiusZ: 0.4 },
      { y: -0.34, radiusX: 0.39, radiusZ: 0.35 }
    ],
    materials.shirt,
    40,
  );
  sleeve.position.set(0, -0.2, 0.13);

  const sleeveCuff = createEllipseSeam(
    side < 0 ? "left_sleeve_cuff" : "right_sleeve_cuff",
    0.39,
    0.35,
    materials.shirtDark,
  );
  sleeveCuff.position.set(0, -0.54, 0.13);

  const arm = createCapsule(side < 0 ? "left_arm" : "right_arm", 0.43, 0.72, materials.cream);
  arm.position.y = -0.92;

  pivot.add(sleeve, sleeveCuff, arm);
  pivot.rotation.z = side * 0.12;
  return pivot;
}

function createLeg(side, materials) {
  const pivot = new THREE.Group();
  pivot.name = side < 0 ? "left_hip_pivot" : "right_hip_pivot";
  pivot.position.set(side * 0.48, -1.32, 0.08);

  const leg = createEllipsoid(
    side < 0 ? "left_leg" : "right_leg",
    0.7,
    [1.16, 0.76, 1.13],
    materials.cream,
    48,
  );
  leg.position.y = -0.35;
  leg.rotation.z = side * -0.025;
  leg.add(createPawDetails(side, materials));
  pivot.add(leg);
  return pivot;
}

function createMascot() {
  const root = new THREE.Group();
  root.name = "n_seoul_mascot_root";

  const plushBump = createMicroBumpTexture();
  const fabricBump = createMicroBumpTexture();
  fabricBump.repeat.set(11, 11);

  const materials = {
    cream: createMaterial(CREAM, { roughness: 0.86, bumpMap: plushBump, bumpScale: 0.012 }),
    creamLight: createMaterial(CREAM_LIGHT, { roughness: 0.9, bumpMap: plushBump, bumpScale: 0.008 }),
    shirt: createMaterial(SHIRT_GREEN, { roughness: 0.94, bumpMap: fabricBump, bumpScale: 0.018 }),
    shirtDark: createMaterial(SHIRT_DARK, { roughness: 0.94, bumpMap: fabricBump, bumpScale: 0.012 }),
    earInner: createMaterial(0xf3c97a, { roughness: 0.9, bumpMap: plushBump, bumpScale: 0.006 }),
    face: createMaterial(FACE_BROWN, { roughness: 0.48 }),
    paw: createMaterial(PAW_BROWN, { roughness: 0.62 }),
    white: createMaterial(0xffffff, { roughness: 0.7 }),
  };

  const bouncePivot = new THREE.Group();
  bouncePivot.name = "body_bounce_pivot";
  bouncePivot.position.y = 0.15;

  const body = createEllipsoid("body_head", 1, [1.63, 2.18, 1.25], materials.cream, 64);
  body.position.y = 0.1;

  const shirt = createEllipticalBand("shirt_body", [
    { y: 0.61, radiusX: 1.55, radiusZ: 1.245 },
    { y: 0.5, radiusX: 1.62, radiusZ: 1.3 },
    { y: 0.28, radiusX: 1.66, radiusZ: 1.34 },
    { y: 0.08, radiusX: 1.66, radiusZ: 1.35 },
    { y: -0.34, radiusX: 1.64, radiusZ: 1.33 },
    { y: -0.66, radiusX: 1.6, radiusZ: 1.28 },
    { y: -0.88, radiusX: 1.54, radiusZ: 1.23 }
  ], materials.shirt);

  const collar = createEllipseSeam("shirt_collar", 1.55, 1.25, materials.shirtDark, 0.018);
  collar.castShadow = false;
  collar.position.set(0, 0.615, 0.012);
  const collarStitches = createStitchRing("shirt_collar_stitches", 1.555, 1.255, 0.62, materials.shirtDark, 48);

  const hem = createEllipseSeam("shirt_hem", 1.54, 1.23, materials.shirtDark, 0.02);
  hem.castShadow = false;
  hem.position.set(0, -0.878, 0.012);
  const hemStitches = createStitchRing("shirt_hem_stitches", 1.545, 1.235, -0.872, materials.shirtDark, 52);

  const leftEar = createEar("left_ear", -1, materials);
  const rightEar = createEar("right_ear", 1, materials);
  const leftEye = createEye("left_eye", -1, materials);
  const rightEye = createEye("right_eye", 1, materials);

  const muzzle = createEllipsoid("muzzle", 0.2, [1.05, 0.55, 0.44], materials.creamLight, 28);
  muzzle.position.set(0, 0.99, 1.19);
  muzzle.castShadow = false;
  const nose = createEllipsoid("nose", 0.12, [1.2, 0.66, 0.68], materials.face, 28);
  nose.position.set(0, 1.035, 1.29);

  const leftArmPivot = createArm(-1, materials);
  const rightArmPivot = createArm(1, materials);
  const leftLegPivot = createLeg(-1, materials);
  const rightLegPivot = createLeg(1, materials);

  const tailPivot = new THREE.Group();
  tailPivot.name = "tail_pivot";
  tailPivot.position.set(0, -0.84, -1.12);
  const tail = createEllipsoid("tail", 0.31, [1, 1, 0.84], materials.creamLight, 32);
  tail.position.z = -0.18;
  tailPivot.add(tail);

  const logo = createHeartLogo(materials.white);

  bouncePivot.add(
    body,
    shirt,
    collar,
    collarStitches,
    hem,
    hemStitches,
    leftEar,
    rightEar,
    leftEye,
    rightEye,
    muzzle,
    nose,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    tailPivot,
    logo,
  );
  root.add(bouncePivot);

  root.userData.sculptRuntime = {
    nodes: {
      bouncePivot,
      leftArmPivot,
      rightArmPivot,
      leftLegPivot,
      rightLegPivot,
      tailPivot,
    },
    initial: {
      leftArmZ: leftArmPivot.rotation.z,
      rightArmZ: rightArmPivot.rotation.z,
    },
  };

  return root;
}

function createGround() {
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0xefe5cc,
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0.78,
  });
  const ground = createMesh(new THREE.CircleGeometry(5.2, 72), groundMaterial, "ground", false);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.2;
  return ground;
}

function easeInOut(value) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function setMotion(nextMotion) {
  if (nextMotion === currentMotion) return;
  previousMotion = currentMotion;
  currentMotion = nextMotion;
  motionStartedAt = clock ? clock.getElapsedTime() : 0;
  motionBlend = 0;

  motionButtons.forEach((button) => {
    const isActive = button.dataset.motion === currentMotion;
    button.classList.toggle("is_active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  if (motionStatus) {
    const labels = { idle: "기본 자세", walk: "걷기", wave: "손 흔들기" };
    motionStatus.textContent = `${labels[currentMotion]} 동작이 선택되었습니다.`;
  }
}

function renderMotionPreference() {
  const shouldReduceMotion = prefersReducedMotion.matches;
  motionButtons.forEach((button) => {
    const shouldDisable = shouldReduceMotion && button.dataset.motion !== "idle";
    button.disabled = shouldDisable;
  });
  if (travelButton) travelButton.disabled = shouldReduceMotion;
  if (shouldReduceMotion) {
    if (currentMotion !== "idle") setMotion("idle");
    if (motionStatus) motionStatus.textContent = "모션 감소 설정에 따라 기본 자세로 표시됩니다.";
  }
}

function getPose(motion, time) {
  const pose = {
    bounceY: 0,
    bodyTiltZ: 0,
    bodyTiltX: 0,
    bodyYaw: 0,
    leftArmZ: -0.12,
    rightArmZ: 0.12,
    leftArmX: 0,
    rightArmX: 0,
    leftLegX: 0,
    rightLegX: 0,
    leftLegY: 0,
    rightLegY: 0,
    tailZ: 0,
    travelX: 0,
    travelZ: 0,
  };

  if (motion === "idle") {
    pose.bounceY = Math.sin(time * 2.15) * 0.025;
    pose.bodyTiltZ = Math.sin(time * 1.05) * 0.012;
    pose.tailZ = Math.sin(time * 1.8) * 0.035;
  }

  if (motion === "walk") {
    const phase = time * ((Math.PI * 2) / 0.92);
    const stride = Math.sin(phase);
    const leftLift = Math.max(0, -stride);
    const rightLift = Math.max(0, stride);
    pose.bounceY = Math.cos(phase * 2) * 0.014 - Math.abs(stride) * 0.022;
    pose.bodyTiltZ = stride * 0.038;
    pose.bodyTiltX = -0.02;
    pose.bodyYaw = -stride * 0.024;
    pose.leftLegX = stride * 0.2;
    pose.rightLegX = -stride * 0.2;
    pose.leftLegY = leftLift * leftLift * 0.095;
    pose.rightLegY = rightLift * rightLift * 0.095;
    pose.leftArmX = -stride * 0.16;
    pose.rightArmX = stride * 0.16;
    pose.leftArmZ = -0.12 - stride * 0.025;
    pose.rightArmZ = 0.12 - stride * 0.025;
    pose.tailZ = -Math.sin(phase - 0.45) * 0.075;
    pose.travelZ = shouldTravel ? Math.sin(time * 0.82) * 0.46 : 0;
  }

  if (motion === "wave") {
    const elapsed = time - motionStartedAt;
    const lift = easeInOut(elapsed / 0.52) * easeInOut((3.4 - elapsed) / 0.62);
    const wave = Math.sin(Math.max(0, elapsed - 0.4) * 8.6) * 0.13 * lift;
    pose.bounceY = Math.sin(time * 2.1) * 0.02;
    pose.bodyTiltZ = -0.035 * lift;
    pose.bodyYaw = 0.035 * lift;
    pose.rightArmZ = 2.08 * lift + 0.12 + wave;
    pose.rightArmX = (-0.1 + Math.sin(elapsed * 4.3) * 0.025) * lift;
    pose.leftArmZ = -0.12;
    pose.tailZ = Math.sin(time * 2.4) * 0.05;
  }

  return pose;
}

function blendPose(fromPose, toPose, amount) {
  const pose = {};
  Object.keys(toPose).forEach((key) => {
    pose[key] = THREE.MathUtils.lerp(fromPose[key], toPose[key], amount);
  });
  return pose;
}

function applyPose(pose) {
  const runtime = mascot.userData.sculptRuntime.nodes;
  runtime.bouncePivot.position.y = 0.15 + pose.bounceY;
  runtime.bouncePivot.rotation.set(pose.bodyTiltX, pose.bodyYaw, pose.bodyTiltZ);
  runtime.leftArmPivot.rotation.set(pose.leftArmX, 0, pose.leftArmZ);
  runtime.rightArmPivot.rotation.set(pose.rightArmX, 0, pose.rightArmZ);
  runtime.leftLegPivot.rotation.x = pose.leftLegX;
  runtime.rightLegPivot.rotation.x = pose.rightLegX;
  runtime.leftLegPivot.position.y = -1.32 + pose.leftLegY;
  runtime.rightLegPivot.position.y = -1.32 + pose.rightLegY;
  runtime.tailPivot.rotation.z = pose.tailZ;
  mascot.position.x = pose.travelX;
  mascot.position.z = pose.travelZ;
}

function updateAnimation(time, delta) {
  if (prefersReducedMotion.matches) {
    applyPose(getPose("idle", 0));
    return;
  }

  motionBlend = Math.min(1, motionBlend + delta / 0.28);
  const previousPose = getPose(previousMotion, time);
  const currentPose = getPose(currentMotion, time);
  applyPose(blendPose(previousPose, currentPose, easeInOut(motionBlend)));

  if (currentMotion === "wave" && time - motionStartedAt >= 3.4) {
    setMotion("idle");
  }
}

function resizeRenderer() {
  const width = canvasWrap.clientWidth;
  const height = canvasWrap.clientHeight;
  const maxPixelRatio = window.innerWidth < 834 ? 1.5 : 2;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.z = camera.aspect < 0.72 ? 14.4 : 10.8;
  camera.updateProjectionMatrix();
  camera.lookAt(0, -0.05, 0);
  if (scene) renderer.render(scene, camera);
}

function handlePointerDown(event) {
  isDragging = true;
  dragStartX = event.clientX;
  dragStartYaw = targetViewYaw;
  canvas.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  if (!isDragging) return;
  targetViewYaw = dragStartYaw + (event.clientX - dragStartX) * 0.009;
}

function handlePointerUp(event) {
  isDragging = false;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}

function handleKeyDown(event) {
  if (event.key === "ArrowLeft") {
    targetViewYaw -= 0.16;
    event.preventDefault();
  }
  if (event.key === "ArrowRight") {
    targetViewYaw += 0.16;
    event.preventDefault();
  }
  const shortcutMotion = { "1": "idle", "2": "walk", "3": "wave" }[event.key];
  if (shortcutMotion && !prefersReducedMotion.matches) {
    setMotion(shortcutMotion);
    event.preventDefault();
  }
}

function bindControls() {
  motionButtons.forEach((button) => {
    button.addEventListener("click", () => setMotion(button.dataset.motion));
  });

  travelButton?.addEventListener("click", () => {
    shouldTravel = !shouldTravel;
    travelButton.classList.toggle("is_active", shouldTravel);
    travelButton.setAttribute("aria-pressed", String(shouldTravel));
    travelButton.textContent = shouldTravel ? "앞으로 이동" : "제자리 걷기";
  });

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);
  document.addEventListener("keydown", handleKeyDown);
  prefersReducedMotion.addEventListener?.("change", renderMotionPreference);
  renderMotionPreference();
}

function renderFrame() {
  if (!isCanvasVisible || !isDocumentVisible || isContextLost) {
    canvas.dataset.renderState = "paused";
    animationFrameId = null;
    return;
  }
  canvas.dataset.renderState = "running";
  const delta = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;
  updateAnimation(time, delta);
  viewYaw = THREE.MathUtils.lerp(viewYaw, targetViewYaw, 1 - Math.pow(0.001, delta));
  mascot.rotation.y = viewYaw;
  renderer.render(scene, camera);
  animationFrameId = window.requestAnimationFrame(renderFrame);
}

function requestRenderLoop() {
  if (animationFrameId || !isCanvasVisible || !isDocumentVisible || isContextLost) return;
  clock.getDelta();
  animationFrameId = window.requestAnimationFrame(renderFrame);
}

function updateFallbackVisibility() {
  visibilityCheckFrameId = null;
  const rect = canvasWrap.getBoundingClientRect();
  const margin = 120;
  isCanvasVisible = rect.bottom >= -margin && rect.top <= window.innerHeight + margin;
  requestRenderLoop();
}

function handleFallbackVisibilityCheck() {
  if (visibilityCheckFrameId) return;
  visibilityCheckFrameId = window.requestAnimationFrame(updateFallbackVisibility);
}

function handleContextLost(event) {
  event.preventDefault();
  isContextLost = true;
  canvas.dataset.renderState = "context-lost";
  errorMessage.hidden = false;
  errorMessage.textContent = "3D 렌더링이 일시 중단되었습니다. 자동 복구를 기다려주세요.";
}

function handleContextRestored() {
  isContextLost = false;
  errorMessage.hidden = true;
  errorMessage.textContent = "";
  resizeRenderer();
  requestRenderLoop();
}

function initRenderVisibility() {
  document.addEventListener("visibilitychange", () => {
    isDocumentVisible = !document.hidden;
    requestRenderLoop();
  });

  if (!("IntersectionObserver" in window)) {
    window.addEventListener("scroll", handleFallbackVisibilityCheck, { passive: true });
    window.addEventListener("resize", handleFallbackVisibilityCheck, { passive: true });
    updateFallbackVisibility();
    return;
  }
  visibilityObserver = new IntersectionObserver(
    (entries) => {
      isCanvasVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0);
      requestRenderLoop();
    },
    { rootMargin: "120px 0px", threshold: 0.01 },
  );
  visibilityObserver.observe(canvasWrap);
}

function initScene() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(31, 1, 0.1, 40);
  camera.position.set(0, 0.25, 10.8);
  camera.lookAt(0, -0.05, 0);

  scene.add(new THREE.HemisphereLight(0xfff4df, 0x747a58, 1.65));

  const keyLight = new THREE.DirectionalLight(0xffdfa3, 3.4);
  keyLight.position.set(-4, 6.5, 6);
  keyLight.castShadow = true;
  const shadowMapSize = window.innerWidth < 834 ? 1024 : 2048;
  keyLight.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 18;
  keyLight.shadow.camera.left = -4;
  keyLight.shadow.camera.right = 4;
  keyLight.shadow.camera.top = 5;
  keyLight.shadow.camera.bottom = -4;
  keyLight.shadow.bias = -0.0004;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xdce8ff, 1.45);
  rimLight.position.set(4, 3, -5);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xfff0d2, 0.7);
  fillLight.position.set(4, 1.5, 5);
  scene.add(fillLight);

  mascot = createMascot();
  scene.add(mascot, createGround());

  let meshCount = 0;
  let triangleCount = 0;
  mascot.traverse((node) => {
    if (!node.isMesh) return;
    meshCount += 1;
    const geometry = node.geometry;
    if (!geometry) return;
    const baseTriangles = geometry.index
      ? geometry.index.count / 3
      : (geometry.getAttribute("position")?.count ?? 0) / 3;
    triangleCount += baseTriangles * (node.isInstancedMesh ? node.count : 1);
  });
  canvas.dataset.threeRevision = THREE.REVISION;
  canvas.dataset.meshCount = String(meshCount);
  canvas.dataset.triangleCount = String(Math.round(triangleCount));

  clock = new THREE.Clock();
  motionStartedAt = 0;
  bindControls();
  canvas.addEventListener("webglcontextlost", handleContextLost, false);
  canvas.addEventListener("webglcontextrestored", handleContextRestored, false);
  initRenderVisibility();
  resizeRenderer();

  const resizeObserver = new ResizeObserver(resizeRenderer);
  resizeObserver.observe(canvasWrap);
  loadingMessage.hidden = true;
  renderFrame();
}

function showInitError(error) {
  loadingMessage.hidden = true;
  errorMessage.hidden = false;
  errorMessage.textContent = "3D 마스코트를 불러오지 못했습니다. 네트워크 연결과 WebGL 지원을 확인해주세요.";
  canvas.setAttribute("aria-hidden", "true");
  console.error(error);
}

try {
  initScene();
} catch (error) {
  showInitError(error);
}

window.addEventListener("pagehide", () => {
  if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
  if (visibilityCheckFrameId) window.cancelAnimationFrame(visibilityCheckFrameId);
  visibilityObserver?.disconnect();
  window.removeEventListener("scroll", handleFallbackVisibilityCheck);
  window.removeEventListener("resize", handleFallbackVisibilityCheck);
  canvas.removeEventListener("webglcontextlost", handleContextLost);
  canvas.removeEventListener("webglcontextrestored", handleContextRestored);
  document.removeEventListener("keydown", handleKeyDown);
  prefersReducedMotion.removeEventListener?.("change", renderMotionPreference);
  renderer?.dispose();
});

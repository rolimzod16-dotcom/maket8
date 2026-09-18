"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Edges, Environment, OrbitControls, PointerLockControls, RoundedBox } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FLOOR_D, FLOOR_W, rooms, materialConfig, type Room } from "./floorData";
import type { ViewMode } from "@/app/page";

const xrStore = createXRStore();
const rowZ = [-24.5, -17.5, -10.5, -3.5, 3.5, 10.5, 17.5];
const doorZ = [-21.5, -14.5, -7.5, -0.5, 6.5, 13.5, 21];
type Box2 = { minX: number; maxX: number; minZ: number; maxZ: number };
const colliders: Box2[] = [
  { minX: -9.75, maxX: -9.18, minZ: -26.2, maxZ: 24.5 },
  { minX: 9.18, maxX: 9.75, minZ: -26.2, maxZ: 24.5 },
  { minX: -9.7, maxX: 9.7, minZ: -26.25, maxZ: -25.78 },
  ...rowZ.flatMap((z) => [
    { minX: -9.55, maxX: -2.42, minZ: z - 0.15, maxZ: z + 0.15 },
    { minX: 2.42, maxX: 9.55, minZ: z - 0.15, maxZ: z + 0.15 },
  ]),
  ...[-2.5, 2.5].flatMap((x) => {
    const edges = [-25.8, ...doorZ.flatMap((z) => [z - 0.72, z + 0.72]), 23.65];
    const out: Box2[] = [];
    for (let i = 0; i < edges.length - 1; i += 2) {
      out.push({ minX: x - 0.16, maxX: x + 0.16, minZ: edges[i], maxZ: edges[i + 1] });
    }
    return out;
  }),
];

function useGridTexture() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = materialConfig.floor.color;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(78, 62, 46, 0.22)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, size - 2, size - 2);
    ctx.strokeStyle = "rgba(78, 62, 46, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(FLOOR_W, FLOOR_D);
    return texture;
  }, []);
}

function Wall({ p, s }: { p: [number, number, number]; s: [number, number, number] }) {
  const alongZ = s[2] >= s[0];
  const skirting: [number, number, number] = alongZ ? [s[0] + 0.07, 0.1, s[2]] : [s[0], 0.1, s[2] + 0.07];
  return (
    <group>
      <mesh position={p} castShadow receiveShadow>
        <boxGeometry args={s} />
        <meshStandardMaterial {...materialConfig.wall} />
      </mesh>
      <mesh position={[p[0], 0.05, p[2]]} receiveShadow>
        <boxGeometry args={skirting} />
        <meshStandardMaterial color={materialConfig.skirting.color} roughness={materialConfig.skirting.roughness} />
      </mesh>
    </group>
  );
}

function Door({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  return (
    <group position={[x, 1.05, z]} rotation-y={rot}>
      <mesh castShadow>
        <boxGeometry args={[1.05, 2.1, 0.09]} />
        <meshStandardMaterial {...materialConfig.door} />
      </mesh>
      <mesh position={[-0.38, 0, 0.07]}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshStandardMaterial color="#d6ad58" metalness={0.7} />
      </mesh>
    </group>
  );
}

function roundedFloorShape() {
  const s = new THREE.Shape();
  s.moveTo(-9.5, -28);
  s.lineTo(9.5, -28);
  s.lineTo(9.5, 24);
  s.quadraticCurveTo(9.5, 28, 5.5, 28);
  s.lineTo(-5.5, 28);
  s.quadraticCurveTo(-9.5, 28, -9.5, 24);
  s.closePath();
  return s;
}

function CorridorWall({ x }: { x: number }) {
  return (
    <>
      {doorZ.map((z, i) => {
        const prev = i === 0 ? -25.8 : doorZ[i - 1] + 0.72;
        const end = z - 0.72;
        return <Wall key={`${x}-${z}`} p={[x, 1.5, (prev + end) / 2]} s={[0.18, 3, end - prev]} />;
      })}
      <Wall p={[x, 1.5, (doorZ.at(-1)! + 0.72 + 23.65) / 2]} s={[0.18, 3, 23.65 - (doorZ.at(-1)! + 0.72)]} />
      {doorZ.map((z) => (
        <Door key={`d-${x}-${z}`} x={x} z={z} rot={x < 0 ? -0.92 : 0.92} />
      ))}
    </>
  );
}

function FloorSurface() {
  const texture = useGridTexture();
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <shapeGeometry args={[roundedFloorShape()]} />
      <meshStandardMaterial
        color={materialConfig.floor.color}
        map={texture ?? undefined}
        roughness={materialConfig.floor.roughness}
        metalness={0.02}
      />
    </mesh>
  );
}

function RoomPatch({
  room,
  selected,
  onSelect,
}: {
  room: Room;
  selected: boolean;
  onSelect: (room: Room) => void;
}) {
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position={[room.x, 0.018, room.z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(room);
      }}
    >
      <planeGeometry args={[room.w - 0.22, room.d - 0.22]} />
      <meshStandardMaterial
        color={selected ? materialConfig.selectedFloor.color : materialConfig.roomFloor.color}
        transparent
        opacity={selected ? 0.42 : 0.28}
        roughness={0.9}
      />
      <Edges
        threshold={15}
        color={selected ? materialConfig.selectedEdge.color : materialConfig.roomEdge.color}
      />
    </mesh>
  );
}

function Architecture({ selected, onSelect }: { selected: Room; onSelect: (r: Room) => void }) {
  return (
    <group>
      <FloorSurface />
      {rooms.map((room) => (
        <RoomPatch key={room.id} room={room} selected={selected.id === room.id} onSelect={onSelect} />
      ))}
      <Wall p={[-9.5, 1.5, -1]} s={[0.35, 3, 50]} />
      <Wall p={[9.5, 1.5, -1]} s={[0.35, 3, 50]} />
      <Wall p={[0, 1.5, -26]} s={[19, 3, 0.35]} />
      {rowZ.map((z) => (
        <group key={z}>
          <Wall p={[-6, 1.5, z]} s={[7, 3, 0.18]} />
          <Wall p={[6, 1.5, z]} s={[7, 3, 0.18]} />
        </group>
      ))}
      <CorridorWall x={-2.5} />
      <CorridorWall x={2.5} />
      <Wall p={[-7.3, 1.5, 23.5]} s={[4.2, 3, 0.2]} />
      <Wall p={[7.3, 1.5, 23.5]} s={[4.2, 3, 0.2]} />
      {[-7, -3.5, 0, 3.5, 7].map((x) => (
        <mesh key={x} position={[x, 1.55, -26.15]}>
          <boxGeometry args={[2.1, 1.4, 0.08]} />
          <meshStandardMaterial color={materialConfig.window.color} transparent opacity={0.42} />
        </mesh>
      ))}
      <RoundedBox args={[19, 0.22, 8]} radius={2.2} smoothness={5} position={[0, 0.1, 25]} receiveShadow>
        <meshStandardMaterial color={materialConfig.corridor.color} roughness={0.92} />
      </RoundedBox>
    </group>
  );
}

function blocked(p: THREE.Vector3) {
  const radius = 0.28;
  return colliders.some(
    (b) => p.x + radius > b.minX && p.x - radius < b.maxX && p.z + radius > b.minZ && p.z - radius < b.maxZ,
  );
}

function TouchLook() {
  const { camera, gl } = useThree();
  useEffect(() => {
    let active = false;
    let lastX = 0;
    let lastY = 0;
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        active = true;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      const euler = new THREE.Euler(0, 0, 0, "YXZ");
      euler.setFromQuaternion(camera.quaternion);
      euler.y -= (e.clientX - lastX) * 0.004;
      euler.x -= (e.clientY - lastY) * 0.004;
      euler.x = THREE.MathUtils.clamp(euler.x, -1.35, 1.35);
      camera.quaternion.setFromEuler(euler);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = () => {
      active = false;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [camera, gl]);
  return null;
}

function Walker({ spawn }: { spawn: [number, number, number] }) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    camera.position.set(...spawn);
    camera.lookAt(0, 1.7, spawn[2]);
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    addEventListener("keydown", down);
    addEventListener("keyup", up);
    return () => {
      removeEventListener("keydown", down);
      removeEventListener("keyup", up);
    };
  }, [camera, spawn]);
  useFrame((_, dt) => {
    const speed = 4.2 * Math.min(dt, 0.05);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const side = new THREE.Vector3(-dir.z, 0, dir.x);
    const delta = new THREE.Vector3();
    if (keys.current.KeyW || keys.current.ArrowUp) delta.add(dir);
    if (keys.current.KeyS || keys.current.ArrowDown) delta.sub(dir);
    if (keys.current.KeyA) delta.sub(side);
    if (keys.current.KeyD) delta.add(side);
    if (delta.lengthSq()) {
      delta.normalize().multiplyScalar(speed);
      const tryX = camera.position.clone();
      tryX.x += delta.x;
      if (!blocked(tryX)) camera.position.x = tryX.x;
      const tryZ = camera.position.clone();
      tryZ.z += delta.z;
      if (!blocked(tryZ)) camera.position.z = tryZ.z;
    }
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -9.05, 9.05);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -25.55, 27);
    camera.position.y = 1.7;
  });
  return (
    <>
      <PointerLockControls />
      <TouchLook />
    </>
  );
}

function MobilePad() {
  const press = (code: string, on: boolean) => window.dispatchEvent(new KeyboardEvent(on ? "keydown" : "keyup", { code }));
  return (
    <div className="joystick">
      <button onPointerDown={() => press("KeyW", true)} onPointerUp={() => press("KeyW", false)}>
        ▲
      </button>
      <div>
        <button onPointerDown={() => press("KeyA", true)} onPointerUp={() => press("KeyA", false)}>
          ◀
        </button>
        <button onPointerDown={() => press("KeyS", true)} onPointerUp={() => press("KeyS", false)}>
          ▼
        </button>
        <button onPointerDown={() => press("KeyD", true)} onPointerUp={() => press("KeyD", false)}>
          ▶
        </button>
      </div>
    </div>
  );
}

export function FloorCanvas({
  mode,
  selected,
  onSelect,
}: {
  mode: ViewMode;
  selected: Room;
  onSelect: (r: Room) => void;
}) {
  const [vr, setVr] = useState(false);
  const spawn = useMemo(() => selected.cameraSpawn, [selected]);
  useEffect(() => {
    navigator.xr?.isSessionSupported("immersive-vr").then(setVr).catch(() => setVr(false));
  }, []);
  return (
    <>
      <Canvas shadows camera={{ position: mode === "walk" ? spawn : [25, 34, 38], fov: 52 }} gl={{ antialias: true }}>
        <XR store={xrStore}>
          <color attach="background" args={["#233144"]} />
          <fog attach="fog" args={["#233144", 70, 130]} />
          <hemisphereLight args={["#fff4e6", "#6d5a48", 0.55]} />
          <ambientLight intensity={0.62} />
          <directionalLight
            position={[16, 26, 10]}
            intensity={1.7}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={1}
            shadow-camera-far={90}
            shadow-camera-left={-22}
            shadow-camera-right={22}
            shadow-camera-top={34}
            shadow-camera-bottom={-34}
          />
          <Architecture selected={selected} onSelect={onSelect} />
          <ContactShadows position={[0, 0.01, 0]} opacity={0.28} scale={80} blur={1.8} far={10} />
          {mode === "walk" ? (
            <Walker spawn={spawn} />
          ) : (
            <OrbitControls makeDefault target={[0, 0, 0]} minDistance={18} maxDistance={85} maxPolarAngle={1.46} />
          )}
          <Environment preset="warehouse" />
        </XR>
      </Canvas>
      {mode === "walk" && <MobilePad />}
      <div className="grid-hint">Сетка 1×1 м · границы помещений</div>
      <button className={`vr-button ${vr ? "supported" : ""}`} onClick={() => vr && xrStore.enterVR()} disabled={!vr}>
        {vr ? "Войти в VR" : "VR недоступен"}
      </button>
    </>
  );
}

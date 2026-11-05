import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import { Euler, Matrix4, Vector3 } from "three";
import type { Group } from "three";
import type { Cubie, Vec3 } from "../models/Cubie";
import { describeMove } from "../models/MoveRotation";
import type { MoveAnimation } from "../hooks/useRubikCube";

// Duración de cada giro, en segundos
const ANIMATION_DURATION = 0.25;

// Nombre de la propiedad de rotación de Three.js para cada eje
const AXIS_KEYS = ["x", "y", "z"] as const;

// Colores estándar del cubo
const COLORS = {
  U: "#f8fafc", // arriba: blanco
  D: "#facc15", // abajo: amarillo
  R: "#dc2626", // derecha: rojo
  L: "#fb923c", // izquierda: naranja
  F: "#16a34a", // frente: verde
  B: "#2563eb", // atrás: azul
};

// Color del sticker según el eje (0 = x, 1 = y, 2 = z) y el sentido (+1 o -1)
function stickerColor(axis: number, sign: number): string {
  if (axis === 0) return sign > 0 ? COLORS.R : COLORS.L;
  if (axis === 1) return sign > 0 ? COLORS.U : COLORS.D;
  return sign > 0 ? COLORS.F : COLORS.B;
}

// Dibuja una pieza individual del cubo
function CubiePiece({ cubie }: { cubie: Cubie }) {
  // La orientación guardada en Cubie se convierte en una rotación de Three.js
  const [xAxis, yAxis, zAxis] = cubie.orientation;
  const matrix = new Matrix4().makeBasis(
    new Vector3(...xAxis),
    new Vector3(...yAxis),
    new Vector3(...zAxis),
  );
  const rotation = new Euler().setFromRotationMatrix(matrix);

  // Un sticker por cada cara visible que tenía la pieza en el cubo resuelto
  const stickers = [0, 1, 2]
    .filter((axis) => cubie.home[axis] !== 0)
    .map((axis) => {
      const sign = Math.sign(cubie.home[axis]);
      const position: Vec3 = [0, 0, 0];
      position[axis] = sign * 0.485;
      const size: Vec3 = [0.82, 0.82, 0.82];
      size[axis] = 0.02;
      return (
        <mesh key={axis} position={position}>
          <boxGeometry args={size} />
          <meshStandardMaterial
            color={stickerColor(axis, sign)}
            roughness={0.35}
          />
        </mesh>
      );
    });

  return (
    <group position={cubie.position} rotation={rotation}>
      <RoundedBox args={[0.96, 0.96, 0.96]} radius={0.07} smoothness={3}>
        <meshStandardMaterial color="#0b0d12" roughness={0.6} metalness={0.1} />
      </RoundedBox>
      {stickers}
    </group>
  );
}

interface CubeSceneProps {
  cubies: readonly Cubie[];
  animation: MoveAnimation | null;
  onAnimationEnd: () => void;
}

// Las 26 piezas más la lógica de animación
function CubeScene({ cubies, animation, onAnimationEnd }: CubeSceneProps) {
  // Grupo que contiene un contenedor por pieza (en el mismo orden que cubies)
  const rootRef = useRef<Group>(null);
  const currentAnimation = useRef<MoveAnimation | null>(null);
  const progress = useRef(0);
  const hasEnded = useRef(false);

  // Se ejecuta en cada frame (unas 60 veces por segundo)
  useFrame((_, delta) => {
    const root = rootRef.current;
    if (!root) return;

    // Sin animación: todas las piezas quedan en su posición real
    if (!animation) {
      currentAnimation.current = null;
      for (const wrapper of root.children) {
        wrapper.rotation.set(0, 0, 0);
      }
      return;
    }

    // Empezó una animación nueva
    if (animation !== currentAnimation.current) {
      currentAnimation.current = animation;
      progress.current = 0;
      hasEnded.current = false;
    }

    // Avanza el progreso de 0 a 1 y lo suaviza (arranca y frena despacio)
    progress.current = Math.min(
      1,
      progress.current + delta / ANIMATION_DURATION,
    );
    const p = progress.current;
    const eased = p * p * (3 - 2 * p);

    // El modelo ya aplicó el movimiento, así que la capa se dibuja en su lugar final
    // y se le suma un giro "de vuelta" que va desapareciendo hasta llegar a 0
    const { axis, layer, direction } = describeMove(animation.move);
    const angle = -direction * (Math.PI / 2) * (1 - eased);

    cubies.forEach((cubie, index) => {
      const wrapper = root.children[index];
      wrapper.rotation.set(0, 0, 0);
      if (cubie.position[axis] === layer) {
        wrapper.rotation[AXIS_KEYS[axis]] = angle;
      }
    });

    // Al terminar avisa una sola vez para pasar al siguiente movimiento
    if (p >= 1 && !hasEnded.current) {
      hasEnded.current = true;
      onAnimationEnd();
    }
  });

  return (
    <group ref={rootRef}>
      {cubies.map((cubie) => (
        <group key={cubie.id}>
          <CubiePiece cubie={cubie} />
        </group>
      ))}
    </group>
  );
}

interface Cube3DProps {
  cubies: readonly Cubie[];
  animation: MoveAnimation | null;
  onAnimationEnd: () => void;
}

// Escena 3D completa: luces, cubo, sombra y cámara
export default function Cube3D({
  cubies,
  animation,
  onAnimationEnd,
}: Cube3DProps) {
  return (
    <Canvas camera={{ position: [4.4, 3.8, 5.8], fov: 42 }} dpr={[1, 2]}>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 8, 6]} intensity={1.8} />
      <directionalLight position={[-6, -3, -4]} intensity={0.6} />
      {/* Luz de color que le da un toque violeta al escenario */}
      <pointLight position={[-4, 3, 4]} intensity={30} color="#818cf8" />

      <CubeScene
        cubies={cubies}
        animation={animation}
        onAnimationEnd={onAnimationEnd}
      />

      {/* Sombra suave en el piso */}
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.55}
        scale={12}
        blur={2.6}
        far={4}
      />

      {/* Permite girar la cámara arrastrando con el mouse */}
      <OrbitControls
        enablePan={false}
        enableDamping
        minDistance={5}
        maxDistance={12}
      />
    </Canvas>
  );
}

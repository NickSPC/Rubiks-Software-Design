import type { Face, Move } from "./Move";

// Describe cómo gira un movimiento en el espacio
export interface MoveRotation {
    // Eje de giro: 0 = x, 1 = y, 2 = z
    axis: number;
    // Capa que gira: 1 o -1 (el extremo del eje donde está la cara)
    layer: 1 | -1;
    // Sentido del giro de 90°: 1 = positivo, -1 = negativo (regla de la mano derecha)
    direction: 1 | -1;
}

// Para cada cara: eje que atraviesa y en qué extremo está su capa
const FACE_CONFIG: Record<Face, { axis: number; layer: 1 | -1 }> = {
    U: { axis: 1, layer: 1 },
    D: { axis: 1, layer: -1 },
    R: { axis: 0, layer: 1 },
    L: { axis: 0, layer: -1 },
    F: { axis: 2, layer: 1 },
    B: { axis: 2, layer: -1 },
};

// Traduce un movimiento (por ejemplo "R" o "U'") a eje, capa y sentido.
// Horario se mide mirando la cara desde afuera, como en la notación estándar
export function describeMove(move: Move): MoveRotation {
    const isClockwise = !move.endsWith("'");
    const face = move[0] as Face;
    const { axis, layer } = FACE_CONFIG[face];
    const direction: 1 | -1 = isClockwise ? (layer === 1 ? -1 : 1) : layer;
    return { axis, layer, direction };
}
import type { Face } from "../models/Move";

// Datos para mostrar cada cara en pantalla
export interface FaceInfo {
    // Nombre en español
    name: string;
    // Palabra en inglés de la que sale la letra de la notación
    english: string;
    // Color de la cara en el cubo
    color: string;
}

export const FACE_INFO: Record<Face, FaceInfo> = {
    U: { name: "Arriba", english: "Up", color: "#f8fafc" },
    D: { name: "Abajo", english: "Down", color: "#facc15" },
    R: { name: "Derecha", english: "Right", color: "#ef4444" },
    L: { name: "Izquierda", english: "Left", color: "#fb923c" },
    F: { name: "Frente", english: "Front", color: "#22c55e" },
    B: { name: "Atrás", english: "Back", color: "#3b82f6" },
};
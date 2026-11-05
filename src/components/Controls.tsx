import type { CSSProperties } from "react";
import { FACES } from "../models/Move";
import type { Face, Move } from "../models/Move";

// Nombre y color de cada cara para mostrar en pantalla
const FACE_INFO: Record<Face, { name: string; color: string }> = {
  U: { name: "Arriba", color: "#f8fafc" },
  D: { name: "Abajo", color: "#facc15" },
  R: { name: "Derecha", color: "#ef4444" },
  L: { name: "Izquierda", color: "#fb923c" },
  F: { name: "Frente", color: "#22c55e" },
  B: { name: "Atrás", color: "#3b82f6" },
};

interface ControlsProps {
  onMove: (move: Move) => void;
}

// Una tarjeta por cara, con su giro horario y antihorario
export default function Controls({ onMove }: ControlsProps) {
  return (
    <div className="face-grid">
      {FACES.map((face) => {
        const { name, color } = FACE_INFO[face];
        const counterClockwise: Move = `${face}'`;
        return (
          <div
            key={face}
            className="face-card"
            style={{ "--face-color": color } as CSSProperties}
          >
            <div className="face-header">
              <span className="face-dot" />
              <span className="face-name">{name}</span>
            </div>
            <div className="face-buttons">
              <button
                className="move-btn"
                onClick={() => onMove(face)}
                title={`${name}, horario (tecla ${face})`}
              >
                {face}
              </button>
              <button
                className="move-btn"
                onClick={() => onMove(counterClockwise)}
                title={`${name}, antihorario (Shift + ${face})`}
              >
                {counterClockwise}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

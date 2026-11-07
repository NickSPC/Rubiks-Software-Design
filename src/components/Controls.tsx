import type { CSSProperties } from "react";
import { FACES } from "../models/Move";
import type { Move } from "../models/Move";
import { FACE_INFO } from "./faceInfo";

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

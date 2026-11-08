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
            role="group"
            aria-label={`Cara ${name}`}
            style={{ "--face-color": color } as CSSProperties}
          >
            <div className="face-header">
              <span className="face-dot" aria-hidden="true" />
              <span className="face-name">{name}</span>
            </div>
            <div className="face-buttons">
              <button
                className="move-btn"
                onClick={() => onMove(face)}
                aria-label={`${face}: ${name}, sentido horario`}
                aria-keyshortcuts={face}
                title={`${name}, horario (tecla ${face})`}
              >
                {face}
              </button>
              <button
                className="move-btn"
                onClick={() => onMove(counterClockwise)}
                aria-label={`${counterClockwise}: ${name}, sentido antihorario`}
                aria-keyshortcuts={`Shift+${face}`}
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

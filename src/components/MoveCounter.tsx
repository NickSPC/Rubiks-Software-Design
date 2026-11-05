import type { MoveCounterObserver } from "../observers/MoveCounterObserver";

interface MoveCounterProps {
  counter: MoveCounterObserver;
}

// Muestra la cantidad de movimientos realizados
export default function MoveCounter({ counter }: MoveCounterProps) {
  return (
    <div className="info-card">
      <span className="info-label">Movimientos</span>
      <span className="info-value">{counter.moves}</span>
    </div>
  );
}

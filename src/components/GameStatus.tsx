import type {
  GameStatus as Status,
  GameStatusObserver,
} from "../observers/GameStatusObserver";

// Texto que se muestra para cada estado de la partida
const STATUS_LABELS: Record<Status, string> = {
  ready: "Listo",
  playing: "En juego",
  solved: "¡Resuelto!",
};

interface GameStatusProps {
  status: GameStatusObserver;
}

// Muestra el estado actual de la partida
export default function GameStatus({ status }: GameStatusProps) {
  return (
    <div className={`info-card status-${status.status}`}>
      <span className="info-label">Estado</span>
      <span className="info-value">{STATUS_LABELS[status.status]}</span>
    </div>
  );
}

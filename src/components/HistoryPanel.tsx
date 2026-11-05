import type { MoveHistoryObserver } from "../observers/MoveHistoryObserver";

// Cantidad máxima de movimientos que se muestran
const MAX_VISIBLE = 30;

interface HistoryPanelProps {
  history: MoveHistoryObserver;
}

// Muestra la última mezcla y los movimientos del usuario
export default function HistoryPanel({ history }: HistoryPanelProps) {
  const moves = history.history;
  const visible = moves.slice(-MAX_VISIBLE);
  const hidden = moves.length - visible.length;
  const scramble = history.lastScramble;

  return (
    <section className="panel">
      <h2 className="panel-title">Historial</h2>

      {scramble.length > 0 && (
        <div className="history-block">
          <span className="info-label">Última mezcla</span>
          <p className="scramble-text">{scramble.join(" ")}</p>
        </div>
      )}

      <div className="history-block">
        <span className="info-label">Tus movimientos</span>
        {visible.length === 0 ? (
          <p className="empty">Todavía no hiciste movimientos</p>
        ) : (
          <ul className="chips">
            {hidden > 0 && <li className="chip chip-more">+{hidden}</li>}
            {visible.map((move, index) => (
              <li
                key={hidden + index}
                className={
                  index === visible.length - 1 ? "chip chip-last" : "chip"
                }
              >
                {move}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

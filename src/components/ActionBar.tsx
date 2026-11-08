interface ActionBarProps {
  onScramble: () => void;
  onReset: () => void;
}

// Botones de mezclar y reiniciar
export default function ActionBar({ onScramble, onReset }: ActionBarProps) {
  return (
    <div className="action-bar">
      <button
        className="btn btn-primary"
        onClick={onScramble}
        aria-label="Scramble: mezclar el cubo"
        aria-keyshortcuts="S"
      >
        Scramble <kbd>S</kbd>
      </button>
      <button
        className="btn"
        onClick={onReset}
        aria-label="Reset: volver al cubo resuelto"
        aria-keyshortcuts="Escape"
      >
        Reset <kbd>Esc</kbd>
      </button>
    </div>
  );
}

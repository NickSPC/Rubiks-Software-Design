interface ActionBarProps {
  onScramble: () => void;
  onReset: () => void;
}

// Botones de mezclar y reiniciar
export default function ActionBar({ onScramble, onReset }: ActionBarProps) {
  return (
    <div className="action-bar">
      <button className="btn btn-primary" onClick={onScramble}>
        Scramble <kbd>S</kbd>
      </button>
      <button className="btn" onClick={onReset}>
        Reset <kbd>Esc</kbd>
      </button>
    </div>
  );
}

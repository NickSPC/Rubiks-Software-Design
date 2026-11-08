import { useRubikCube } from "./hooks/useRubikCube";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import Cube3D from "./components/Cube3D";
import Controls from "./components/Controls";
import ActionBar from "./components/ActionBar";
import MoveCounter from "./components/MoveCounter";
import GameStatus from "./components/GameStatus";
import Timer from "./components/Timer";
import HistoryPanel from "./components/HistoryPanel";
import NotationGuide from "./components/NotationGuide";
import "./App.css";

// Logo: un mini cubo de 3x3 con los colores del cubo
const LOGO_COLORS = [
  "#f8fafc",
  "#dc2626",
  "#2563eb",
  "#facc15",
  "#16a34a",
  "#f8fafc",
  "#fb923c",
  "#2563eb",
  "#facc15",
];

export default function App() {
  const {
    cube,
    counter,
    timer,
    status,
    history,
    animation,
    requestMove,
    onAnimationEnd,
    scramble,
    reset,
  } = useRubikCube();

  // Atajos de teclado
  useKeyboardShortcuts({
    onMove: requestMove,
    onScramble: scramble,
    onReset: reset,
  });

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <svg className="brand-logo" viewBox="0 0 30 30" aria-hidden="true">
            {LOGO_COLORS.map((color, i) => (
              <rect
                key={i}
                x={(i % 3) * 10 + 1}
                y={Math.floor(i / 3) * 10 + 1}
                width="8"
                height="8"
                rx="2"
                fill={color}
              />
            ))}
          </svg>
          <div>
            <h1>Rubik Simulator 3D</h1>
            <p>Patrón Observer · SOLID · TypeScript - Ramirez Nicolás</p>
          </div>
        </div>
        <div className="tags">
          <span className="tag">React</span>
          <span className="tag">Three.js</span>
          <span className="tag">Observer</span>
        </div>
      </header>

      <main className="layout">
        {/* Centro: cubo 3D con cronómetro, estado y acciones encima.
            Va primero en el HTML para que el orden del teclado siga el orden visual
            (la posición en pantalla la define el CSS con grid-area) */}
        <section
          className="viewport area-stage"
          aria-label="Escenario del cubo"
        >
          <Cube3D
            cubies={cube.getCubies()}
            animation={animation}
            onAnimationEnd={onAnimationEnd}
          />
          <div className="hud">
            <Timer timer={timer} />
            <GameStatus status={status} />
          </div>
          <p className="hint">
            Arrastrá para girar la cámara · rueda para acercar
          </p>
          <ActionBar onScramble={scramble} onReset={reset} />
        </section>

        {/* Izquierda: giros de cada cara y atajos del teclado */}
        <aside className="area-left" aria-label="Controles del cubo">
          <section className="panel">
            <h2 className="panel-title">Capas</h2>
            <Controls onMove={requestMove} />
          </section>

          <section className="panel">
            <h2 className="panel-title">Atajos Del Teclado</h2>
            <ul className="shortcuts">
              <li>
                <span>Girar capa</span>
                <span>
                  <kbd>U</kbd> <kbd>D</kbd> <kbd>R</kbd> <kbd>L</kbd>{" "}
                  <kbd>F</kbd> <kbd>B</kbd>
                </span>
              </li>
              <li>
                <span>Sentido inverso</span>
                <span>
                  <kbd>Shift</kbd> + tecla
                </span>
              </li>
              <li>
                <span>Mezclar</span>
                <kbd>S</kbd>
              </li>
              <li>
                <span>Reiniciar</span>
                <kbd>Esc</kbd>
              </li>
            </ul>
          </section>
        </aside>

        {/* Derecha: contador, historial y guía de notación */}
        <aside className="area-right" aria-label="Información de la partida">
          <section className="panel">
            <h2 className="panel-title">Partida</h2>
            <MoveCounter counter={counter} />
          </section>

          <HistoryPanel history={history} />

          <NotationGuide />
        </aside>
      </main>
    </div>
  );
}

import { RubikCube } from "./models/RubikCube";
import { MoveCounterObserver } from "./observers/MoveCounterObserver";
import { TimerObserver } from "./observers/TimerObserver";
import { GameStatusObserver } from "./observers/GameStatusObserver";
import { MoveHistoryObserver } from "./observers/MoveHistoryObserver";
import { ConsoleLogObserver } from "./observers/ConsoleLogObserver";

// Pausa para que el cronómetro marque tiempo visible en la demo
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// El cubo (Subject) y los observers
const cube = new RubikCube();
const counter = new MoveCounterObserver();
const timer = new TimerObserver();
const status = new GameStatusObserver();
const history = new MoveHistoryObserver();
const logger = new ConsoleLogObserver();

// Muestra el estado de los observers después de cada paso
function printState(): void {
    const moves = history.history.join(" ") || "(vacío)";
    console.log(
        `  -> Contador: ${counter.moves} | Estado: ${status.status} | Cronómetro: ${timer.elapsedMs} ms | Historial: ${moves}\n`,
    );
}

// 1) Suscribir los observers: el cubo no sabe qué hace cada uno
console.log("=== Suscripción de observers ===");
cube.subscribe(counter);
cube.subscribe(timer);
cube.subscribe(status);
cube.subscribe(history);
cube.subscribe(logger);

// 2) Cada movimiento notifica automáticamente a todos los observers
console.log("\n=== Movimientos del usuario ===");
for (const move of ["R", "U", "U'", "R'"] as const) {
    cube.applyMove(move);
    printState();
    await sleep(500);
}

// 3) Scramble: un solo evento que reinicia contador, estado, cronómetro e historial
console.log("=== Scramble ===");
cube.scramble(10);
printState();

// 4) Se quita un observer: deja de recibir eventos, el resto sigue igual
console.log("=== Se desuscribe el logger ===");
cube.unsubscribe(logger);
cube.applyMove("F");
printState();

// 5) Reset
console.log("=== Reset ===");
cube.reset();
printState();
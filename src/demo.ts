import { RubikCube } from "./models/RubikCube";
import { MoveCounterObserver } from "./observers/MoveCounterObserver";
import { TimerObserver } from "./observers/TimerObserver";
import { GameStatusObserver } from "./observers/GameStatusObserver";
import { ConsoleLogObserver } from "./observers/ConsoleLogObserver";

const cube = new RubikCube();
const counter = new MoveCounterObserver();
const timer = new TimerObserver();
const status = new GameStatusObserver();
const logger = new ConsoleLogObserver();
// Pausa para que el cronómetro marque tiempo visible en la demo
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Muestra el estado de los observers después de cada paso
function printState(): void {
    console.log(
        `  -> Contador: ${counter.moves} | Estado: ${status.status} | Cronómetro: ${timer.elapsedMs} ms\n`,
    );
}

// 1) Suscribir los observers: el cubo no sabe qué hace cada uno
console.log("=== Suscripción de observers ===");
cube.subscribe(counter);
cube.subscribe(timer);
cube.subscribe(status);
cube.subscribe(logger);

// 2) Un movimiento notifica automáticamente a los cuatro
console.log("\n=== Movimientos del usuario ===");
for (const move of ["R", "U", "U'", "R'"] as const) {
    cube.applyMove(move);
    printState();
    await sleep(500);
}

// 3) Scramble: un solo evento que reinicia contador, estado y cronómetro
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
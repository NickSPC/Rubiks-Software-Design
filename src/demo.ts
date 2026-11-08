import { RubikCube } from "./models/RubikCube";
import { MoveCounterObserver } from "./observers/MoveCounterObserver";
import { TimerObserver } from "./observers/TimerObserver";
import { GameStatusObserver } from "./observers/GameStatusObserver";
import { MoveHistoryObserver } from "./observers/MoveHistoryObserver";
import { ConsoleLogObserver } from "./observers/ConsoleLogObserver";

// Pausa para que el cronómetro marque tiempo visible en la demo
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Cuenta de comprobaciones para el resumen final
let total = 0;
let failed = 0;

// Imprime ✓ o ✗ según se cumpla lo que se esperaba
function check(label: string, condition: boolean): void {
    total++;
    if (!condition) failed++;
    console.log(`  ${condition ? "✓" : "✗"} ${label}`);
}

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
console.log(" 1. Suscripción de observers ");
cube.subscribe(counter);
cube.subscribe(timer);
cube.subscribe(status);
cube.subscribe(history);
cube.subscribe(logger);

// 2) Cada movimiento notifica automáticamente a todos los observers
console.log("\n 2. Movimientos del usuario ");
for (const move of ["R", "U", "U'", "R'"] as const) {
    cube.applyMove(move);
    printState();
    await sleep(500);
}
console.log("Comprobaciones:");
check("El contador marca 4 movimientos", counter.moves === 4);
check('El estado es "solved"', status.status === "solved");
check("El historial es R U U' R'", history.history.join(" ") === "R U U' R'");
check("El cubo quedó resuelto", cube.isSolved());
check("El cronómetro se detuvo al resolver", !timer.isRunning);

// 3) Scramble: un solo evento que reinicia contador, estado, cronómetro e historial
console.log("\n 3. Scramble ");
cube.scramble(10);
printState();
console.log("Comprobaciones:");
check("El contador volvió a 0", counter.moves === 0);
check('El estado volvió a "ready"', status.status === "ready");
check("El historial de movimientos quedó vacío", history.history.length === 0);
check("Se guardó la secuencia de la mezcla (10 movimientos)", history.lastScramble.length === 10);

// 4) Se quita un observer: deja de recibir eventos, el resto sigue igual
console.log("\n 4. Se desuscribe el logger ");
cube.unsubscribe(logger);
cube.applyMove("F");
printState();
console.log("Comprobaciones (El logger ya no imprime nada):");
check("El contador siguió contando (1 movimiento)", counter.moves === 1);
check("El historial siguió registrando (F)", history.history.join(" ") === "F");

// 5) Reset: el cubo y todos los observers vuelven al estado inicial
console.log("\n 5. Reset ");
cube.reset();
printState();
console.log("Comprobaciones:");
check("El cubo está resuelto", cube.isSolved());
check("El contador está en 0", counter.moves === 0);
check('El estado es "ready"', status.status === "ready");
check("El historial está vacío", history.history.length === 0);
check("El cronómetro está en 0", !timer.isRunning && timer.elapsedMs === 0);

// 6) Estado final: R U R' U' repetido 6 veces deja el cubo como estaba
console.log("\n 6. Secuencia R U R' U' repetida 6 veces ");
const sequence = ["R", "U", "R'", "U'"] as const;
const solvedPerRound: boolean[] = [];
for (let round = 1; round <= 6; round++) {
    for (const move of sequence) {
        cube.applyMove(move);
    }
    solvedPerRound.push(cube.isSolved());
    console.log(`  Ronda ${round}: resuelto = ${cube.isSolved()}`);
}
console.log();
printState();
console.log("Comprobaciones del estado final:");
check(
    "El cubo se resuelve recién en la ronda 6",
    solvedPerRound.join() === "false,false,false,false,false,true",
);
check("El cubo quedó resuelto", cube.isSolved());
check('El estado es "solved"', status.status === "solved");
check("El contador marca 24 movimientos", counter.moves === 24);
check("El historial tiene 24 movimientos", history.history.length === 24);
check("El cronómetro está detenido", !timer.isRunning);

// Resumen
console.log(`\n=== Resultado: ${total - failed} de ${total} comprobaciones correctas ===`);
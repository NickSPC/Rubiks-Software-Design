import { afterEach, describe, expect, it, vi } from "vitest";
import { RubikCube } from "../models/RubikCube";
import type { CubeEvent } from "../models/CubeEvent";
import type { Move } from "../models/Move";
import { MoveCounterObserver } from "./MoveCounterObserver";
import { TimerObserver } from "./TimerObserver";
import { GameStatusObserver } from "./GameStatusObserver";
import { MoveHistoryObserver } from "./MoveHistoryObserver";

// Eventos de ejemplo para alimentar a los observers
function moveEvent(move: Move, isSolved = false): CubeEvent {
    return { type: "move", move, isSolved };
}

const scrambleEvent: CubeEvent = { type: "scramble", moves: ["R", "U", "F'"] };
const resetEvent: CubeEvent = { type: "reset" };

describe("MoveCounterObserver", () => {
    it("empieza en 0", () => {
        expect(new MoveCounterObserver().moves).toBe(0);
    });

    it("suma uno por cada movimiento", () => {
        const counter = new MoveCounterObserver();
        counter.update(moveEvent("R"));
        counter.update(moveEvent("U"));
        counter.update(moveEvent("R'"));
        expect(counter.moves).toBe(3);
    });

    it("vuelve a 0 con una mezcla o un reinicio", () => {
        const counter = new MoveCounterObserver();
        counter.update(moveEvent("R"));
        counter.update(scrambleEvent);
        expect(counter.moves).toBe(0);

        counter.update(moveEvent("R"));
        counter.update(resetEvent);
        expect(counter.moves).toBe(0);
    });
});

describe("GameStatusObserver", () => {
    it("empieza en ready", () => {
        expect(new GameStatusObserver().status).toBe("ready");
    });

    it("pasa a playing con un movimiento que no resuelve el cubo", () => {
        const status = new GameStatusObserver();
        status.update(moveEvent("R"));
        expect(status.status).toBe("playing");
    });

    it("pasa a solved cuando el movimiento deja el cubo resuelto", () => {
        const status = new GameStatusObserver();
        status.update(moveEvent("R"));
        status.update(moveEvent("R'", true));
        expect(status.status).toBe("solved");
    });

    it("vuelve a ready con una mezcla o un reinicio", () => {
        const status = new GameStatusObserver();
        status.update(moveEvent("R"));
        status.update(scrambleEvent);
        expect(status.status).toBe("ready");

        status.update(moveEvent("R"));
        status.update(resetEvent);
        expect(status.status).toBe("ready");
    });
});

describe("TimerObserver", () => {
    // Siempre se vuelve al reloj real, aunque una prueba falle
    afterEach(() => {
        vi.useRealTimers();
    });

    it("no corre antes del primer movimiento", () => {
        const timer = new TimerObserver();
        expect(timer.isRunning).toBe(false);
        expect(timer.elapsedMs).toBe(0);
    });

    it("arranca con el primer movimiento y mide el tiempo", () => {
        vi.useFakeTimers();
        vi.setSystemTime(1000);
        const timer = new TimerObserver();

        timer.update(moveEvent("R"));
        vi.setSystemTime(3500);

        expect(timer.isRunning).toBe(true);
        expect(timer.elapsedMs).toBe(2500);
    });

    it("se detiene cuando el cubo queda resuelto", () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
        const timer = new TimerObserver();

        timer.update(moveEvent("R"));
        vi.setSystemTime(4000);
        timer.update(moveEvent("R'", true));
        vi.setSystemTime(9000);

        expect(timer.isRunning).toBe(false);
        expect(timer.elapsedMs).toBe(4000);
    });

    it("se retoma si se mueve el cubo después de resolverlo, sin contar el tiempo en pausa", () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
        const timer = new TimerObserver();

        timer.update(moveEvent("R"));
        vi.setSystemTime(4000);
        timer.update(moveEvent("R'", true));

        // Mientras el cubo está resuelto el reloj queda quieto
        vi.setSystemTime(10000);
        expect(timer.isRunning).toBe(false);
        expect(timer.elapsedMs).toBe(4000);

        // Al mover de nuevo se retoma desde 4000, no desde 10000
        timer.update(moveEvent("F"));
        expect(timer.isRunning).toBe(true);
        vi.setSystemTime(12000);
        expect(timer.elapsedMs).toBe(6000);
    });

    it("se vuelve a pausar al resolver otra vez y suma ambos tramos", () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
        const timer = new TimerObserver();

        timer.update(moveEvent("R"));
        vi.setSystemTime(4000);
        timer.update(moveEvent("R'", true));
        vi.setSystemTime(10000);
        timer.update(moveEvent("F"));
        vi.setSystemTime(12000);
        timer.update(moveEvent("F'", true));
        vi.setSystemTime(20000);

        expect(timer.isRunning).toBe(false);
        expect(timer.elapsedMs).toBe(6000);
    });

    it("se reinicia con una mezcla o un reinicio", () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
        const timer = new TimerObserver();

        timer.update(moveEvent("R"));
        timer.update(scrambleEvent);
        expect(timer.isRunning).toBe(false);
        expect(timer.elapsedMs).toBe(0);

        timer.update(moveEvent("R"));
        timer.update(resetEvent);
        expect(timer.isRunning).toBe(false);
        expect(timer.elapsedMs).toBe(0);
    });
});

describe("MoveHistoryObserver", () => {
    it("guarda los movimientos en orden", () => {
        const history = new MoveHistoryObserver();
        history.update(moveEvent("R"));
        history.update(moveEvent("U'"));
        expect(history.history).toEqual(["R", "U'"]);
    });

    it("una mezcla borra el historial y guarda la secuencia de la mezcla", () => {
        const history = new MoveHistoryObserver();
        history.update(moveEvent("R"));
        history.update(scrambleEvent);
        expect(history.history).toEqual([]);
        expect(history.lastScramble).toEqual(["R", "U", "F'"]);
    });

    it("un reinicio borra el historial y la mezcla", () => {
        const history = new MoveHistoryObserver();
        history.update(scrambleEvent);
        history.update(moveEvent("R"));
        history.update(resetEvent);
        expect(history.history).toEqual([]);
        expect(history.lastScramble).toEqual([]);
    });
});

describe("Todos los observers juntos con el cubo real", () => {
    // Siempre se vuelve al reloj real, aunque una prueba falle
    afterEach(() => {
        vi.useRealTimers();
    });

    it("reaccionan a la vez a cada movimiento, igual que en la demo", () => {
        const cube = new RubikCube();
        const counter = new MoveCounterObserver();
        const status = new GameStatusObserver();
        const history = new MoveHistoryObserver();
        cube.subscribe(counter);
        cube.subscribe(status);
        cube.subscribe(history);

        cube.applyMove("R");
        cube.applyMove("U");
        expect(counter.moves).toBe(2);
        expect(status.status).toBe("playing");

        cube.applyMove("U'");
        cube.applyMove("R'");
        expect(counter.moves).toBe(4);
        expect(status.status).toBe("solved");
        expect(history.history).toEqual(["R", "U", "U'", "R'"]);
    });

    it("el estado y el cronómetro siempre son coherentes entre sí", () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
        const cube = new RubikCube();
        const status = new GameStatusObserver();
        const timer = new TimerObserver();
        cube.subscribe(status);
        cube.subscribe(timer);

        cube.applyMove("R");
        expect(status.status).toBe("playing");
        expect(timer.isRunning).toBe(true);

        cube.applyMove("R'");
        expect(status.status).toBe("solved");
        expect(timer.isRunning).toBe(false);

        // Al mover el cubo resuelto, el estado vuelve a "playing" y el reloj se retoma
        cube.applyMove("U");
        expect(status.status).toBe("playing");
        expect(timer.isRunning).toBe(true);
    });

    it("después de desuscribir un observer, solo los demás siguen avisados", () => {
        const cube = new RubikCube();
        const counter = new MoveCounterObserver();
        const history = new MoveHistoryObserver();
        cube.subscribe(counter);
        cube.subscribe(history);

        cube.applyMove("F");
        cube.unsubscribe(history);
        cube.applyMove("F'");

        expect(counter.moves).toBe(2);
        expect(history.history).toEqual(["F"]);
    });

    it("después de mezclar y reiniciar, todos vuelven a su estado inicial", () => {
        const cube = new RubikCube();
        const counter = new MoveCounterObserver();
        const status = new GameStatusObserver();
        const history = new MoveHistoryObserver();
        cube.subscribe(counter);
        cube.subscribe(status);
        cube.subscribe(history);

        cube.applyMove("R");
        cube.scramble(10);
        expect(history.lastScramble).toHaveLength(10);

        cube.reset();
        expect(counter.moves).toBe(0);
        expect(status.status).toBe("ready");
        expect(history.history).toEqual([]);
        expect(history.lastScramble).toEqual([]);
    });
});
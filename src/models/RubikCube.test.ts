import { describe, expect, it } from "vitest";
import { RubikCube } from "./RubikCube";
import { Cubie } from "./Cubie";
import type { Vec3 } from "./Cubie";
import type { CubeEvent } from "./CubeEvent";
import { FACES } from "./Move";
import type { Move } from "./Move";
import { describeMove } from "./MoveRotation";
import type { Observer } from "../patterns/Observer";

// ---------- Utilidades de las pruebas ----------

// Los 12 movimientos posibles: cada cara en sentido horario y antihorario
const ALL_MOVES: Move[] = FACES.flatMap((face): Move[] => [face, `${face}'`]);

// Busca una pieza por su posición original y devuelve dónde está ahora.
// Se suma 0 a cada valor para normalizar el -0 que puede salir de las rotaciones
function positionOf(cube: RubikCube, home: Vec3): number[] {
    const cubie = cube.getCubies().find((c) => c.home.every((value, k) => value === home[k]));
    if (!cubie) throw new Error(`No existe la pieza ${home.join(",")}`);
    return cubie.position.map((value) => value + 0);
}

// Foto del estado completo del cubo (posición y orientación de cada pieza)
function snapshot(cube: RubikCube): string {
    return JSON.stringify(cube.getCubies().map((c) => [c.position, c.orientation]));
}

function applyAll(cube: RubikCube, moves: readonly Move[]): void {
    for (const move of moves) {
        cube.applyMove(move);
    }
}

// Observer falso que solo guarda los eventos que recibe
class SpyObserver implements Observer<CubeEvent> {
    readonly events: CubeEvent[] = [];

    update(event: CubeEvent): void {
        this.events.push(event);
    }
}

// ---------- Estado inicial ----------

describe("Estado inicial", () => {
    it("tiene 26 piezas: 8 esquinas, 12 aristas y 6 centros", () => {
        const cubies = new RubikCube().getCubies();
        expect(cubies).toHaveLength(26);
        expect(cubies.filter((c) => c.kind === "corner")).toHaveLength(8);
        expect(cubies.filter((c) => c.kind === "edge")).toHaveLength(12);
        expect(cubies.filter((c) => c.kind === "center")).toHaveLength(6);
    });

    it("arranca resuelto", () => {
        expect(new RubikCube().isSolved()).toBe(true);
    });
});

// ---------- Giros ----------

describe("Giros de cada cara", () => {
    for (const face of FACES) {
        it(`cuatro giros de ${face} dejan el cubo resuelto`, () => {
            const cube = new RubikCube();
            applyAll(cube, [face, face, face, face]);
            expect(cube.isSolved()).toBe(true);
        });

        it(`${face} seguido de ${face}' (y al revés) deja el cubo resuelto`, () => {
            const cube = new RubikCube();
            applyAll(cube, [face, `${face}'`]);
            expect(cube.isSolved()).toBe(true);
            applyAll(cube, [`${face}'`, face]);
            expect(cube.isSolved()).toBe(true);
        });
    }

    for (const move of ALL_MOVES) {
        it(`${move} mueve 8 piezas de su capa y deja fijo el centro`, () => {
            const cube = new RubikCube();
            cube.applyMove(move);
            const { axis, layer } = describeMove(move);

            // Piezas que ya no están en su posición original
            const moved = cube
                .getCubies()
                .filter((c) => c.position.some((value, k) => value + 0 !== c.home[k]));
            expect(moved).toHaveLength(8);
            expect(moved.every((c) => c.position[axis] === layer)).toBe(true);

            // El centro de la cara que gira no cambia de lugar
            const center = cube.getCubies().find((c) => c.kind === "center" && c.home[axis] === layer);
            if (!center) throw new Error("No se encontró el centro de la cara");
            expect(center.position.map((value) => value + 0)).toEqual([...center.home]);
        });
    }
});

// ---------- Notación estándar ----------

interface NotationCase {
    move: Move;
    from: Vec3;
    to: Vec3;
    description: string;
}

// Cada caso indica a dónde va una pieza (identificada por su posición original)
// según la notación estándar del cubo: x = derecha, y = arriba, z = frente
const NOTATION_CASES: NotationCase[] = [
    { move: "R", from: [1, 0, 1], to: [1, 1, 0], description: "R sube la arista frente-derecha" },
    { move: "R", from: [1, 1, 0], to: [1, 0, -1], description: "R manda la arista arriba-derecha hacia atrás" },
    { move: "L", from: [-1, 0, 1], to: [-1, -1, 0], description: "L baja la arista frente-izquierda" },
    { move: "L", from: [-1, 1, 0], to: [-1, 0, 1], description: "L trae la arista arriba-izquierda al frente" },
    { move: "U", from: [0, 1, 1], to: [-1, 1, 0], description: "U lleva la arista arriba-frente hacia la izquierda" },
    { move: "U", from: [1, 1, 0], to: [0, 1, 1], description: "U trae la arista arriba-derecha al frente" },
    { move: "D", from: [0, -1, 1], to: [1, -1, 0], description: "D lleva la arista abajo-frente hacia la derecha" },
    { move: "D", from: [-1, -1, 0], to: [0, -1, 1], description: "D trae la arista abajo-izquierda al frente" },
    { move: "F", from: [0, 1, 1], to: [1, 0, 1], description: "F lleva la arista arriba-frente hacia la derecha" },
    { move: "F", from: [1, 0, 1], to: [0, -1, 1], description: "F baja la arista frente-derecha" },
    { move: "B", from: [0, 1, -1], to: [-1, 0, -1], description: "B lleva la arista arriba-atrás hacia la izquierda" },
    { move: "B", from: [-1, 0, -1], to: [0, -1, -1], description: "B baja la arista atrás-izquierda" },
];

describe("Notación estándar en las seis caras", () => {
    for (const { move, from, to, description } of NOTATION_CASES) {
        it(description, () => {
            const cube = new RubikCube();
            cube.applyMove(move);
            expect(positionOf(cube, from)).toEqual(to);
        });
    }

    it("dos giros de una cara coinciden con dos giros inversos", () => {
        const clockwise = new RubikCube();
        applyAll(clockwise, ["R", "R"]);
        const counterClockwise = new RubikCube();
        applyAll(counterClockwise, ["R'", "R'"]);
        expect(snapshot(clockwise)).toBe(snapshot(counterClockwise));
    });
});

// ---------- Animación ----------

describe("La animación coincide con la notación", () => {
    for (const move of ALL_MOVES) {
        it(`la animación de ${move} parte del estado anterior`, () => {
            const cube = new RubikCube();
            // Se parte de un cubo ya movido para que no haya coincidencias por casualidad
            applyAll(cube, ["R", "U'", "F"]);
            const before = cube.getCubies().map((c) => c.position.map((value) => value + 0));

            cube.applyMove(move);
            const { axis, layer, direction } = describeMove(move);
            const opposite: 1 | -1 = direction === 1 ? -1 : 1;

            // Al empezar la animación, la vista gira la capa en sentido contrario
            // al del movimiento. Eso tiene que devolver cada pieza a donde estaba antes
            cube.getCubies().forEach((cubie, index) => {
                let startPosition = cubie.position;
                if (cubie.position[axis] === layer) {
                    const ghost = new Cubie(0, cubie.position);
                    ghost.rotate(axis, opposite);
                    startPosition = ghost.position;
                }
                expect(startPosition.map((value) => value + 0)).toEqual(before[index]);
            });
        });
    }
});

// ---------- Mezcla ----------

describe("Mezcla (scramble)", () => {
    it("envía un único evento con la cantidad de movimientos pedida", () => {
        const cube = new RubikCube();
        const spy = new SpyObserver();
        cube.subscribe(spy);

        cube.scramble(15);

        expect(spy.events).toHaveLength(1);
        const event = spy.events[0];
        if (event.type !== "scramble") throw new Error("Se esperaba un evento scramble");
        expect(event.moves).toHaveLength(15);
    });

    it("usa 20 movimientos por defecto", () => {
        const cube = new RubikCube();
        const spy = new SpyObserver();
        cube.subscribe(spy);

        cube.scramble();

        const event = spy.events[0];
        if (event.type !== "scramble") throw new Error("Se esperaba un evento scramble");
        expect(event.moves).toHaveLength(20);
    });

    it("no repite la misma cara dos veces seguidas", () => {
        const cube = new RubikCube();
        const spy = new SpyObserver();
        cube.subscribe(spy);

        cube.scramble(50);

        const event = spy.events[0];
        if (event.type !== "scramble") throw new Error("Se esperaba un evento scramble");
        for (let i = 1; i < event.moves.length; i++) {
            expect(event.moves[i][0]).not.toBe(event.moves[i - 1][0]);
        }
    });

    it("deja el cubo mezclado", () => {
        const cube = new RubikCube();
        cube.scramble();
        expect(cube.isSolved()).toBe(false);
    });

    it("el estado mezclado se reproduce aplicando los mismos movimientos a un cubo nuevo", () => {
        const cube = new RubikCube();
        const spy = new SpyObserver();
        cube.subscribe(spy);
        cube.scramble(20);

        const event = spy.events[0];
        if (event.type !== "scramble") throw new Error("Se esperaba un evento scramble");

        const replay = new RubikCube();
        applyAll(replay, event.moves);
        expect(snapshot(replay)).toBe(snapshot(cube));
    });
});

// ---------- Reinicio ----------

describe("Reinicio (reset)", () => {
    it("vuelve al estado inicial después de mezclar", () => {
        const cube = new RubikCube();
        cube.scramble();
        cube.reset();
        expect(cube.isSolved()).toBe(true);
        expect(snapshot(cube)).toBe(snapshot(new RubikCube()));
    });

    it("vuelve al estado inicial después de movimientos sueltos", () => {
        const cube = new RubikCube();
        applyAll(cube, ["R", "U", "F'"]);
        cube.reset();
        expect(cube.isSolved()).toBe(true);
    });

    it("envía un evento reset", () => {
        const cube = new RubikCube();
        const spy = new SpyObserver();
        cube.subscribe(spy);

        cube.reset();

        expect(spy.events).toEqual([{ type: "reset" }]);
    });
});

// ---------- Detección de cubo resuelto ----------

describe("Detección de cubo resuelto", () => {
    it("un solo movimiento deja el cubo sin resolver", () => {
        for (const move of ALL_MOVES) {
            const cube = new RubikCube();
            cube.applyMove(move);
            expect(cube.isSolved()).toBe(false);
        }
    });

    it("R U R' U' repetido 6 veces vuelve al estado resuelto, y no antes", () => {
        const cube = new RubikCube();
        const results: boolean[] = [];
        for (let round = 0; round < 6; round++) {
            applyAll(cube, ["R", "U", "R'", "U'"]);
            results.push(cube.isSolved());
        }
        expect(results).toEqual([false, false, false, false, false, true]);
    });

    it("el evento de cada movimiento informa si el cubo quedó resuelto", () => {
        const cube = new RubikCube();
        const spy = new SpyObserver();
        cube.subscribe(spy);

        applyAll(cube, ["R", "R'"]);

        expect(spy.events).toEqual([
            { type: "move", move: "R", isSolved: false },
            { type: "move", move: "R'", isSolved: true },
        ]);
    });
});

// ---------- Patrón Observer ----------

describe("RubikCube como Subject del patrón Observer", () => {
    it("avisa a todos los observers suscritos", () => {
        const cube = new RubikCube();
        const spies = [new SpyObserver(), new SpyObserver(), new SpyObserver()];
        for (const spy of spies) cube.subscribe(spy);

        cube.applyMove("U");

        for (const spy of spies) {
            expect(spy.events).toEqual([{ type: "move", move: "U", isSolved: false }]);
        }
    });

    it("un observer desuscrito deja de recibir eventos y los demás siguen", () => {
        const cube = new RubikCube();
        const staying = new SpyObserver();
        const leaving = new SpyObserver();
        cube.subscribe(staying);
        cube.subscribe(leaving);

        cube.applyMove("R");
        cube.unsubscribe(leaving);
        cube.applyMove("U");

        expect(staying.events).toHaveLength(2);
        expect(leaving.events).toHaveLength(1);
    });

    it("suscribir dos veces el mismo observer no duplica los avisos", () => {
        const cube = new RubikCube();
        const spy = new SpyObserver();
        cube.subscribe(spy);
        cube.subscribe(spy);

        cube.applyMove("F");

        expect(spy.events).toHaveLength(1);
    });

    it("avisa en el orden en que se suscribieron los observers", () => {
        const cube = new RubikCube();
        const order: string[] = [];
        const makeObserver = (name: string): Observer<CubeEvent> => ({
            update: () => {
                order.push(name);
            },
        });
        cube.subscribe(makeObserver("primero"));
        cube.subscribe(makeObserver("segundo"));
        cube.subscribe(makeObserver("tercero"));

        cube.applyMove("D");

        expect(order).toEqual(["primero", "segundo", "tercero"]);
    });

    it("funciona sin ningún observer suscrito", () => {
        const cube = new RubikCube();
        expect(() => cube.applyMove("B")).not.toThrow();
    });
});
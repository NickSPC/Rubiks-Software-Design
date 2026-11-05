import type { Subject } from "../patterns/Subject";
import type { Observer } from "../patterns/Observer";
import type { CubeEvent } from "./CubeEvent";
import { FACES } from "./Move";
import type { Face, Move } from "./Move";
import { describeMove } from "./MoveRotation";
import { Cubie } from "./Cubie";
import type { Vec3 } from "./Cubie";

// Subject del patrón Observer: el modelo del cubo
export class RubikCube implements Subject<CubeEvent> {
    private cubies: Cubie[];
    private observers: Set<Observer<CubeEvent>> = new Set();

    constructor() {
        this.cubies = RubikCube.createCubies();
    }

    // Crea las 26 piezas (se omite la del centro, que no existe físicamente)
    private static createCubies(): Cubie[] {
        const cubies: Cubie[] = [];
        let id = 0;
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    if (x === 0 && y === 0 && z === 0) continue;
                    const home: Vec3 = [x, y, z];
                    cubies.push(new Cubie(id, home));
                    id++;
                }
            }
        }
        return cubies;
    }

    // ---------- Métodos del patrón Observer ----------

    subscribe(observer: Observer<CubeEvent>): void {
        this.observers.add(observer);
    }

    unsubscribe(observer: Observer<CubeEvent>): void {
        this.observers.delete(observer);
    }

    notify(event: CubeEvent): void {
        for (const observer of this.observers) {
            observer.update(event);
        }
    }

    // ---------- Operaciones del cubo ----------

    // Aplica un movimiento del usuario y avisa a los observers
    applyMove(move: Move): void {
        this.rotateLayer(move);
        this.notify({ type: "move", move, isSolved: this.isSolved() });
    }

    // Mezcla el cubo con movimientos aleatorios y envía un único evento
    scramble(length = 20): void {
        const moves: Move[] = [];
        let lastFace: Face | null = null;
        while (moves.length < length) {
            const face = FACES[Math.floor(Math.random() * FACES.length)];
            // Evita repetir la misma cara seguida (se podría cancelar o simplificar)
            if (face === lastFace) continue;
            const move: Move = Math.random() < 0.5 ? face : `${face}'`;
            this.rotateLayer(move);
            moves.push(move);
            lastFace = face;
        }
        this.notify({ type: "scramble", moves });
    }

    // Vuelve al estado inicial
    reset(): void {
        this.cubies = RubikCube.createCubies();
        this.notify({ type: "reset" });
    }

    // El cubo está resuelto si todas las piezas están en su lugar y orientación
    isSolved(): boolean {
        return this.cubies.every((cubie) => cubie.isSolved());
    }

    // Lectura del estado para que la vista 3D pueda dibujarlo
    getCubies(): readonly Cubie[] {
        return this.cubies;
    }

    // ---------- Lógica interna ----------

    // Gira 90° las 9 piezas de la capa de la cara indicada
    private rotateLayer(move: Move): void {
        const { axis, layer, direction } = describeMove(move);
        for (const cubie of this.cubies) {
            if (cubie.position[axis] === layer) {
                cubie.rotate(axis, direction);
            }
        }
    }
}
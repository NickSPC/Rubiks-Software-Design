import type { Observer } from "../patterns/Observer";
import type { CubeEvent } from "../models/CubeEvent";

// ready = listo para empezar, playing = en juego, solved = cubo resuelto
export type GameStatus = "ready" | "playing" | "solved";

// Mantiene el estado actual de la partida
export class GameStatusObserver implements Observer<CubeEvent> {
    private current: GameStatus = "ready";

    update(event: CubeEvent): void {
        if (event.type === "move") {
            this.current = event.isSolved ? "solved" : "playing";
        } else {
            this.current = "ready";
        }
    }

    get status(): GameStatus {
        return this.current;
    }
}
import type { Observer } from "../patterns/Observer";
import type { CubeEvent } from "../models/CubeEvent";
import type { Move } from "../models/Move";

// Guarda el historial de movimientos del usuario y la última mezcla
export class MoveHistoryObserver implements Observer<CubeEvent> {
    private moves: Move[] = [];
    private scrambleMoves: readonly Move[] = [];

    update(event: CubeEvent): void {
        switch (event.type) {
            case "move":
                this.moves.push(event.move);
                break;
            case "scramble":
                // Una mezcla nueva empieza una partida nueva
                this.moves = [];
                this.scrambleMoves = event.moves;
                break;
            case "reset":
                this.moves = [];
                this.scrambleMoves = [];
                break;
        }
    }

    // Movimientos hechos por el usuario desde la última mezcla o reset
    get history(): readonly Move[] {
        return this.moves;
    }

    // Movimientos de la última mezcla
    get lastScramble(): readonly Move[] {
        return this.scrambleMoves;
    }
}
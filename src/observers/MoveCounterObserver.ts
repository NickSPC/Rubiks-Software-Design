import type { Observer } from "../patterns/Observer";
import type { CubeEvent } from "../models/CubeEvent";

// Cuenta los movimientos hechos por el usuario
export class MoveCounterObserver implements Observer<CubeEvent> {
    private count = 0;

    update(event: CubeEvent): void {
        if (event.type === "move") {
            this.count++;
        } else {
            // Un scramble o un reset empiezan una partida nueva
            this.count = 0;
        }
    }

    get moves(): number {
        return this.count;
    }
}
import type { Observer } from "../patterns/Observer";
import type { CubeEvent } from "../models/CubeEvent";

// Mide el tiempo de resolución: arranca en el primer movimiento
// y se detiene cuando el cubo queda resuelto
export class TimerObserver implements Observer<CubeEvent> {
    private startTime: number | null = null;
    private endTime: number | null = null;

    update(event: CubeEvent): void {
        if (event.type !== "move") {
            // Scramble o reset: se reinicia el cronómetro
            this.startTime = null;
            this.endTime = null;
            return;
        }
        if (this.startTime === null) {
            this.startTime = Date.now();
        }
        if (event.isSolved && this.endTime === null) {
            this.endTime = Date.now();
        }
    }

    get isRunning(): boolean {
        return this.startTime !== null && this.endTime === null;
    }

    // Tiempo transcurrido en milisegundos
    get elapsedMs(): number {
        if (this.startTime === null) return 0;
        const end = this.endTime ?? Date.now();
        return end - this.startTime;
    }
}
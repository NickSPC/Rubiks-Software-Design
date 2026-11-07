import type { Observer } from "../patterns/Observer";
import type { CubeEvent } from "../models/CubeEvent";

// Mide el tiempo de resolución: arranca en el primer movimiento, se pausa cuando
// el cubo queda resuelto y se retoma si el usuario vuelve a mover el cubo.
// El tiempo que el cubo estuvo resuelto no se cuenta
export class TimerObserver implements Observer<CubeEvent> {
    // Se puso en marcha al menos una vez desde la última mezcla o reinicio
    private started = false;
    // Tiempo acumulado en los tramos que ya terminaron (milisegundos)
    private accumulatedMs = 0;
    // Momento en que arrancó el tramo actual (null si el reloj está pausado)
    private runningSince: number | null = null;

    update(event: CubeEvent): void {
        // Mezcla o reinicio: partida nueva, el reloj vuelve a cero
        if (event.type !== "move") {
            this.started = false;
            this.accumulatedMs = 0;
            this.runningSince = null;
            return;
        }

        const now = Date.now();

        if (!this.started) {
            // Primer movimiento de la partida
            this.started = true;
            this.runningSince = now;
        } else if (this.runningSince === null && !event.isSolved) {
            // El cubo estaba resuelto y se volvió a mover: se retoma el conteo
            this.runningSince = now;
        }

        if (event.isSolved && this.runningSince !== null) {
            // El cubo quedó resuelto: se cierra el tramo y el reloj se pausa
            this.accumulatedMs += now - this.runningSince;
            this.runningSince = null;
        }
    }

    get isRunning(): boolean {
        return this.runningSince !== null;
    }

    // Tiempo transcurrido en milisegundos
    get elapsedMs(): number {
        if (this.runningSince === null) return this.accumulatedMs;
        return this.accumulatedMs + (Date.now() - this.runningSince);
    }
}
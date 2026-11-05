import type { Observer } from "../patterns/Observer";
import type { CubeEvent } from "../models/CubeEvent";

// Observer extra que imprime cada evento por consola.
// Demuestra el principio Abierto/Cerrado: se agrega un observer nuevo
// sin modificar nada de RubikCube
export class ConsoleLogObserver implements Observer<CubeEvent> {
    update(event: CubeEvent): void {
        switch (event.type) {
            case "move":
                console.log(`  [Log] Movimiento ${event.move} (resuelto: ${event.isSolved})`);
                break;
            case "scramble":
                console.log(`  [Log] Mezcla de ${event.moves.length} movimientos: ${event.moves.join(" ")}`);
                break;
            case "reset":
                console.log("  [Log] Cubo reiniciado");
                break;
        }
    }
}
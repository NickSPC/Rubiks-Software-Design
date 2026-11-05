import type { Observer } from "../patterns/Observer";
import type { CubeEvent } from "../models/CubeEvent";

// Observer que conecta el modelo con React:
// ante cualquier evento del cubo, ejecuta una función que fuerza un nuevo render
export class RefreshObserver implements Observer<CubeEvent> {
    private readonly onChange: () => void;

    constructor(onChange: () => void) {
        this.onChange = onChange;
    }

    update(): void {
        this.onChange();
    }
}
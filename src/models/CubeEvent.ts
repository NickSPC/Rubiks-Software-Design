import type { Move } from "./Move";

// Evento que el cubo (Subject) envía a todos sus observers
export type CubeEvent =
    // El usuario hizo un movimiento; incluye si el cubo quedó resuelto
    | { type: "move"; move: Move; isSolved: boolean }
    // Se mezcló el cubo: un solo evento con todos los movimientos aplicados
    | { type: "scramble"; moves: readonly Move[] }
    // Se restauró el estado inicial
    | { type: "reset" };
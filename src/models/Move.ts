// Las seis caras del cubo en notación estándar:
// U (arriba), D (abajo), R (derecha), L (izquierda), F (frente), B (atrás)
export type Face = "U" | "D" | "R" | "L" | "F" | "B";

// Un movimiento es un giro de una cara:
// "R" es en sentido horario y "R'" en sentido antihorario
export type Move = Face | `${Face}'`;

export const FACES: readonly Face[] = ["U", "D", "R", "L", "F", "B"];
// Vector 3D con coordenadas enteras: cada valor es -1, 0 o 1
export type Vec3 = [number, number, number];

// Gira un vector 90° alrededor de un eje (0 = x, 1 = y, 2 = z).
// direction = 1 es +90° y direction = -1 es -90° (regla de la mano derecha)
function rotateVec(v: Vec3, axis: number, direction: 1 | -1): Vec3 {
    const i = (axis + 1) % 3;
    const j = (axis + 2) % 3;
    const result: Vec3 = [v[0], v[1], v[2]];
    result[i] = -direction * v[j];
    result[j] = direction * v[i];
    return result;
}

// Una pieza del cubo (esquina, arista o centro de cara)
export class Cubie {
    readonly id: number;
    // Posición en el cubo resuelto
    readonly home: Vec3;
    // Posición actual
    private currentPosition: Vec3;
    // Orientación: a dónde apuntan hoy los ejes x, y, z originales de la pieza
    private currentOrientation: Vec3[];

    constructor(id: number, home: Vec3) {
        this.id = id;
        this.home = home;
        this.currentPosition = [home[0], home[1], home[2]];
        this.currentOrientation = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ];
    }

    get position(): Vec3 {
        return this.currentPosition;
    }

    get orientation(): readonly Vec3[] {
        return this.currentOrientation;
    }

    // Cantidad de coordenadas distintas de 0 en la posición original:
    // 1 = centro de cara, 2 = arista, 3 = esquina
    get kind(): "center" | "edge" | "corner" {
        const nonZero = this.home.filter((value) => value !== 0).length;
        if (nonZero === 1) return "center";
        if (nonZero === 2) return "edge";
        return "corner";
    }

    // Gira la pieza 90° alrededor de un eje del cubo (cambia posición y orientación)
    rotate(axis: number, direction: 1 | -1): void {
        this.currentPosition = rotateVec(this.currentPosition, axis, direction);
        this.currentOrientation = this.currentOrientation.map((column) =>
            rotateVec(column, axis, direction),
        );
    }

    // ¿Está la pieza en su lugar y bien orientada?
    // En los centros solo importa la posición, porque girar sobre sí mismos no se nota
    isSolved(): boolean {
        const inPlace = this.currentPosition.every((value, k) => value === this.home[k]);
        if (!inPlace) return false;
        if (this.kind === "center") return true;
        return this.currentOrientation.every((column, k) =>
            column.every((value, m) => value === (k === m ? 1 : 0)),
        );
    }
}
import type { CSSProperties } from "react";
import { FACES } from "../models/Move";
import { FACE_INFO } from "./faceInfo";

// Guía visible para entender las letras y el sentido de los movimientos
export default function NotationGuide() {
  return (
    <section className="panel guide" aria-labelledby="notation-title">
      <h2 className="panel-title" id="notation-title">
        Guía de notación
      </h2>

      <p className="guide-text">
        Cada letra identifica una cara. El giro se interpreta mirando esa cara
        desde afuera del cubo.
      </p>

      <ul className="guide-list">
        {FACES.map((face) => {
          const { name, english, color } = FACE_INFO[face];
          return (
            <li key={face} style={{ "--face-color": color } as CSSProperties}>
              <span className="guide-letter">{face}</span>
              <span className="guide-face-name">{name}</span>
              <span className="guide-english">{english}</span>
            </li>
          );
        })}
      </ul>

      <p className="guide-text">
        <kbd>R</kbd> indica un cuarto de vuelta horario de la cara derecha.
        Cuando la letra lleva apóstrofo, como <kbd>R'</kbd> ("R prima"), el
        giro es antihorario. En esta aplicación, usá <kbd>Shift</kbd> + la letra
        para hacer el giro inverso.
      </p>

      <p className="guide-example">
        <span className="info-label">Ejemplo de secuencia</span>
        <span className="guide-sequence"><kbd>R U R' U'</kbd></span>
        <span className="guide-text">
          Derecha, arriba, derecha al revés y arriba al revés.
        </span>
      </p>
    </section>
  );
}

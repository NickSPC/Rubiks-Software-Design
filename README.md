# Rubik Simulator 3D

Aplicación web interactiva para simular un cubo de Rubik 3×3 en tres dimensiones. Permite girar sus caras, mezclar el cubo y volver al estado resuelto. La interfaz muestra el cronómetro, el estado de la partida, la cantidad de movimientos y el historial.

El proyecto también sirve como ejemplo de separación entre modelo, interfaz y observadores, y de uso del patrón **Observer** junto con principios SOLID.

## Requisitos

- Node.js y npm instalados.

## Instalación y ejecución

Desde la carpeta del proyecto, instalá las dependencias y levantá el servidor de desarrollo:

```bash
npm install
npm run dev
```

Vite muestra en la terminal la dirección local para abrir la aplicación. Para generar una compilación de producción:

```bash
npm run build
npm run preview
```

`npm run build` primero comprueba los tipos de TypeScript y luego genera los archivos de producción en `dist/`.

## Cómo jugar

- Usá los botones del panel **Capas** para girar cualquiera de las seis caras en sentido horario o antihorario.
- También podés usar el teclado:
  - `U`, `D`, `R`, `L`, `F`, `B`: giro horario de la cara correspondiente.
  - `Shift` + una de esas teclas: giro antihorario.
  - `S`: mezclar el cubo.
  - `Esc`: reiniciar el cubo.
- Arrastrá sobre el escenario para girar la cámara y usá la rueda para acercar o alejar.
- Los movimientos se animan en secuencia. Si ingresás varios durante una animación, quedan en cola.

Mezclar inicia una partida nueva y registra la secuencia aplicada. Reiniciar devuelve el cubo a su estado resuelto. El cronómetro comienza con el primer movimiento después de mezclar y se detiene cuando el cubo vuelve a estar resuelto.

## Qué muestra la interfaz

- **Cubo 3D:** las 26 piezas móviles del cubo (esquinas, aristas y centros de cara), con sus stickers y animaciones.
- **Tiempo:** duración de la partida, presentada en minutos, segundos y décimas.
- **Estado:** `Listo`, `En juego` o `¡Resuelto!`.
- **Movimientos:** cantidad de giros realizados desde la última mezcla o reinicio.
- **Historial:** secuencia de la última mezcla y movimientos posteriores del usuario. Se muestran como máximo los últimos 30 movimientos; si hay más, se indica cuántos quedaron ocultos.

La mezcla aplica una secuencia aleatoria de 20 giros por defecto, evitando repetir la misma cara en movimientos consecutivos. En la demostración de consola se puede indicar otra cantidad.

## Arquitectura

La lógica del cubo está separada de React. El modelo mantiene las piezas y calcula sus posiciones y orientaciones; los componentes presentan ese estado. Así, las reglas del cubo se pueden ejecutar también fuera de la interfaz, como en `src/demo.ts`.

### Patrón Observer

`RubikCube` actúa como **Subject**: permite suscribir y desuscribir observadores, y emite eventos cuando hay un movimiento, una mezcla o un reinicio. Los observadores implementan una interfaz común y reaccionan a esos eventos:

- `MoveCounterObserver`: cuenta los movimientos de la partida.
- `TimerObserver`: inicia, actualiza y detiene el cronómetro.
- `GameStatusObserver`: mantiene el estado de la partida.
- `MoveHistoryObserver`: guarda la mezcla y los movimientos posteriores.
- `RefreshObserver`: solicita a React que vuelva a dibujar la interfaz cuando cambia el modelo.
- `ConsoleLogObserver`: registra los eventos en consola; se usa en la demo.

El modelo no depende de esos observadores concretos. Se pueden agregar o quitar suscriptores sin cambiar la lógica de `RubikCube`, lo que demuestra el principio Abierto/Cerrado.

### Modelo y movimientos

- `RubikCube` crea 26 piezas —no hay una pieza central en el interior—, aplica giros de capa, mezcla, reinicia y comprueba si está resuelto.
- `Cubie` representa una pieza y guarda su posición inicial, posición actual y orientación.
- `Move` define los movimientos estándar (`U`, `D`, `R`, `L`, `F`, `B`) y sus variantes inversas con apóstrofo, como `R'`.
- `MoveRotation` traduce la notación de cada giro a un eje, una capa y una dirección de rotación.
- `CubeEvent` define los eventos que emite el modelo.

### Interfaz y animación

`useRubikCube` crea el modelo y sus observadores, los conecta durante el ciclo de vida del componente y administra la cola de animaciones. El modelo aplica el movimiento y `Cube3D` anima visualmente la capa hasta su posición final. `useKeyboardShortcuts` registra los atajos y retira el listener al desmontarse.

`Cube3D` dibuja el escenario con React Three Fiber, Three.js y componentes auxiliares de Drei. `OrbitControls` permite rotar la cámara; el resto de componentes React construye los paneles de controles e información.

## Estructura del proyecto

```text
src/
├── components/   # Interfaz: cubo 3D, controles, cronómetro e información
├── hooks/        # Integración con React y atajos de teclado
├── models/       # Estado, piezas, movimientos y eventos del cubo
├── observers/    # Reacciones a los eventos del modelo
├── patterns/     # Interfaces Subject y Observer
├── App.tsx       # Composición de la pantalla principal
├── App.css       # Estilos de la aplicación
├── index.css     # Estilos globales
├── main.tsx      # Punto de entrada de React
└── demo.ts       # Demostración del modelo y Observer en consola
```

## Demo de consola

El script `src/demo.ts` muestra el patrón Observer sin abrir la aplicación web: aplica movimientos, imprime el contador, el estado y el tiempo, mezcla el cubo, desuscribe el logger y finalmente reinicia el modelo.

```bash
npm run demo
```

## Tecnologías

- **React** y **TypeScript** para la interfaz y el tipado.
- **Vite** para el servidor de desarrollo y la compilación.
- **Three.js**, **React Three Fiber** y **Drei** para el renderizado 3D y los controles de cámara.
- **ESLint** para revisar el código.

Comando de lint:

```bash
npm run lint
```

## Alcance

El proyecto permite manipular y resolver el cubo manualmente. No incluye un algoritmo que encuentre una solución automática ni guarda partidas entre sesiones. La cámara se controla con el mouse; los giros de las caras se hacen con los botones o el teclado.

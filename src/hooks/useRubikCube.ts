import { useCallback, useEffect, useRef, useState } from "react";
import { RubikCube } from "../models/RubikCube";
import type { Move } from "../models/Move";
import { MoveCounterObserver } from "../observers/MoveCounterObserver";
import { TimerObserver } from "../observers/TimerObserver";
import { GameStatusObserver } from "../observers/GameStatusObserver";
import { MoveHistoryObserver } from "../observers/MoveHistoryObserver";
import { RefreshObserver } from "../observers/RefreshObserver";

// Animación en curso: qué movimiento está mostrando la vista
export interface MoveAnimation {
    move: Move;
}

// Hook que crea el cubo y los observers una sola vez y los conecta con React
export function useRubikCube() {
    // El inicializador de useState se ejecuta solo en el primer render
    const [model] = useState(() => ({
        cube: new RubikCube(),
        counter: new MoveCounterObserver(),
        timer: new TimerObserver(),
        status: new GameStatusObserver(),
        history: new MoveHistoryObserver(),
    }));

    // Este número cambia con cada evento del cubo y obliga a React a redibujar
    const [, setVersion] = useState(0);

    // Movimiento que se está animando (null si no hay ninguno)
    const [animation, setAnimation] = useState<MoveAnimation | null>(null);
    // Movimientos que esperan su turno
    const pendingMoves = useRef<Move[]>([]);
    const isAnimating = useRef(false);

    useEffect(() => {
        const { cube, counter, timer, status, history } = model;
        const refresh = new RefreshObserver(() => setVersion((v) => v + 1));

        // Se suscribe al montar el componente.
        // refresh va último, así cuando React redibuja los demás ya se actualizaron
        cube.subscribe(counter);
        cube.subscribe(timer);
        cube.subscribe(status);
        cube.subscribe(history);
        cube.subscribe(refresh);

        // Se desuscribe al desmontar: evita fugas de memoria por referencias activas
        return () => {
            cube.unsubscribe(counter);
            cube.unsubscribe(timer);
            cube.unsubscribe(status);
            cube.unsubscribe(history);
            cube.unsubscribe(refresh);
        };
    }, [model]);

    // Toma el siguiente movimiento de la cola, lo aplica al modelo y lo anima
    const playNext = useCallback(() => {
        const next = pendingMoves.current.shift();
        if (next === undefined) {
            isAnimating.current = false;
            setAnimation(null);
            return;
        }
        isAnimating.current = true;
        model.cube.applyMove(next);
        setAnimation({ move: next });
    }, [model]);

    // Pide un movimiento: si no hay animación en curso arranca, si no queda en la cola
    const requestMove = useCallback(
        (move: Move) => {
            pendingMoves.current.push(move);
            if (!isAnimating.current) {
                playNext();
            }
        },
        [playNext],
    );

    // Descarta la cola y la animación en curso (para Scramble y Reset)
    const cancelAnimation = useCallback(() => {
        pendingMoves.current = [];
        isAnimating.current = false;
        setAnimation(null);
    }, []);

    const scramble = useCallback(() => {
        cancelAnimation();
        model.cube.scramble();
    }, [cancelAnimation, model]);

    const reset = useCallback(() => {
        cancelAnimation();
        model.cube.reset();
    }, [cancelAnimation, model]);

    return {
        ...model,
        animation,
        requestMove,
        // Cuando termina una animación, la vista avisa y se pasa al siguiente movimiento
        onAnimationEnd: playNext,
        scramble,
        reset,
    };
}
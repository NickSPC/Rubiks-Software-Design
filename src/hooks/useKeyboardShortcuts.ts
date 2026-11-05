import { useEffect } from "react";
import { FACES } from "../models/Move";
import type { Face, Move } from "../models/Move";

interface KeyboardShortcutsOptions {
    onMove: (move: Move) => void;
    onScramble: () => void;
    onReset: () => void;
}

// Atajos de teclado: U D R L F B giran una cara (con Shift, al revés),
// S mezcla el cubo y Esc lo reinicia
export function useKeyboardShortcuts({ onMove, onScramble, onReset }: KeyboardShortcutsOptions) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignora la repetición al dejar la tecla apretada y las combinaciones con Ctrl, Alt o Cmd
            if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;

            if (event.key === "Escape") {
                onReset();
                return;
            }

            const key = event.key.toUpperCase();
            if (key === "S") {
                onScramble();
                return;
            }

            if ((FACES as readonly string[]).includes(key)) {
                const face = key as Face;
                onMove(event.shiftKey ? `${face}'` : face);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        // Al desmontar se quita el listener, igual que las suscripciones del cubo
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onMove, onScramble, onReset]);
}
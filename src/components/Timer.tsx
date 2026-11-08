import { useEffect, useState } from "react";
import type { TimerObserver } from "../observers/TimerObserver";

// Convierte milisegundos a formato mm:ss.d (d = décimas de segundo)
function formatTime(ms: number): string {
  const totalTenths = Math.floor(ms / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

interface TimerProps {
  timer: TimerObserver;
}

// Muestra el tiempo de la partida
export default function Timer({ timer }: TimerProps) {
  const [, setTick] = useState(0);
  const isRunning = timer.isRunning;

  // Mientras corre, fuerza un nuevo render cada 100 ms para actualizar el reloj
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="info-card" role="timer">
      <span className="info-label">Tiempo</span>
      <span className="info-value">{formatTime(timer.elapsedMs)}</span>
    </div>
  );
}

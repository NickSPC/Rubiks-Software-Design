import type { Observer } from "./Observer";

export interface Subject<T> {
    subscribe(observer: Observer<T>): void;
    unsubscribe(observer: Observer<T>): void;
    notify(event: T): void;
}
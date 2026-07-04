declare module 'zustand' {
  export type SetState<T> = (
    partial: Partial<T> | ((state: T) => Partial<T>),
    replace?: boolean,
  ) => void;

  export type GetState<T> = () => T;

  export type StateCreator<T> = (set: SetState<T>, get: GetState<T>) => T;

  export interface UseBoundStore<T> {
    (): T;
    <U>(selector: (state: T) => U): U;
    getState: GetState<T>;
    setState: SetState<T>;
  }

  export function create<T>(initializer: StateCreator<T>): UseBoundStore<T>;
  export function create<T>(): (initializer: StateCreator<T>) => UseBoundStore<T>;
}

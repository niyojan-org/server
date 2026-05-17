export interface BaseEvent<T = unknown> {
  event: string;
  payload: T;
  emittedAt: Date;
}

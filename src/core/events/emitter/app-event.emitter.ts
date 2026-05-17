import logger from '@config/logger';

import EventEmitter from 'events';

class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }
  emitEvent<T>(event: string, payload: T): boolean {
    const emittedAt = new Date();
    const traceId = crypto.randomUUID();
    logger.info(
      `Emitting event: ${event} with traceId: ${traceId} to ${this.listenerCount(event)} listeners`,
    );
    return super.emit(event, { traceId, emittedAt, payload });
  }

  onEvent<T>(
    event: string,
    listener: (data: { traceId: string; emittedAt: Date; payload: T }) => void | Promise<void>,
  ) {
    return super.on(event, (data) => {
      const startedAt = performance.now();
      Promise.resolve(listener(data))
        .then(() => {
          logger.info(
            `Listener succeeded for event: ${event} with traceId: ${data.traceId} in ${(performance.now() - startedAt).toFixed(2)}ms`,
          );
        })
        .catch((error) => {
          logger.error(
            `Listener failed for event: ${event} with traceId: ${data.traceId} after ${(performance.now() - startedAt).toFixed(2)}ms`,
            error,
          );
        });
    });
  }
}
const appEventEmitter = new AppEventEmitter();
export default appEventEmitter;

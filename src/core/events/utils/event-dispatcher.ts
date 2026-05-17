import appEventEmitter from '../emitter/app-event.emitter';

export class EventDispatcher {
  static emit<T>(event: string, payload: T) {
    appEventEmitter.emitEvent(event, payload);
  }
}

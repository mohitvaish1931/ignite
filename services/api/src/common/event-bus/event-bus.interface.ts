export const EVENT_BUS = 'EVENT_BUS';

export interface IEventBus {
  emit(event: string, payload: any): void;
  emitAsync(event: string, payload: any): Promise<void>;
}

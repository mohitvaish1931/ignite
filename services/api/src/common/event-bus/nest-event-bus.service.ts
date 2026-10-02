import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IEventBus } from './event-bus.interface';

@Injectable()
export class NestEventBusService implements IEventBus {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit(event: string, payload: any): void {
    this.eventEmitter.emit(event, payload);
  }

  async emitAsync(event: string, payload: any): Promise<void> {
    await this.eventEmitter.emitAsync(event, payload);
  }
}

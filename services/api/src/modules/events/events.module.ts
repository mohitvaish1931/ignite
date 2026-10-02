import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventDomainService } from './event-domain/event-domain.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventDomainService],
  exports: [EventsService, EventDomainService],
})
export class EventsModule {}

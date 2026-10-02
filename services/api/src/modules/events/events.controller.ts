import { Controller, Post, Body, Param, Patch, Get, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, ChangeStateDto } from './dto/event.dto';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { PermissionsGuard } from '../iam/guards/permissions.guard';
import { RequirePermissions } from '../iam/decorators/require-permissions.decorator';
import { CurrentUser } from '../iam/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @RequirePermissions('event.create')
  @ApiOperation({ summary: 'Create a new event' })
  create(@Body() createDto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.createEvent(createDto, user.id, user.organizationId);
  }

  @Patch(':id/state')
  @RequirePermissions('event.publish')
  @ApiOperation({ summary: 'Change event state' })
  changeState(@Param('id') id: string, @Body() changeStateDto: ChangeStateDto, @CurrentUser() user: any) {
    return this.eventsService.changeState(id, changeStateDto, user.id, user.organizationId);
  }

  @Get()
  @RequirePermissions('event.read')
  @ApiOperation({ summary: 'List events' })
  findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.eventsService.findMany(query, { organizationId: user.organizationId });
  }

  @Get(':id')
  @RequirePermissions('event.read')
  @ApiOperation({ summary: 'Get event by id' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.findOne(id, user.organizationId);
  }
}

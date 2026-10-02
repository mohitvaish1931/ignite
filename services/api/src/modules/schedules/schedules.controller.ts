import { Controller, Post, Body, Param, Get, Query, UseGuards } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { PermissionsGuard } from '../iam/guards/permissions.guard';
import { RequirePermissions } from '../iam/decorators/require-permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('events/:eventId/schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @RequirePermissions('schedule.create')
  @ApiOperation({ summary: 'Create a new schedule' })
  create(@Param('eventId') eventId: string, @Body() body: any) {
    return this.schedulesService.create({ ...body, eventId });
  }

  @Post(':scheduleId/sessions')
  @RequirePermissions('schedule.manage')
  @ApiOperation({ summary: 'Add a session to a schedule' })
  addSession(@Param('scheduleId') scheduleId: string, @Body() body: any) {
    return this.schedulesService.addSession(scheduleId, body);
  }

  @Get()
  @RequirePermissions('schedule.read')
  @ApiOperation({ summary: 'List schedules' })
  findAll(@Param('eventId') eventId: string, @Query() query: any) {
    return this.schedulesService.findMany(query, { eventId });
  }
}

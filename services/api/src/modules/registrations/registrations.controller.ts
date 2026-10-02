import { Controller, Post, Body, Param, Get, Query, UseGuards } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { CurrentUser } from '../iam/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events/:eventId/registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Register for an event' })
  register(@Param('eventId') eventId: string, @Body() body: any, @CurrentUser() user: any) {
    return this.registrationsService.registerUser(eventId, user.id, body.answers || []);
  }

  @Get()
  @ApiOperation({ summary: 'List registrations for an event' })
  findAll(@Param('eventId') eventId: string, @Query() query: any) {
    return this.registrationsService.findMany(query, { eventId });
  }
}

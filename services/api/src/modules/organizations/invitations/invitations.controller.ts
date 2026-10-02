import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Organization Invitations')
@Controller({ path: 'organizations', version: '1' })
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post(':orgId/invitations')
  @ApiOperation({ summary: 'Invite a user to an organization' })
  create(@Param('orgId') orgId: string, @Body() dto: CreateInvitationDto) {
    const mockInviterId = undefined;
    return this.invitationsService.createInvitation(orgId, dto, mockInviterId);
  }

  @Get(':orgId/invitations')
  @ApiOperation({ summary: 'List pending invitations for an organization' })
  list(@Param('orgId') orgId: string) {
    return this.invitationsService.listInvitations(orgId);
  }

  @Post('invitations/accept')
  @ApiOperation({ summary: 'Accept an invitation using a token' })
  accept(@Body() dto: AcceptInvitationDto) {
    // Requires authenticated user to accept
    const mockUserId = 'todo-get-from-jwt';
    return this.invitationsService.acceptInvitation(dto, mockUserId);
  }
}

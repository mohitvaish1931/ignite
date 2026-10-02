import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { MembersService } from './members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Organization Members')
@Controller({ path: 'organizations/:orgId/members', version: '1' })
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @ApiOperation({ summary: 'Add a user to an organization' })
  addMember(@Param('orgId') orgId: string, @Body() dto: AddMemberDto) {
    return this.membersService.addMember(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List members of an organization' })
  listMembers(@Param('orgId') orgId: string) {
    return this.membersService.listMembers(orgId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Remove a user from an organization' })
  removeMember(@Param('orgId') orgId: string, @Param('userId') userId: string) {
    return this.membersService.removeMember(orgId, userId);
  }
}

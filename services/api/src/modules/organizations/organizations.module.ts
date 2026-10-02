import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { MembersController } from './members/members.controller';
import { MembersService } from './members/members.service';
import { InvitationsController } from './invitations/invitations.controller';
import { InvitationsService } from './invitations/invitations.service';

@Module({
  controllers: [OrganizationsController, MembersController, InvitationsController],
  providers: [OrganizationsService, MembersService, InvitationsService]
})
export class OrganizationsModule {}

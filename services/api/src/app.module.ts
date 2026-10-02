import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { IamModule } from './modules/iam/iam.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './modules/events/events.module';
import { VenuesModule } from './modules/venues/venues.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { EventBusModule } from './common/event-bus/event-bus.module';
import { QrModule } from './modules/qr/qr.module';
import { CheckInModule } from './modules/check-in/check-in.module';
import { ScannerDeviceModule } from './modules/scanner-device/scanner-device.module';
import { HackathonCoreModule } from './modules/hackathon-core/hackathon-core.module';
import { TeamEngineModule } from './modules/team-engine/team-engine.module';
import { SubmissionEngineModule } from './modules/submission-engine/submission-engine.module';
import { JudgingEngineModule } from './modules/judging-engine/judging-engine.module';

@Module({
  imports: [HealthModule, OrganizationsModule, UsersModule, AuthModule, IamModule, PrismaModule, EventsModule, VenuesModule, SchedulesModule, RegistrationsModule, EventBusModule, QrModule, CheckInModule, ScannerDeviceModule, HackathonCoreModule, TeamEngineModule, SubmissionEngineModule, JudgingEngineModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

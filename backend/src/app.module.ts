import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClinicsModule } from './clinics/clinics.module';
import { DoctorsModule } from './doctors/doctors.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { QueueModule } from './queue/queue.module';
import { StatsModule } from './stats/stats.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ClinicsModule, DoctorsModule, SchedulesModule, AppointmentsModule, QueueModule, StatsModule, ServicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { RidesModule } from './rides/rides.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CommonModule } from './common/common.module';
// import { APP_GUARD } from '@nestjs/core';
// import { RolesGuard } from './common/guards/roles/roles.guard';
import { PassengersModule } from './passengers/passengers.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DriversModule,
    VehiclesModule,
    RidesModule,
    BookingsModule,
    PaymentsModule,
    MessagesModule,
    NotificationsModule,
    ReviewsModule,
    ReportsModule,
    AdminModule,
    AuditLogsModule,
    CommonModule,
    PassengersModule,
  ],
  //  providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: RolesGuard,
  //   },
  // ],
})
export class AppModule {}
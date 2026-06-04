import { Module } from '@nestjs/common';
import { PassengersController } from './passengers.controller';
import { PassengersService } from './passengers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PassengersController],
  providers: [PassengersService],
})
export class PassengersModule {}
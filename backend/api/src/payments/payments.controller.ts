import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';

import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  initialize(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: InitializePaymentDto,
  ) {
    return this.paymentsService.initialize(user.id, dto);
  }

  @Get('my-payments')
  getMyPayments(@CurrentUser() user: CurrentUserType) {
    return this.paymentsService.getMyPayments(user.id);
  }

  @Get(':id')
  getPaymentById(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.paymentsService.getPaymentById(user.id, id);
  }

  @Patch(':id/mock-confirm')
  mockConfirmPayment(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.paymentsService.mockConfirmPayment(user.id, id);
  }
}
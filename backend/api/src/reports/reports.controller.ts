import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { FullyVerifiedGuard } from '../common/guards/fully-verified.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';

import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, FullyVerifiedGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('my-reports')
  getMyReports(@CurrentUser() user: CurrentUserType) {
    return this.reportsService.getMyReports(user.id);
  }

  @Post()
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateReportDto) {
    return this.reportsService.create(user.id, dto);
  }
}
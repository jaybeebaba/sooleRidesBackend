import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { FullyVerifiedGuard } from '../common/guards/fully-verified.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard, FullyVerifiedGuard)
  getMyReviews(@CurrentUser() user: CurrentUserType) {
    return this.reviewsService.getMyReviews(user.id);
  }

  @Get('user/:userId')
  getUserReviews(@Param('userId') userId: string) {
    return this.reviewsService.getUserReviews(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, FullyVerifiedGuard)
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }
}
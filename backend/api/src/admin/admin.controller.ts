import { Controller, Get, Param, Patch, UseGuards, Body } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../common/guards/roles/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';
import { UpdateReportStatusDto } from '../reports/dto/update-report-status.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService,
  ) { }

  @Get('dashboard')
  dashboard(@CurrentUser() user: CurrentUserType) {
    return {
      message: 'Welcome Admin',
      user,
    };
  }

  @Get('stats/revenue')
  getRevenueStats() {
    return this.adminService.getRevenueStats();
  }

  @Get('stats/payments')
  getPaymentStats() {
    return this.adminService.getPaymentStats();
  }
  @Get('stats/bookings')
  getBookingStats() {
    return this.adminService.getBookingStats();
  }
  @Get('stats/rides')
  getRideStats() {
    return this.adminService.getRideStats();
  }

  @Get('stats/users')
  getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get('stats/reports')
  getReportStats() {
    return this.adminService.getReportStats();
  }

  @Get('stats/vehicles')
  getVehicleStats() {
    return this.adminService.getVehicleStats();
  }

  @Get('stats/drivers')
  getDriverStats() {
    return this.adminService.getDriverStats();
  }
  

  @Get('stats/messages')
  getMessageStats() {
    return this.adminService.getMessageStats();
  }
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }
  @Get('users')
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  @Get('users/:id/notifications')
  getUserNotifications(@Param('id') id: string) {
    return this.adminService.getUserNotifications(id);
  }
  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/suspend')
  suspendUser(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.suspendUser(admin.id, id);
  }

  @Patch('users/:id/activate')
  activateUser(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.activateUser(admin.id, id);
  }
  @Get('drivers')
  getAllDrivers() {
    return this.adminService.getAllDrivers();
  }

  @Get('drivers/pending')
  getPendingDrivers() {
    return this.adminService.getPendingDrivers();
  }
  @Get('drivers/:id/vehicles')
  getDriverVehicles(@Param('id') id: string) {
    return this.adminService.getDriverVehicles(id);
  }

  @Get('drivers/:id')
  getDriverById(@Param('id') id: string) {
    return this.adminService.getDriverById(id);
  }


  @Patch('drivers/:id/suspend')
  suspendDriver(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.suspendDriver(admin.id, id);
  }

  @Patch('drivers/:id/unsuspend')
  unsuspendDriver(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.unsuspendDriver(admin.id, id);
  }

  @Patch('drivers/:id/approve')
  approveDriver(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.approveDriver(admin.id, id);
  }

  @Patch('drivers/:id/reject')
  rejectDriver(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.rejectDriver(admin.id, id);
  }


  @Get('vehicles')
  getAllVehicles() {
    return this.adminService.getAllVehicles();
  }

  @Get('vehicles/pending')
  getPendingVehicles() {
    return this.adminService.getPendingVehicles();
  }

  @Get('vehicles/:id')
  getVehicleById(@Param('id') id: string) {
    return this.adminService.getVehicleById(id);
  }

  @Patch('vehicles/:id/approve')
  approveVehicle(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.approveVehicle(admin.id, id);
  }

  @Patch('vehicles/:id/reject')
  rejectVehicle(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.rejectVehicle(admin.id, id);
  }

  @Patch('vehicles/:id/suspend')
  suspendVehicle(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.suspendVehicle(admin.id, id);
  }

  @Patch('vehicles/:id/unsuspend')
  unsuspendVehicle(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.unsuspendVehicle(admin.id, id);
  }

  @Get('reports')
  getAllReports() {
    return this.adminService.getAllReports();
  }

  @Patch('reports/:id/resolve')
  resolveReport(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.resolveReport(admin.id, id);
  }

  @Get('reports/:id')
  getReportById(@Param('id') id: string) {
    return this.adminService.getReportById(id);
  }

  @Patch('reports/:id/status')
  updateReportStatus(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.adminService.updateReportStatus(admin.id, id, dto.status);
  }

  @Get('bookings')
  getAllBookings() {
    return this.adminService.getAllBookings();
  }

  @Get('bookings/:id')
  getBookingById(@Param('id') id: string) {
    return this.adminService.getBookingById(id);
  }

  @Get('payments')
  getAllPayments() {
    return this.adminService.getAllPayments();
  }

  @Get('payments/:id')
  getPaymentById(@Param('id') id: string) {
    return this.adminService.getPaymentById(id);
  }

  @Get('rides')
  getAllRides() {
    return this.adminService.getAllRides();
  }

  @Get('rides/:id')
  getRideById(@Param('id') id: string) {
    return this.adminService.getRideById(id);
  }

  @Patch('rides/:id/remove')
  removeRide(
    @CurrentUser() admin: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.adminService.removeRide(admin.id, id);
  }

  @Get('conversations')
  getAllConversations() {
    return this.adminService.getAllConversations();
  }

  @Get('conversations/:id/messages')
  getConversationMessages(@Param('id') id: string) {
    return this.adminService.getConversationMessages(id);
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('audit-logs/:id')
  getAuditLogById(@Param('id') id: string) {
    return this.adminService.getAuditLogById(id);
  }

}
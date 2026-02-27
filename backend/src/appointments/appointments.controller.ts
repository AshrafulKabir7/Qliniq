import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentStatus, AppointmentSource } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) { }

    @Post()
    async create(@Body() createDto: any, @Request() req: any) {
        return this.appointmentsService.create({
            ...createDto,
            tenant_id: req.user.tenantId,
            patient_user_id: req.user.userId,
            appointment_date: new Date(createDto.appointment_date),
            source: AppointmentSource.MOBILE
        });
    }

    @Get('today')
    async findToday(@Query('clinicId') clinicId: string, @Request() req: any) {
        return this.appointmentsService.findTodayByClinic(clinicId, req.user.tenantId);
    }

    @Get('my')
    async findMyAppointments(@Request() req: any) {
        return this.appointmentsService.findByPatient(req.user.userId, req.user.tenantId);
    }

    @Get()
    async findAll(@Query('date') date: string, @Query('doctorUserId') doctorId: string, @Request() req: any) {
        return this.appointmentsService.findByDate(date, doctorId, req.user.tenantId);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: AppointmentStatus, @Request() req: any) {
        return this.appointmentsService.updateStatus(id, status, req.user.tenantId);
    }

    @Post(':id/check-in')
    async checkIn(@Param('id') id: string, @Request() req: any) {
        return this.appointmentsService.checkIn(id, req.user.tenantId);
    }
}

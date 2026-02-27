import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
    constructor(private readonly schedulesService: SchedulesService) { }

    @Get()
    async findAll(
        @Query('clinicId') clinicId: string,
        @Query('doctorId') doctorId: string,
        @Request() req: any
    ) {
        if (doctorId) {
            return this.schedulesService.findByDoctor(doctorId, clinicId, req.user.tenantId);
        }
        return this.schedulesService.findByClinic(clinicId, req.user.tenantId);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Post()
    async create(@Body() body: any, @Request() req: any) {
        return this.schedulesService.create({
            tenant_id: req.user.tenantId,
            clinic_id: body.clinic_id,
            doctor_user_id: body.doctor_user_id,
            day_of_week: body.day_of_week,
            start_time: body.start_time,
            end_time: body.end_time,
            slot_duration_min: body.slot_duration_min || 15,
            max_tokens_per_slot: body.max_tokens_per_slot || 1,
        });
    }

    @UseGuards(RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req: any) {
        return this.schedulesService.remove(id, req.user.tenantId);
    }
}

import { Controller, Get, Post, Query, Param, Body, UseGuards, Request } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('doctors')
export class DoctorsController {
    constructor(private readonly doctorsService: DoctorsService) { }

    @Get()
    async findAll(@Query('clinicId') clinicId: string, @Request() req: any) {
        return this.doctorsService.findAllByClinic(clinicId, req.user.tenantId);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Post()
    async create(@Body() body: any, @Request() req: any) {
        return this.doctorsService.createDoctor({
            tenant_id: req.user.tenantId,
            clinic_id: body.clinic_id,
            name: body.name,
            email: body.email,
            password: body.password,
            phone: body.phone,
            specialty: body.specialty,
            room_no: body.room_no,
            fee: body.fee,
            average_consultation_time: body.average_consultation_time,
        });
    }

    @Get(':id/availability')
    async findAvailability(
        @Param('id') doctorId: string,
        @Query('date') date: string,
        @Request() req: any
    ) {
        return this.doctorsService.findAvailability(doctorId, date, req.user.tenantId);
    }
}

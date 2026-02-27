import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clinics')
export class ClinicsController {
    constructor(private readonly clinicsService: ClinicsService) { }

    @Get()
    async findAll(@Request() req: any) {
        return this.clinicsService.findAll(req.user.tenantId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req: any) {
        return this.clinicsService.findById(id, req.user.tenantId);
    }

    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Post()
    async create(@Body() createClinicDto: any, @Request() req: any) {
        return this.clinicsService.create({
            ...createClinicDto,
            tenant_id: req.user.tenantId,
        });
    }

    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.clinicsService.update(id, req.user.tenantId, body);
    }
}

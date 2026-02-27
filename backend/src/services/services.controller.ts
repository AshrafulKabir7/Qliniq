import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get()
    async findAll(@Query('clinicId') clinicId: string, @Request() req: any) {
        return this.servicesService.findByClinic(clinicId, req.user.tenantId);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Post()
    async create(@Body() body: any, @Request() req: any) {
        return this.servicesService.create({
            tenant_id: req.user.tenantId,
            clinic_id: body.clinic_id,
            name: body.name,
            duration_min: body.duration_min || 15,
        });
    }

    @UseGuards(RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.servicesService.update(id, body);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.servicesService.remove(id);
    }
}

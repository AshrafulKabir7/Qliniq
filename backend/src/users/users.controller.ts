import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Get()
    async findAll(@Request() req: any) {
        return this.usersService.findAll(req.user.tenantId);
    }

    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Post()
    async create(@Body() body: any, @Request() req: any) {
        return this.usersService.createUser({
            tenant_id: req.user.tenantId,
            name: body.name,
            email: body.email,
            phone: body.phone,
            role: body.role,
            password_hash: body.password,
        });
    }

    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.usersService.update(id, req.user.tenantId, body);
    }

    @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req: any) {
        return this.usersService.remove(id, req.user.tenantId);
    }
}

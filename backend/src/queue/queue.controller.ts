import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenStatus, TokenPriority } from '@prisma/client';

@Controller('queue/tokens')
export class QueueController {
    constructor(private readonly queueService: QueueService) { }

    // Public endpoint for Kiosk display - no auth required
    @Get('public')
    async getPublicQueue(@Query('clinicId') clinicId: string) {
        return this.queueService.getPublicTodayQueue(clinicId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createToken(@Body() createDto: any, @Request() req: any) {
        return this.queueService.createToken({
            ...createDto,
            tenant_id: req.user.tenantId,
            queue_date: new Date(createDto.queue_date),
            priority: createDto.priority || TokenPriority.NORMAL
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('walk-in')
    async createWalkInToken(@Body() body: any, @Request() req: any) {
        return this.queueService.createWalkInToken({
            tenant_id: req.user.tenantId,
            clinic_id: body.clinic_id,
            doctor_user_id: body.doctor_user_id,
            patient_name: body.patient_name,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('today')
    async getTodayQueue(@Query('clinicId') clinicId: string, @Request() req: any) {
        return this.queueService.getTodayQueue(clinicId, req.user.tenantId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getQueue(@Query('clinicId') clinicId: string, @Query('doctorUserId') doctorId: string, @Query('date') date: string) {
        return this.queueService.getQueue(clinicId, doctorId, date);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/call')
    async callToken(@Param('id') id: string, @Request() req: any) {
        return this.queueService.callToken(id, req.user.tenantId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async updateTokenStatus(@Param('id') id: string, @Body('status') status: TokenStatus, @Request() req: any) {
        return this.queueService.updateTokenStatus(id, status, req.user.tenantId);
    }
}

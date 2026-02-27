import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueGateway } from './queue/queue.gateway';
import { Prisma, TokenStatus, TokenPriority } from '@prisma/client';

@Injectable()
export class QueueService {
    constructor(
        private prisma: PrismaService,
        private queueGateway: QueueGateway
    ) { }

    async createToken(data: Prisma.QueueTokenUncheckedCreateInput) {
        const count = await this.prisma.queueToken.count({
            where: {
                doctor_user_id: data.doctor_user_id,
                queue_date: data.queue_date
            }
        });

        const token = await this.prisma.queueToken.create({
            data: {
                ...data,
                token_number: count + 1,
                status: TokenStatus.WAITING,
                estimated_wait_time_mins: (count) * 15
            },
            include: {
                doctor: { select: { name: true } },
                appointment: { include: { patient: { select: { name: true, phone: true } } } }
            }
        });

        this.queueGateway.broadcastTokenCreated(token.clinic_id, token);
        return token;
    }

    async createWalkInToken(data: { tenant_id: string; clinic_id: string; doctor_user_id: string; patient_name?: string }) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await this.prisma.queueToken.count({
            where: {
                doctor_user_id: data.doctor_user_id,
                queue_date: today
            }
        });

        const token = await this.prisma.queueToken.create({
            data: {
                tenant_id: data.tenant_id,
                clinic_id: data.clinic_id,
                doctor_user_id: data.doctor_user_id,
                queue_date: today,
                token_number: count + 1,
                status: TokenStatus.WAITING,
                priority: TokenPriority.NORMAL,
                estimated_wait_time_mins: count * 15,
            },
            include: {
                doctor: { select: { name: true } },
            }
        });

        this.queueGateway.broadcastTokenCreated(token.clinic_id, token);
        return { ...token, patient_name: data.patient_name || 'Walk-in Patient' };
    }

    async getTodayQueue(clinicId: string, tenantId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.prisma.queueToken.findMany({
            where: {
                clinic_id: clinicId,
                tenant_id: tenantId,
                queue_date: { gte: today, lt: tomorrow }
            },
            include: {
                doctor: { select: { name: true, doctorProfile: { select: { room_no: true, specialty: true } } } },
                appointment: { include: { patient: { select: { name: true, phone: true } } } }
            },
            orderBy: { token_number: 'asc' }
        });
    }

    async getPublicTodayQueue(clinicId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.prisma.queueToken.findMany({
            where: {
                clinic_id: clinicId,
                queue_date: { gte: today, lt: tomorrow },
                status: { in: [TokenStatus.WAITING, TokenStatus.CALLED, TokenStatus.IN_SERVICE] }
            },
            include: {
                doctor: { select: { name: true, doctorProfile: { select: { room_no: true } } } },
            },
            orderBy: { token_number: 'asc' }
        });
    }

    async getQueue(clinicId: string, doctorId: string, date: string) {
        return this.prisma.queueToken.findMany({
            where: {
                clinic_id: clinicId,
                doctor_user_id: doctorId,
                queue_date: new Date(date)
            },
            orderBy: { token_number: 'asc' }
        });
    }

    async callToken(id: string, tenantId: string) {
        const token = await this.prisma.queueToken.update({
            where: { id },
            data: { status: TokenStatus.CALLED, called_at: new Date() },
            include: {
                doctor: { select: { name: true, doctorProfile: { select: { room_no: true } } } },
                appointment: { include: { patient: { select: { name: true } } } }
            }
        });

        this.queueGateway.broadcastTokenCalled(token.clinic_id, token);
        return token;
    }

    async updateTokenStatus(id: string, status: TokenStatus, tenantId: string) {
        const updateData: any = { status };
        if (status === TokenStatus.IN_SERVICE) updateData.served_at = new Date();
        if (status === TokenStatus.DONE || status === TokenStatus.SKIPPED) updateData.ended_at = new Date();

        const token = await this.prisma.queueToken.update({
            where: { id },
            data: updateData,
            include: {
                doctor: { select: { name: true, doctorProfile: { select: { room_no: true } } } },
                appointment: { include: { patient: { select: { name: true } } } }
            }
        });

        this.queueGateway.broadcastTokenUpdated(token.clinic_id, token);
        return token;
    }
}

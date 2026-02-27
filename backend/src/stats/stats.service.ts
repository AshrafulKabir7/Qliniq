import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus, TokenStatus } from '@prisma/client';

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats(tenantId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [totalAppointments, waitingCount, noShowCount, doneTokens, activeDoctors] =
            await Promise.all([
                // Total appointments today
                this.prisma.appointment.count({
                    where: {
                        tenant_id: tenantId,
                        appointment_date: { gte: today, lt: tomorrow },
                    },
                }),
                // Currently waiting tokens
                this.prisma.queueToken.count({
                    where: {
                        tenant_id: tenantId,
                        queue_date: { gte: today, lt: tomorrow },
                        status: TokenStatus.WAITING,
                    },
                }),
                // No-show appointments today
                this.prisma.appointment.count({
                    where: {
                        tenant_id: tenantId,
                        appointment_date: { gte: today, lt: tomorrow },
                        status: AppointmentStatus.NO_SHOW,
                    },
                }),
                // Done tokens for avg wait time calculation
                this.prisma.queueToken.findMany({
                    where: {
                        tenant_id: tenantId,
                        queue_date: { gte: today, lt: tomorrow },
                        status: TokenStatus.DONE,
                        called_at: { not: null },
                    },
                    select: { created_at: true, called_at: true },
                }),
                // Active doctors with profiles
                this.prisma.doctorProfile.findMany({
                    where: { clinic: { tenant_id: tenantId } },
                    include: {
                        user: { select: { id: true, name: true, email: true, status: true } },
                        clinic: { select: { id: true, name: true } },
                    },
                }),
            ]);

        // Calculate average wait time in minutes
        let avgWaitTime = 0;
        if (doneTokens.length > 0) {
            const totalWait = doneTokens.reduce((sum, t) => {
                if (t.called_at) {
                    return sum + (t.called_at.getTime() - t.created_at.getTime()) / 60000;
                }
                return sum;
            }, 0);
            avgWaitTime = Math.round(totalWait / doneTokens.length);
        }

        return {
            totalAppointments,
            waitingCount,
            avgWaitTime,
            noShowCount,
            activeDoctors: activeDoctors.map((dp) => ({
                userId: dp.user_id,
                name: dp.user.name,
                email: dp.user.email,
                specialty: dp.specialty,
                roomNo: dp.room_no,
                clinicId: dp.clinic_id,
                clinicName: dp.clinic.name,
            })),
        };
    }
}

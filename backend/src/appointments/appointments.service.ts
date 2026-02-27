import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Appointment, AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.AppointmentUncheckedCreateInput): Promise<Appointment> {
        return this.prisma.appointment.create({ data });
    }

    async findTodayByClinic(clinicId: string, tenantId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.prisma.appointment.findMany({
            where: {
                clinic_id: clinicId,
                tenant_id: tenantId,
                appointment_date: { gte: today, lt: tomorrow },
            },
            include: {
                patient: { select: { name: true, phone: true, email: true } },
                doctor: { select: { name: true } },
                service: { select: { name: true } }
            },
            orderBy: { slot_start: 'asc' }
        });
    }

    async findByDate(date: string, doctorUserId: string, tenantId: string): Promise<Appointment[]> {
        return this.prisma.appointment.findMany({
            where: {
                appointment_date: new Date(date),
                doctor_user_id: doctorUserId,
                tenant_id: tenantId
            },
            include: {
                patient: { select: { name: true, phone: true } }
            }
        });
    }

    async findByPatient(patientUserId: string, tenantId: string) {
        return this.prisma.appointment.findMany({
            where: {
                patient_user_id: patientUserId,
                tenant_id: tenantId,
            },
            include: {
                doctor: { select: { name: true } },
                clinic: { select: { name: true } },
                service: { select: { name: true } }
            },
            orderBy: { appointment_date: 'desc' }
        });
    }

    async updateStatus(id: string, status: AppointmentStatus, tenantId: string) {
        return this.prisma.appointment.update({
            where: { id },
            data: { status }
        });
    }

    async checkIn(id: string, tenantId: string) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id, tenant_id: tenantId }
        });
        if (!appointment) throw new Error("Appointment not found");

        return this.prisma.appointment.update({
            where: { id },
            data: {
                status: AppointmentStatus.CONFIRMED,
                check_in_time: new Date()
            }
        });
    }
}

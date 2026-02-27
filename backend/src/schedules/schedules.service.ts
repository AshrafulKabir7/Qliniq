import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SchedulesService {
    constructor(private prisma: PrismaService) { }

    async findByDoctor(doctorUserId: string, clinicId: string, tenantId: string) {
        return this.prisma.doctorSchedule.findMany({
            where: {
                doctor_user_id: doctorUserId,
                clinic_id: clinicId,
                tenant_id: tenantId,
            },
            orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }]
        });
    }

    async findByClinic(clinicId: string, tenantId: string) {
        return this.prisma.doctorSchedule.findMany({
            where: { clinic_id: clinicId, tenant_id: tenantId },
            include: {
                doctor: { select: { name: true, doctorProfile: { select: { specialty: true } } } }
            },
            orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }]
        });
    }

    async create(data: Prisma.DoctorScheduleUncheckedCreateInput) {
        return this.prisma.doctorSchedule.create({ data });
    }

    async remove(id: string, tenantId: string) {
        return this.prisma.doctorSchedule.delete({
            where: { id },
        });
    }
}

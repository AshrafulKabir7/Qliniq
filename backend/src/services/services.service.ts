import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
    constructor(private prisma: PrismaService) { }

    async findByClinic(clinicId: string, tenantId: string) {
        return this.prisma.service.findMany({
            where: { clinic_id: clinicId, tenant_id: tenantId, status: 'ACTIVE' },
            orderBy: { name: 'asc' }
        });
    }

    async create(data: Prisma.ServiceUncheckedCreateInput) {
        return this.prisma.service.create({ data });
    }

    async update(id: string, data: { name?: string; duration_min?: number; status?: string }) {
        return this.prisma.service.update({ where: { id }, data });
    }

    async remove(id: string) {
        return this.prisma.service.update({ where: { id }, data: { status: 'INACTIVE' } });
    }
}

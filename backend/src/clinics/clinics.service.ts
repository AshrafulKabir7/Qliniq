import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Clinic, Prisma } from '@prisma/client';

@Injectable()
export class ClinicsService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId: string): Promise<Clinic[]> {
        return this.prisma.clinic.findMany({
            where: { tenant_id: tenantId },
        });
    }

    async create(data: Prisma.ClinicUncheckedCreateInput): Promise<Clinic> {
        return this.prisma.clinic.create({ data });
    }

    async findById(id: string, tenantId: string): Promise<Clinic | null> {
        return this.prisma.clinic.findFirst({
            where: { id, tenant_id: tenantId },
        });
    }

    async update(id: string, tenantId: string, data: { name?: string; address?: string; phone?: string; timezone?: string }) {
        return this.prisma.clinic.update({
            where: { id },
            data,
        });
    }
}

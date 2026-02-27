import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async createUser(data: Prisma.UserUncheckedCreateInput): Promise<User> {
        if (data.password_hash) {
            data.password_hash = await bcrypt.hash(data.password_hash, 10);
        }
        return this.prisma.user.create({ data });
    }

    async findAll(tenantId: string) {
        return this.prisma.user.findMany({
            where: { tenant_id: tenantId },
            select: {
                id: true, name: true, email: true, phone: true,
                role: true, status: true, created_at: true,
                doctorProfile: { select: { specialty: true, room_no: true, clinic: { select: { name: true } } } },
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findByPhone(phone: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { phone } });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async update(id: string, tenantId: string, data: { name?: string; email?: string; phone?: string; role?: Role; status?: string }) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, tenantId: string) {
        return this.prisma.user.update({
            where: { id },
            data: { status: 'INACTIVE' },
        });
    }

    async registerPatient(data: { name: string; email: string; password: string; phone?: string }, tenantId: string) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                tenant_id: tenantId,
                role: Role.PATIENT,
                name: data.name,
                email: data.email,
                phone: data.phone,
                password_hash: hashedPassword,
                patientProfile: { create: {} },
            },
        });
    }

    async setupSuperAdmin() {
        const adminExists = await this.prisma.user.findFirst({
            where: { role: Role.SUPER_ADMIN }
        });

        if (!adminExists) {
            const tenant = await this.prisma.tenant.create({
                data: { name: 'Super Admin Tenant', plan: 'ENTERPRISE' }
            });

            const hashedPassword = await bcrypt.hash('admin123', 10);
            return this.prisma.user.create({
                data: {
                    tenant_id: tenant.id,
                    role: Role.SUPER_ADMIN,
                    name: 'Super Admin',
                    email: 'admin@clinic.local',
                    password_hash: hashedPassword
                }
            });
        }
    }
}

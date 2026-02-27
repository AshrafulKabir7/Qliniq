import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorsService {
    constructor(private prisma: PrismaService) { }

    async findAllByClinic(clinicId: string, tenantId: string) {
        return this.prisma.doctorProfile.findMany({
            where: {
                clinic_id: clinicId,
                clinic: { tenant_id: tenantId }
            },
            include: {
                user: { select: { id: true, name: true, phone: true, email: true, status: true } }
            }
        });
    }

    async createDoctor(data: {
        tenant_id: string; clinic_id: string; name: string; email: string;
        password: string; phone?: string; specialty?: string; room_no?: string;
        fee?: number; average_consultation_time?: number;
    }) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                tenant_id: data.tenant_id,
                role: Role.DOCTOR,
                name: data.name,
                email: data.email,
                phone: data.phone,
                password_hash: hashedPassword,
                doctorProfile: {
                    create: {
                        clinic_id: data.clinic_id,
                        specialty: data.specialty,
                        room_no: data.room_no,
                        fee: data.fee || 0,
                        average_consultation_time: data.average_consultation_time || 15,
                    }
                }
            },
            include: {
                doctorProfile: { include: { clinic: { select: { name: true } } } }
            }
        });
    }

    async findAvailability(doctorId: string, date: string, tenantId: string) {
        const queryDate = new Date(date);
        const dayOfWeek = queryDate.getDay();

        // Get doctor's schedule for this day of week
        const schedules = await this.prisma.doctorSchedule.findMany({
            where: {
                doctor_user_id: doctorId,
                day_of_week: dayOfWeek,
                tenant_id: tenantId,
            }
        });

        if (schedules.length === 0) {
            return { doctorId, date, availableSlots: [], message: 'No schedule set for this day' };
        }

        // Check for time off
        const timeOff = await this.prisma.doctorTimeOff.findFirst({
            where: {
                doctor_user_id: doctorId,
                date: queryDate,
            }
        });

        if (timeOff) {
            return { doctorId, date, availableSlots: [], message: 'Doctor is on leave' };
        }

        // Get booked appointments for this date
        const booked = await this.prisma.appointment.findMany({
            where: {
                doctor_user_id: doctorId,
                appointment_date: queryDate,
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            select: { slot_start: true, slot_end: true }
        });

        const bookedSlots = new Set(booked.map(a => a.slot_start));

        // Generate available slots
        const allSlots: { start: string; end: string; available: boolean }[] = [];
        for (const schedule of schedules) {
            const [startH, startM] = schedule.start_time.split(':').map(Number);
            const [endH, endM] = schedule.end_time.split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            const duration = schedule.slot_duration_min;

            for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
                const slotStart = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
                const slotEnd = `${String(Math.floor((m + duration) / 60)).padStart(2, '0')}:${String((m + duration) % 60).padStart(2, '0')}`;
                allSlots.push({ start: slotStart, end: slotEnd, available: !bookedSlots.has(slotStart) });
            }
        }

        return { doctorId, date, availableSlots: allSlots };
    }
}

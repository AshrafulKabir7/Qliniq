import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding demo data...');

    // 1. Get the existing Super Admin Tenant
    const superAdmin = await prisma.user.findFirst({
        where: { role: Role.SUPER_ADMIN },
        include: { tenant: true },
    });

    if (!superAdmin) {
        console.error('Super Admin not found. Please start the backend server once to auto-generate the super admin before running this script.');
        process.exit(1);
    }

    const tenantId = superAdmin.tenant_id;
    const passwordHash = await bcrypt.hash('demo123', 10);

    // 2. Create a Demo Clinic
    const clinic = await prisma.clinic.create({
        data: {
            tenant_id: tenantId,
            name: 'City Central Clinic',
            address: '123 Health Ave, Metropolis',
            phone: '+1-555-0100',
        },
    });
    console.log(`Created Clinic: ${clinic.name} (ID: ${clinic.id})`);

    // 3. Create a Clinic Admin
    const admin = await prisma.user.create({
        data: {
            tenant_id: tenantId,
            role: Role.CLINIC_ADMIN,
            name: 'Alice Admin',
            email: 'admin@cityclinic.local',
            password_hash: passwordHash,
        },
    });
    console.log(`Created Clinic Admin: ${admin.email} / demo123`);

    // 4. Create a Receptionist
    const receptionist = await prisma.user.create({
        data: {
            tenant_id: tenantId,
            role: Role.RECEPTIONIST,
            name: 'Rachel Receptionist',
            email: 'reception@cityclinic.local',
            password_hash: passwordHash,
        },
    });
    console.log(`Created Receptionist: ${receptionist.email} / demo123`);

    // 5. Create a Doctor
    const doctor = await prisma.user.create({
        data: {
            tenant_id: tenantId,
            role: Role.DOCTOR,
            name: 'Dr. Gregory House',
            email: 'dr.house@cityclinic.local',
            password_hash: passwordHash,
            doctorProfile: {
                create: {
                    clinic_id: clinic.id,
                    specialty: 'Internal Medicine',
                    room_no: 'A-101',
                    fee: 150.00,
                    average_consultation_time: 15, // 15 minutes
                },
            },
        },
    });
    console.log(`Created Doctor: ${doctor.email} / demo123`);

    // 6. Create a Patient
    const patient = await prisma.user.create({
        data: {
            tenant_id: tenantId,
            role: Role.PATIENT,
            name: 'John Doe',
            phone: '+15559998888',
            email: 'patient@demo.local',
            password_hash: passwordHash,
            patientProfile: {
                create: {
                    gender: 'Male',
                    dob: new Date('1990-01-01'),
                },
            },
        },
    });
    console.log(`Created Patient: ${patient.email} / demo123`);

    console.log('\\nSeeding finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

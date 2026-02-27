import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private prisma: PrismaService
    ) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() signInDto: Record<string, any>) {
        const user = await this.authService.validateUser(signInDto.email, signInDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() body: { name: string; email: string; password: string; phone?: string }) {
        // Check if email already exists
        const existing = await this.usersService.findByEmail(body.email);
        if (existing) {
            throw new UnauthorizedException('Email already in use');
        }

        // Get default tenant (the first one) for patient registration
        const tenant = await this.prisma.tenant.findFirst({ orderBy: { created_at: 'asc' } });
        if (!tenant) {
            throw new UnauthorizedException('System not initialized');
        }

        const user = await this.usersService.registerPatient(body, tenant.id);
        return this.authService.login(user);
    }
}

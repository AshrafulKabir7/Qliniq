import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS for frontend
  app.enableCors();

  // Seed Super Admin on boot
  const usersService = app.get(UsersService);
  await usersService.setupSuperAdmin();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

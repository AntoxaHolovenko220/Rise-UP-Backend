import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './service/users/users.service';
import { CitiesService } from './service/cities/cities.service';
import { join } from 'path';
import * as express from 'express';
const cors = require('cors');
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Создание администратора при запуске
  const usersService = app.get(UsersService);
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('⚠️ ADMIN_EMAIL и ADMIN_PASSWORD не заданы в .env');
    process.exit(1);
  }

  const adminExists = await usersService.findByEmail(adminEmail);
  if (!adminExists) {
    await usersService.createUser({
      nickname: 'SuperAdmin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      status: 'active',
      firstname: 'Admin',
      lastname: 'Adminov',
      phone: '+1234567890',
      city: '67ac996c9ceeb3898eee3197',
    });
    console.log(`✅ Администратор создан: ${adminEmail} / ${adminPassword}`);
  }
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const citiesService = app.get(CitiesService);
  await citiesService.populateCities();
  app.use(cors()); // Разрешаем запросы с фронта

  const PORT = process.env.PORT || 3000;
  await app.listen(8000, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}

bootstrap();

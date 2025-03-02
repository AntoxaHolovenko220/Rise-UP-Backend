import { AuthModule } from './module/auth/auth.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './module/users/users.module';
import { CitiesModule } from './module/cities/cities.module';
import { StatusesModule } from './module/statuses/statuses.module';
import { LeadsModule } from './module/leads/leads.module';
import { FilialsModule } from './module/filials/filials.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/mydb',
    ),
    MulterModule.register({
      dest: './uploads',
    }),
    UsersModule,
    AuthModule,
    CitiesModule,
    StatusesModule,
    LeadsModule,
    FilialsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

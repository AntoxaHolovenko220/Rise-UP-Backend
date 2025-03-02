import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../../service/auth/auth.service';
import { AuthController } from '../../controller/auth/auth.controller';
import { UsersModule } from '../users/users.module'; // Импорт UsersModule
import { JwtStrategy } from '../../strategy/auth/jwt.strategy';
import { AuthGuard } from '../../guards/auth.guard';
import { ENV } from '../../config/env.config';

@Module({
  imports: [
    forwardRef(() => UsersModule), // Используем forwardRef
    PassportModule,
    JwtModule.register({
      secret: ENV.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthGuard],
  exports: [AuthService, JwtModule, AuthGuard],
})
export class AuthModule {}

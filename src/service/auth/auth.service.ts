import {
  Inject,
  Injectable,
  forwardRef,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, userPassword: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(userPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'inactive') {
      throw new ForbiddenException('Access denied: Your account is inactive.');
    }

    const { password: _, ...result } = user; // Переименовываем password в _ и исключаем его
    return result;
  }

  async login(user: any) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      rabota_email: user.rabota_email,
      rabota_password: user.rabota_password,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}

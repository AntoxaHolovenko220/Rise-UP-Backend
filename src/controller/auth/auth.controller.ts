import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../../service/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() { email, password }: { email: string; password: string }) {
    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user);
  }
}

import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // ✅ Добавлен импорт для загрузки файлов
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from '../../service/users/users.service';
import { User } from '../../schemas/user.schema';
import { AuthGuard } from '../../guards/auth.guard';

// ✅ Конфигурация хранения файлов
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('img', { storage }))
  async register(
    @Body() createUserDto: any,
    @UploadedFile() file: Express.Multer.File | undefined, // Указываем, что файл может быть undefined
    @Req() req,
  ): Promise<User> {
    console.log('Received body:', createUserDto);
    console.log('Uploaded file:', file ? file.filename : 'No file uploaded'); // Улучшенное логирование
    console.log('User role:', req.user.role);

    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admin can create users');
    }
    return this.usersService.createUser(createUserDto, file);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('user/:id')
  async getUser(@Param('id') id: string): Promise<User | null> {
    return this.usersService.getUser(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('img', { storage })) // ✅ Добавляем возможность редактировать фото
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: any,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto, req.user.role, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteUser(
    @Param('id') id: string,
    @Req() req,
  ): Promise<{ message: string }> {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admin can delete users');
    }
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}

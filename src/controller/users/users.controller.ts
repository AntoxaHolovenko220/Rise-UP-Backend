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
const fs = require('fs');

// ✅ Конфигурация хранения файлов
const storage = diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = '/home/ubuntu/Rise-UP-Backend/uploads';

    // Создаём папку, если её нет
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
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
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req,
  ): Promise<User> {
    console.log('📥 Данные запроса:', createUserDto);
    console.log('📂 Файл загружен:', file ? file.filename : 'Файл не загружен');

    if (req.user.role !== 'admin') {
      throw new UnauthorizedException(
        'Только админ может создавать пользователей',
      );
    }

    const user = await this.usersService.createUser(createUserDto, file);
    console.log('✅ Пользователь создан:', user);

    return user;
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

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { City } from 'src/schemas/city.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(City.name) private cityModel: Model<City>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean().exec();
  }

  async createUser(
    createUserDto: any,
    file?: Express.Multer.File,
  ): Promise<User> {
    console.log('🟢 createUserDto:', createUserDto);
    console.log(
      '📂 Загруженный файл:',
      file ? file.filename : 'Файл не загружен',
    );

    const { password, city, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const cityId = new Types.ObjectId(city);

    const filePath = file ? `/uploads/${file.filename}` : null;

    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
      city: cityId,
      img: filePath,
    });

    await newUser.save();
    console.log('✅ Пользователь сохранён:', newUser);

    return newUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('city').exec();
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id).populate('city').exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async updateUser(
    id: string,
    updateUserDto: any,
    userRole: string,
    file?: Express.Multer.File,
  ): Promise<User> {
    const { city, password, ...otherFields } = updateUserDto;

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Используем let вместо const
    let updateData: any = {};

    if (userRole === 'hr') {
      updateData = {
        mailto: otherFields.mailto || user.mailto,
        telegram: otherFields.telegram,
        whatsapp: otherFields.whatsapp,
        viber: otherFields.viber,
        facebook: otherFields.facebook,
      };

      if (file) {
        updateData.img = `/uploads/${file.filename}`;
      }
    } else {
      updateData = { ...otherFields };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      if (city) {
        updateData.city = new Types.ObjectId(city);
      }
      if (file) {
        updateData.img = `/uploads/${file.filename}`;
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('city')
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}

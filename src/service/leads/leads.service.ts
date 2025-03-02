import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lead, LeadDocument } from '../../schemas/lead.schema';
import { City } from 'src/schemas/city.schema';
import { Status } from 'src/schemas/status.schema';
import { User } from 'src/schemas/user.schema';
import { Response } from 'express';
import axios from 'axios';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @InjectModel(City.name) private cityModel: Model<City>,
    @InjectModel(Status.name) private statusModel: Model<Status>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createLead(
    id: string,
    createLeadDto: any,
    file?: Express.Multer.File,
  ): Promise<Lead> {
    const { city, status, hr, ...leadData } = createLeadDto;
    console.log(id);

    const cityId = new Types.ObjectId(city);
    const statusId = new Types.ObjectId(status);
    const hrId = new Types.ObjectId(id);

    const filePath = file ? `/uploads/${file.filename}` : null;

    const newLead = await this.leadModel.create({
      ...leadData,
      city: cityId,
      status: statusId,
      hr: hrId,
      file: filePath,
    });

    const populatedLead = await this.leadModel
      .findById(newLead._id)
      .populate('city')
      .populate('status')
      .populate('hr')
      .exec();

    if (!populatedLead) {
      throw new NotFoundException('Lead not found after creation');
    }
    return populatedLead;
  }

  async findAll(): Promise<Lead[]> {
    return this.leadModel
      .find()
      .populate('city')
      .populate('status')
      .populate('hr')
      .exec();
  }

  async getLead(id: string): Promise<Lead> {
    const lead = await this.leadModel
      .findById(id)
      .populate('city')
      .populate('status')
      .populate('hr')
      .exec();
    if (!lead) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }
    return lead;
  }

  async findAllByHrId(hrId: string): Promise<Lead[]> {
    if (!Types.ObjectId.isValid(hrId)) {
      throw new NotFoundException('Invalid HR ID');
    }

    const hrExists = await this.userModel.findById(hrId);
    if (!hrExists) {
      throw new NotFoundException('HR not found');
    }

    return this.leadModel
      .find({ hr: new Types.ObjectId(hrId) })
      .populate('city')
      .populate('status')
      .populate('hr')
      .exec();
  }

  async updateLead(
    id: string,
    userId: string,
    userRole: string,
    updateLeadDto: any,
    file?: Express.Multer.File,
  ): Promise<Lead> {
    const { city, status, hr, ...otherFields } = updateLeadDto;
    const lead = await this.leadModel.findById(id);

    let updateData: any = { ...otherFields };

    if (city) updateData.city = new Types.ObjectId(city);
    if (status) updateData.status = new Types.ObjectId(status);
    if (hr) updateData.hr = new Types.ObjectId(hr);
    if (file) updateData.file = `/uploads/${file.filename}`;
    if (!lead) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }

    if (lead.hr.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You are not allowed to edit this lead');
    }

    const updatedLead = await this.leadModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('city')
      .populate('status')
      .populate('hr')
      .exec();

    if (!updatedLead) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }

    return updatedLead;
  }

  async deleteLead(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    const lead = await this.leadModel.findById(id);

    if (!lead) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }
    if (lead.hr.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You are not allowed to edit this lead');
    }

    const result = await this.leadModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }
  }

  async getAuthToken(email: string, password: string): Promise<string> {
    const loginUrl = 'https://auth-api.robota.ua/Login';

    try {
      const response = await axios.post(
        loginUrl,
        {
          username: email,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (response.status !== 200) {
        throw new HttpException(
          `Ошибка авторизации! Статус: ${response.status}`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      return response.data.trim();
    } catch (error) {
      throw new HttpException(
        'Ошибка получения токена',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  fetchCandidatesData = async (
    id: string,
    candidateUrl: string,
    email: string,
    password: string,
  ) => {
    try {
      let token;
      try {
        token = await this.getAuthToken(email, password);
        if (!token)
          throw new HttpException(
            '❌ Ошибка: Токен не получен.',
            HttpStatus.UNAUTHORIZED,
          );
      } catch (error) {
        console.error('❌ Ошибка получения токена:', error);
        throw new HttpException(
          'Ошибка аутентификации',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const match = candidateUrl.match(/\/candidates\/(\d+)/);
      if (!match) {
        throw new HttpException(
          '⚠️ Неверный формат ссылки!',
          HttpStatus.BAD_REQUEST,
        );
      }
      const candidateId = match[1];
      console.log(`🔹 Запрос данных кандидата с ID: ${candidateId}`);

      let response;
      try {
        response = await axios.get(
          `https://employer-api.robota.ua/resume/${candidateId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          },
        );
      } catch (error) {
        console.error('❌ Ошибка при запросе данных кандидата:', error);
        throw new HttpException(
          'Ошибка при запросе данных кандидата',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (response.status !== 200) {
        throw new HttpException(
          `Ошибка загрузки данных! Статус: ${response.status}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = response.data;
      if (!data) {
        throw new HttpException(
          '❌ Пустой ответ от API',
          HttpStatus.NO_CONTENT,
        );
      }

      const educationArray =
        data.educations?.map(
          (ed: any) =>
            `${ed.name}${ed.speciality ? `, ${ed.speciality}` : ''}, ${ed.yearOfGraduation}`,
        ) || [];

      const experiencesArray =
        data.experiences?.map(
          (exp: any) => `${exp.position} в компании ${exp.company}`,
        ) || [];

      let phoneNumber = '';
      try {
        const contact = data.contacts?.find(
          (contact: any) =>
            contact.typeId === 'Phone' || contact.typeId === 'SocialNetwork',
        );

        if (contact) {
          if (contact.typeId === 'Phone') {
            phoneNumber = contact.description;
          } else if (contact.typeId === 'SocialNetwork') {
            if (contact.subTypeId === 'telegram') {
              phoneNumber = contact.description.replace('https://t.me/', '');
            } else if (contact.subTypeId === 'viber') {
              phoneNumber = contact.description.replace(
                'viber://chat?number=',
                '',
              );
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Ошибка при обработке контактов:', error);
      }

      const payload = {
        firstname: data.name || 'Не указано',
        surname: data.fatherName || 'Не указано',
        lastname: data.surname || 'Не указано',
        email: data.email || 'Не указано',
        phone: phoneNumber || 'Не указан',
        profession: data.speciality || 'Не указано',
        education: educationArray,
        experience: experiencesArray,
        resumeId: data.resumeId || null,
        notebookId: data.notebookId || null,
        img: data.photo
          ? `https://cv-photos-original.robota.ua/cdn-cgi/image/w=300/${data.photo}`
          : null,
      };

      console.log('✅ Данные кандидата переданные для отправки:', payload);

      let createdLead;
      try {
        createdLead = await this.createLead(id, payload);
      } catch (error) {
        console.error('❌ Ошибка при создании лида:', error);
        throw new HttpException(
          'Ошибка при создании кандидата в CRM',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      console.log('Кандидат успешно создан!');
      return createdLead;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          '❌ Ошибка сети или API:',
          error.response?.data || error.message,
        );
        throw new HttpException(
          `Ошибка сети: ${error.message}`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else if (error instanceof HttpException) {
        console.error('❌ Ошибка HTTP:', error.message);
        throw error;
      } else {
        console.error('❌ Неизвестная ошибка:', error);
        throw new HttpException(
          '❌ Внутренняя ошибка сервера',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  };

  async fetchResumeFile(
    cvId: string,
    notebookId: string,
    email: string,
    password: string,
    res: Response,
  ): Promise<void> {
    const RESUME_FILE_URL = 'https://employer-api.robota.ua/resume/file';

    try {
      const token = await this.getAuthToken(email, password);
      if (!token) {
        throw new HttpException(
          '❌ Ошибка: Токен не получен.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      console.log(
        `🔹 Запрос на скачивание резюме для CvId: ${cvId}, NotebookId: ${notebookId}`,
      );

      const response = await axios.get(RESUME_FILE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
        params: { CvId: cvId, notebookId: notebookId },
        responseType: 'arraybuffer', // Получаем файл в виде буфера
      });

      if (response.status !== 200) {
        throw new HttpException(
          `Ошибка при скачивании резюме! Статус: ${response.status}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const contentType =
        response.headers['content-type'] || 'application/octet-stream';
      let fileExtension = '.bin';

      if (contentType.includes('pdf')) fileExtension = '.pdf';
      else if (contentType.includes('rtf')) fileExtension = '.rtf';
      else if (contentType.includes('msword')) fileExtension = '.doc';
      else if (contentType.includes('officedocument.wordprocessingml.document'))
        fileExtension = '.docx';
      else if (contentType.includes('plain')) fileExtension = '.txt';

      const fileName = `resume_${cvId}${fileExtension}`;

      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', contentType);
      res.send(Buffer.from(response.data)); // Отправляем бинарные данные

      console.log(`✅ Файл успешно отправлен: ${fileName}`);
    } catch (error) {
      console.error('❌ Ошибка загрузки файла резюме:', error);
      throw new HttpException(
        'Ошибка загрузки файла резюме',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

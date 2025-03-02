import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { City, CityDocument } from '../../schemas/city.schema';
import { ENV } from '../../config/env.config';

@Injectable()
export class CitiesService {
  private logger = new Logger(CitiesService.name);
  private readonly NOVA_POSHTA_API_URL = 'https://api.novaposhta.ua/v2.0/json/';
  private readonly API_KEY = ENV.NOVA_POSHTA_API_KEY;

  constructor(@InjectModel(City.name) private cityModel: Model<CityDocument>) {}

  async createCity(name: string, region: string): Promise<City> {
    return this.cityModel.create({ name, region });
  }

  async findAll(): Promise<City[]> {
    return this.cityModel.find().exec();
  }

  async updateCity(id: string, name: string, region: string): Promise<City> {
    const updatedCity = await this.cityModel
      .findByIdAndUpdate(id, { name, region }, { new: true })
      .exec();
    if (!updatedCity) {
      throw new NotFoundException('City not found');
    }
    return updatedCity;
  }

  async deleteCity(id: string): Promise<void> {
    const result = await this.cityModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('City not found');
    }
  }

  async countDocuments(): Promise<number> {
    return this.cityModel.countDocuments();
  }

  async fetchCitiesFromNovaPoshta(): Promise<any[]> {
    try {
      const response = await axios.post(this.NOVA_POSHTA_API_URL, {
        apiKey: this.API_KEY,
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {},
      });

      if (!response.data.success) {
        throw new Error('Ошибка при получении городов с API Новой Почты');
      }

      return response.data.data.map((city: any) => ({
        name: city.Description,
        region: city.AreaDescription,
      }));
    } catch (error) {
      this.logger.error(
        'Ошибка при получении данных с API Новой Почты:',
        error,
      );
      return [];
    }
  }

  async populateCities(): Promise<void> {
    const citiesCount = await this.countDocuments();
    if (citiesCount > 0) {
      this.logger.log(
        `🏙️ В базе уже есть ${citiesCount} городов, пропускаем загрузку.`,
      );
      return;
    }

    this.logger.log(
      '🟡 Коллекция City пуста, загружаем города из API Новой Почты...',
    );
    const cities = await this.fetchCitiesFromNovaPoshta();

    if (cities.length > 0) {
      await this.cityModel.insertMany(cities);
      this.logger.log('✅ Города успешно загружены в базу данных!');
    } else {
      this.logger.warn('⚠️ Не удалось загрузить города, список пуст.');
    }
  }
}

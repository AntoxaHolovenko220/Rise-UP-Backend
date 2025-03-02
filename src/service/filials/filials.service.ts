import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Filial, FilialDocument } from 'src/schemas/filial.schema';
@Injectable()
export class FilialsService {
  constructor(
    @InjectModel(Filial.name) private filialModel: Model<FilialDocument>,
  ) {}

  async createFilial(name: string): Promise<Filial> {
    return this.filialModel.create({ name });
  }

  async findAll(): Promise<Filial[]> {
    return this.filialModel.find().exec();
  }

  async updateFilial(id: string, name: string): Promise<Filial> {
    const updatedFilial = await this.filialModel
      .findByIdAndUpdate(id, { name }, { new: true })
      .exec();
    if (!updatedFilial) {
      throw new NotFoundException('Filial not found');
    }
    return updatedFilial;
  }

  async deleteFilial(id: string): Promise<void> {
    const result = await this.filialModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Filial not found');
    }
  }

  async countDocuments(): Promise<number> {
    return this.filialModel.countDocuments();
  }
}

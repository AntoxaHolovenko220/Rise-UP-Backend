import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status, StatusDocument } from '../../schemas/status.schema';

@Injectable()
export class StatusesService {
  constructor(
    @InjectModel(Status.name) private statusModel: Model<StatusDocument>,
  ) {}

  async createStatus(name: string, color: string): Promise<Status> {
    return this.statusModel.create({ name, color });
  }

  async findAll(): Promise<Status[]> {
    return this.statusModel.find().exec();
  }

  async getStatus(id: string): Promise<Status> {
    const status = await this.statusModel.findById(id).exec();
    if (!status) {
      throw new NotFoundException(`Status with id ${id} not found`);
    }
    return status;
  }

  async updateStatus(
    id: string,
    updateData: { name?: string; color?: string },
  ): Promise<Status> {
    const updatedStatus = await this.statusModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedStatus) {
      throw new NotFoundException('Status not found');
    }
    return updatedStatus;
  }

  async deleteStatus(id: string): Promise<void> {
    const result = await this.statusModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Status not found');
    }
  }
}

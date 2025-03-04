import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { City } from './city.schema';

export type UserDocument = User & Document;

// TODO пропс картинки, пропс ТГ Вайбер Вотсап, почта для писем(масив строк), сделать так что бы HR мог менять почту для писем и соцсети

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  nickname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['admin', 'hr'], default: 'hr' })
  role: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  city: Types.ObjectId | City;

  @Prop()
  mailto: string;

  @Prop()
  telegram: string;

  @Prop()
  whatsapp: string;

  @Prop()
  facebook: string;

  @Prop()
  img: string;

  @Prop()
  rabota_email: string;

  @Prop()
  rabota_password: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from './user.schema';
import { City } from './city.schema';
import { Status } from './status.schema';

export type LeadDocument = Lead & Document;

//TODO пропс изображения, пропс resumeId, пропс notebookId
@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true })
  firstname: string;

  @Prop()
  surname: string;

  @Prop()
  lastname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ type: Types.ObjectId, ref: 'City' })
  city: Types.ObjectId | City;

  @Prop({ type: Types.ObjectId, ref: 'Status' })
  status: Types.ObjectId | Status;

  @Prop()
  statusDate: Date;

  @Prop()
  comments: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  hr: Types.ObjectId | User;

  @Prop()
  file: string;

  @Prop()
  img: string;

  @Prop()
  profession: string;

  @Prop()
  about: string;

  @Prop()
  languages: string[];

  @Prop()
  education: string[];

  @Prop()
  experience: string[];

  @Prop()
  skills: string[];

  @Prop()
  resumeId: string;

  @Prop()
  notebookId: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CityDocument = City & Document;

@Schema()
export class City {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  region: string;
}

export const CitySchema = SchemaFactory.createForClass(City);

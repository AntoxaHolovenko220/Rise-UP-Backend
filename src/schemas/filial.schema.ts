import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FilialDocument = Filial & Document;

@Schema()
export class Filial {
  @Prop({ required: true, unique: true })
  name: string;
}

export const FilialSchema = SchemaFactory.createForClass(Filial);

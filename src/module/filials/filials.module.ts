import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Filial, FilialSchema } from 'src/schemas/filial.schema';
import { FilialsService } from 'src/service/filials/filials.service';
import { FilialsController } from 'src/controller/filials/filials.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Filial.name, schema: FilialSchema }]),
    forwardRef(() => AuthModule),
  ],
  providers: [FilialsService],
  controllers: [FilialsController],
})
export class FilialsModule {}

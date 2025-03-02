import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Status, StatusSchema } from '../../schemas/status.schema';
import { StatusesService } from '../../service/statuses/statuses.service';
import { StatusesController } from '../../controller/statuses/statuses.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Status.name, schema: StatusSchema }]),
    forwardRef(() => AuthModule),
  ],
  providers: [StatusesService],
  controllers: [StatusesController],
})
export class StatusesModule {}

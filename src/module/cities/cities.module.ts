import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { City, CitySchema } from '../../schemas/city.schema';
import { CitiesService } from '../../service/cities/cities.service';
import { CitiesController } from '../../controller/cities/cities.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    forwardRef(() => AuthModule),
  ],
  providers: [CitiesService],
  controllers: [CitiesController],
})
export class CitiesModule {}

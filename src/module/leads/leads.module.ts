import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsController } from '../../controller/leads/leads.controller';
import { LeadsService } from '../../service/leads/leads.service';
import { Lead, LeadSchema } from '../../schemas/lead.schema';
import { Status, StatusSchema } from '../../schemas/status.schema';
import { AuthModule } from '../auth/auth.module';
import { City, CitySchema } from 'src/schemas/city.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: City.name, schema: CitySchema },
      { name: Status.name, schema: StatusSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}

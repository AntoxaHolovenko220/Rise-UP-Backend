import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CitiesService } from '../../service/cities/cities.service';
import { City } from '../../schemas/city.schema';
import { AuthGuard } from '../../guards/auth.guard';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async createCity(
    @Body() { name, region }: { name: string; region: string },
    @Req() req,
  ): Promise<City> {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admin can create cities');
    }
    return this.citiesService.createCity(name, region);
  }

  @Get()
  async getAllCities(): Promise<City[]> {
    return this.citiesService.findAll();
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateCity(
    @Param('id') id: string,
    @Body() { name, region }: { name: string; region: string },
    @Req() req,
  ): Promise<City> {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admin can update cities');
    }
    return this.citiesService.updateCity(id, name, region);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteCity(
    @Param('id') id: string,
    @Req() req,
  ): Promise<{ message: string }> {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admin can delete cities');
    }
    await this.citiesService.deleteCity(id);
    return { message: 'City deleted successfully' };
  }
}

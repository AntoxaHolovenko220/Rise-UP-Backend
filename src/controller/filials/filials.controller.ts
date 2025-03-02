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
import { FilialsService } from '../../service/filials/filials.service';
import { Filial } from '../../schemas/filial.schema';
import { AuthGuard } from '../../guards/auth.guard';

@Controller('filials')
export class FilialsController {
  constructor(private readonly filialsService: FilialsService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async createFilial(
    @Body() { name }: { name: string },
    @Req() req,
  ): Promise<Filial> {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admin can create filials');
    }
    return this.filialsService.createFilial(name);
  }

  @Get()
  async getAllFilials(): Promise<Filial[]> {
    return this.filialsService.findAll();
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateFilial(
    @Param('id') id: string,
    @Body() { name }: { name: string },
    @Req() req,
  ): Promise<Filial> {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admin can update filials');
    }
    return this.filialsService.updateFilial(id, name);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteFilial(
    @Param('id') id: string,
    @Req() req,
  ): Promise<{ message: string }> {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admin can delete filials');
    }
    await this.filialsService.deleteFilial(id);
    return { message: 'Filial deleted successfully' };
  }
}

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
import { StatusesService } from '../../service/statuses/statuses.service';
import { Status } from '../../schemas/status.schema';
import { AuthGuard } from '../../guards/auth.guard';

@Controller('statuses')
export class StatusesController {
  constructor(private readonly statusesService: StatusesService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async createStatus(
    @Body() { name, color }: { name: string; color: string },
    @Req() req,
  ): Promise<Status> {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admin can create statuses');
    }
    return this.statusesService.createStatus(name, color);
  }

  @Get()
  async getAllStatuses(): Promise<Status[]> {
    return this.statusesService.findAll();
  }

  @Get('status/:id')
  async getUser(@Param('id') id: string): Promise<Status | null> {
    return this.statusesService.getStatus(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateData: { name?: string; color?: string },
    @Req() req,
  ): Promise<Status> {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admin can update statuses');
    }
    return this.statusesService.updateStatus(id, updateData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteStatus(
    @Param('id') id: string,
    @Req() req,
  ): Promise<{ message: string }> {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Only admin can delete statuses');
    }
    await this.statusesService.deleteStatus(id);
    return { message: 'Status deleted successfully' };
  }
}

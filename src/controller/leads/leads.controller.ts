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
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LeadsService } from '../../service/leads/leads.service';
import { Lead } from '../../schemas/lead.schema';
import { AuthGuard } from '../../guards/auth.guard';
import { Response } from 'express';

// Конфигурация хранения файлов
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage }))
  async createLead(
    @Body() createLeadDto: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<Lead> {
    return this.leadsService.createLead(req.user.id, createLeadDto, file);
  }

  @Get()
  async getAllLeads(): Promise<Lead[]> {
    return this.leadsService.findAll();
  }

  @Get('lead/:id')
  async getLead(@Param('id') id: string): Promise<Lead | null> {
    return this.leadsService.getLead(id);
  }

  @Get('hr/:id')
  async GetAllByHrId(@Param('id') id: string): Promise<Lead[]> {
    return this.leadsService.findAllByHrId(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage }))
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: any,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Lead> {
    return this.leadsService.updateLead(
      id,
      req.user.id,
      req.user.role,
      updateLeadDto,
      file,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteLead(
    @Param('id') id: string,
    @Req() req,
  ): Promise<{ message: string }> {
    await this.leadsService.deleteLead(id, req.user.id, req.user.role);
    return { message: 'Lead deleted successfully' };
  }

  @Post('rabota/login')
  @UseGuards(AuthGuard)
  async login(@Body() body: { email: string; password: string }) {
    return this.leadsService.getAuthToken(body.email, body.password);
  }

  @Post('rabota/create')
  @UseGuards(AuthGuard)
  async fetchCandidate(
    @Body() body: { url: string; email: string; password: string },
    @Req() req,
  ) {
    return this.leadsService.fetchCandidatesData(
      req.user.id,
      body.url,
      body.email,
      body.password,
    );
  }

  @Post('rabota/resume')
  @UseGuards(AuthGuard)
  async fetchResumeFile(
    @Body()
    body: {
      cvId: string;
      notebookId: string;
      email: string;
      password: string;
    },
    @Res() res: Response, // Используем Express Response
  ) {
    return this.leadsService.fetchResumeFile(
      body.cvId,
      body.notebookId,
      body.email,
      body.password,
      res,
    );
  }
}

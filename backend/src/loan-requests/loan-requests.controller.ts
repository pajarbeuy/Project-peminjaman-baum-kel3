import { BadRequestException, Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import type { UploadedDocumentFile } from '../common/interfaces/uploaded-file.interface';
import { CreateLoanRequestDto } from './dto/create-loan-request.dto';
import { LoanRequestsService } from './loan-requests.service';

@ApiTags('Loan Requests')
@ApiBearerAuth('access-token')
@Controller('loan-requests')
export class LoanRequestsController {
  constructor(private readonly service: LoanRequestsService) {}
  @Post()
  @ApiOperation({ summary: 'Membuat pengajuan peminjaman' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLoanRequestDto) { return this.service.create(user.sub, dto); }
  @Get('mine')
  @ApiOperation({ summary: 'Daftar pengajuan milik pengguna' })
  findMine(@CurrentUser() user: JwtPayload) { return this.service.findMine(user.sub); }
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: Number(process.env.UPLOAD_MAX_BYTES ?? 10 * 1024 * 1024) } }))
  @ApiOperation({ summary: 'Upload dokumen pendukung pengajuan secara privat' })
  uploadDocument(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body('jenis') jenis: string, @UploadedFile() file: UploadedDocumentFile) {
    if (!file) throw new BadRequestException('File wajib diunggah.');
    return this.service.addDocument(user.sub, id, jenis, file);
  }
}

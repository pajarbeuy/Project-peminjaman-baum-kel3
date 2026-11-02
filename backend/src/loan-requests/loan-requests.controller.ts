import { BadRequestException, Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import type { UploadedDocumentFile } from '../common/interfaces/uploaded-file.interface';
import { CreateLoanRequestDto } from './dto/create-loan-request.dto';
import { LoanRequestsService } from './loan-requests.service';
import { RejectLoanRequestDto } from './dto/reject-loan-request.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/enums/role.enum';

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
  @Post(':id/submit')
  @ApiOperation({ summary: 'Mengirim draft setelah dokumen wajib lengkap' })
  submit(@CurrentUser() user: JwtPayload, @Param('id') id: string) { return this.service.submit(user.sub, id, user.role); }
  @Post(':id/verify-tu')
  @UseGuards(RolesGuard)
  @Roles(Role.TU)
  verifyTu(@CurrentUser() user: JwtPayload, @Param('id') id: string) { return this.service.transition(id, user.sub, user.role, 'verify'); }
  @Post(':id/process-baum')
  @UseGuards(RolesGuard)
  @Roles(Role.BAUM_STAFF)
  processBaum(@CurrentUser() user: JwtPayload, @Param('id') id: string) { return this.service.transition(id, user.sub, user.role, 'process'); }
  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.KABAG_UMUM)
  approve(@CurrentUser() user: JwtPayload, @Param('id') id: string) { return this.service.transition(id, user.sub, user.role, 'approve'); }
  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.TU, Role.BAUM_STAFF, Role.KABAG_UMUM)
  reject(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: RejectLoanRequestDto) { return this.service.transition(id, user.sub, user.role, 'reject', dto.alasan); }
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: Number(process.env.UPLOAD_MAX_BYTES ?? 10 * 1024 * 1024) } }))
  @ApiOperation({ summary: 'Upload dokumen pendukung pengajuan secara privat' })
  uploadDocument(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body('jenis') jenis: string, @UploadedFile() file: UploadedDocumentFile) {
    if (!file) throw new BadRequestException('File wajib diunggah.');
    return this.service.addDocument(user.sub, id, jenis, file);
  }
}

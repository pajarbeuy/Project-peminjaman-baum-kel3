import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lab } from './entities/lab.entity';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lab])],
  controllers: [LabsController],
  providers: [LabsService],
  exports: [LabsService],
})
export class LabsModule {}

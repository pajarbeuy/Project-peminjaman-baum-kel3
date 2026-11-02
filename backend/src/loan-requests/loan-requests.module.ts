import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '../items/entities/item.entity';
import { Lab } from '../labs/entities/lab.entity';
import { Room } from '../rooms/entities/room.entity';
import { LoanRequestItem } from './entities/loan-request-item.entity';
import { LoanRequest } from './entities/loan-request.entity';
import { LoanDocument } from './entities/loan-document.entity';
import { LoanRequestsController } from './loan-requests.controller';
import { LoanRequestsService } from './loan-requests.service';

@Module({ imports: [TypeOrmModule.forFeature([LoanRequest, LoanRequestItem, LoanDocument, Item, Room, Lab])], controllers: [LoanRequestsController], providers: [LoanRequestsService] })
export class LoanRequestsModule {}

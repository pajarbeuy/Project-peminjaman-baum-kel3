import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { StockMovement } from '../stock/entities/stock-movement.entity';
@Module({ imports: [TypeOrmModule.forFeature([Item, StockMovement])], controllers: [ItemsController], providers: [ItemsService], exports: [ItemsService] })
export class ItemsModule {}

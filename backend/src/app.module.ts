import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FacultiesModule } from './faculties/faculties.module';
import { ProgramsModule } from './programs/programs.module';
import { RoomsModule } from './rooms/rooms.module';
import { LabsModule } from './labs/labs.module';
import { ItemsModule } from './items/items.module';
import { LoanRequestsModule } from './loan-requests/loan-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', '127.0.0.1'),
        port: Number(configService.get('DB_PORT', 3306)),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        // Migration dijalankan secara eksplisit via CLI (npm run migration:run)
        migrationsRun: false,
      }),
    }),

    AuthModule,
    UsersModule,
    FacultiesModule,
    ProgramsModule,
    RoomsModule,
    LabsModule,
    ItemsModule,
    LoanRequestsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}

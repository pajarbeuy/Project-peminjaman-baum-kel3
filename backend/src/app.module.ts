import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import { config } from "process";

@Module({
  imports:[
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',

    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: Number(config.get('DB_PORT', 3306)),
        username: config.get<string>('DB_USERNAME','root'),
        password: config.get<string>('DB_PASSWORD',''),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize:false


      }),
    }),
  ],
})
export class AppModule{}
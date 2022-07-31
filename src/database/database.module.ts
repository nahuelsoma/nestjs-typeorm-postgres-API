import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from '../config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        const { url } = configService.postgres;
        return {
          type: 'postgres',
          url,
          autoLoadEntities: true,
          synchronize: false,
          logging: false,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

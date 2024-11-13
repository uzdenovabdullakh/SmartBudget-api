import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DataSource,
      useFactory: async (configService: ConfigService) => {
        const connection = new DataSource({
          type: 'postgres',
          url: configService.get('DATABASE_URL'),
          migrationsRun: false,
          migrationsTransactionMode: 'all',
          entities: [`${__dirname}/entities/**/*{.ts,.js}`],
          migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
          synchronize: false,
          cache: false,
        });

        await connection.initialize();
        console.log('Data Source has been initialized');

        return connection;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DataSource],
})
export class TypeOrmModule {}

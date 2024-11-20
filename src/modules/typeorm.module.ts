import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import connectionDataSource from '../data-source';

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        await connectionDataSource.initialize();
        return connectionDataSource;
      },
    },
  ],
  exports: [DataSource],
})
export class TypeOrmModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import UploadController from './upload/upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElpiojowebModule } from './elpiojoweb/elpiojoweb.module';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';


@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'chuchoivan',
      password: 'kfeputo123',
      database: 'elpiojoweb',
      synchronize: true,
      autoLoadEntities: true,
    }),
    ElpiojowebModule

  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}

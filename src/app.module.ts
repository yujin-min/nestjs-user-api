import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { UserEntity } from './users/entity/user.entity';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host:
        process.env.IS_DOCKER === 'true'
          ? process.env.DATABASE_LOCAL_DOCKER_HOST
          : process.env.DATABASE_LOCAL_HOST,
      port: 3306,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: 'test',
      entities: [UserEntity],
      synchronize: true,
    }),
  ],
})
export class AppModule {}

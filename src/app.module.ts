import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CronModule } from './cron/cron.module';
import { JwtAccessTokenStrategy } from './auth/strategies/jwt-access.strategy';
import { User } from './users/models/user.entity';
import { Account } from './accounts/models/account.entity';
import { RedisOptions } from './config/redis-options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('databaseHost'),
        port: configService.get('databasePort'),
        username: configService.get('databaseUser'),
        password: configService.get('databasePassword'),
        database: configService.get('databaseDb'),
        entities: [User, Account],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync(RedisOptions),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    CronModule,
  ],
  providers: [JwtAccessTokenStrategy],
})
export class AppModule {}

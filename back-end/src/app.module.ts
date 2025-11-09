import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validateEnv } from './config/validation';
import { HealthModule } from './modules/health/health.module';
import { UploadModule } from './modules/upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeriesModule } from './modules/series/series.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { ViewsModule } from './modules/views/views.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const config = configuration();
        return {
          type: 'mysql',
          host: config.db.host,
          port: config.db.port,
          username: config.db.username,
          password: config.db.password,
          database: config.db.name,
          autoLoadEntities: true,
          synchronize: config.db.synchronize,
        } as const;
      },
    }),
    HealthModule,
    UploadModule,
    SeriesModule,
    ChaptersModule,
    ViewsModule,
    ],
  controllers: [],
  providers: [],
})
export class AppModule {}

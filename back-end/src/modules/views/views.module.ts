import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewsService } from './views.service';
import { ViewsController } from './views.controller';
import { ChapterViewStatsDaily } from '../../entities/chapter-view-stats-daily.entity';
import { Chapters } from '../../entities/chapters.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChapterViewStatsDaily, Chapters])],
  providers: [ViewsService],
  controllers: [ViewsController],
  exports: [ViewsService]
})
export class ViewsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Series } from '../../entities/series.entity';
import { Chapters } from '../../entities/chapters.entity';
import { SeriesAuthor } from '../../entities/series-author.entity';
import { Author } from '../../entities/author.entity';
import { ChapterViewStatsDaily } from '../../entities/chapter-view-stats-daily.entity';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Series, Chapters, SeriesAuthor, Author, ChapterViewStatsDaily])],
  providers: [SeriesService],
  controllers: [SeriesController],
})
export class SeriesModule {}
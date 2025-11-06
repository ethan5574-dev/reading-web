import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Series } from './series.entity';
import { Author } from './author.entity';

@Entity('series_author')
@Index(['series_id', 'code'], { unique: true })
@Index(['code'])
export class SeriesAuthor {
  @PrimaryColumn({ type: 'int' })
  series_id: number;

  @PrimaryColumn({ type: 'varchar', length: 40 })
  code: string;

  @ManyToOne(() => Series, series => series.seriesAuthors)
  @JoinColumn({ name: 'series_id' })
  series: Series;

  @ManyToOne(() => Author, author => author.seriesAuthors)
  @JoinColumn({ name: 'code' })
  author: Author;
}

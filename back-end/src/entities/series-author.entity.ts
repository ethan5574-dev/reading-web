import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Series } from './series.entity';
import { Author } from './author.entity';

@Entity('series_author')
@Index(['series_id', 'code'], { unique: true })
@Index(['code'])
export class SeriesAuthor {
  @Column({ type: 'bigint', primary: true })
  series_id: number;

  @Column({ type: 'bigint', primary: true })
  code: number;

  @ManyToOne(() => Series, series => series.seriesAuthors)
  @JoinColumn({ name: 'series_id' })
  series: Series;

  @ManyToOne(() => Author, author => author.seriesAuthors)
  @JoinColumn({ name: 'code' })
  author: Author;
}

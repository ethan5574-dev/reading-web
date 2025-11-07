import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Chapters } from './chapters.entity';

@Entity('chapter_view_stats_daily')
@Index(['chapter_id', 'bucket_date'], { unique: true })
export class ChapterViewStatsDaily {
  @Column({ type: 'bigint', primary: true })
  chapter_id: number;

  @Column({ type: 'timestamp', primary: true })
  bucket_date: Date;

  @Column({ type: 'bigint', nullable: false, default: 0 })
  count: number;

  @ManyToOne(() => Chapters, chapter => chapter.viewStats)
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapters;
}

import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Chapters } from './chapters.entity';

@Entity('chapter_view_stats_daily')
@Index(['chapter_id', 'bucket_date'], { unique: true })
export class ChapterViewStatsDaily {
  @PrimaryColumn({ type: 'int' })
  chapter_id: number;

  @PrimaryColumn({ type: 'timestamp' })
  bucket_date: Date;

  @Column({ type: 'int', nullable: false, default: 0 })
  count: number;

  @ManyToOne(() => Chapters, chapter => chapter.viewStats)
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapters;
}

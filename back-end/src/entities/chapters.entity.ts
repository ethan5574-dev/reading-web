import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Series } from './series.entity';
import { ChapterViewStatsDaily } from './chapter-view-stats-daily.entity';

@Entity('chapters')
@Index(['series_id', 'number'])
@Index(['series_id', 'title']) // Thêm index cho tìm kiếm theo title
export class Chapters {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  chapter_id: number;

  @Column({ type: 'bigint', nullable: false })
  series_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  number: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  title: string;

  @Column({ type: 'json', nullable: false })
  pages_url: any;

  @Column({ type: 'timestamp', nullable: true })
  released_at: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @ManyToOne(() => Series, series => series.chapters)
  @JoinColumn({ name: 'series_id' })
  series: Series;

  @OneToMany(() => ChapterViewStatsDaily, viewStats => viewStats.chapter)
  viewStats: ChapterViewStatsDaily[];
}

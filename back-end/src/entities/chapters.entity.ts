import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Series } from './series.entity';
import { ChapterViewStatsDaily } from './chapter-view-stats-daily.entity';

@Entity('chapters')
@Index(['series_id', 'number'])
export class Chapters {
  @PrimaryGeneratedColumn('increment')
  chapter_id: number;

  @Column({ type: 'bigint', nullable: false })
  series_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  number: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  title: string;

  @Column({ type: 'jsonb', nullable: false })
  pages_url: any;

  @Column({ type: 'timestamptz', nullable: true })
  released_at: Date;

  @CreateDateColumn({ type: 'timestamptz', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: false })
  updated_at: Date;

  @ManyToOne(() => Series, series => series.chapters)
  @JoinColumn({ name: 'series_id' })
  series: Series;

  @OneToMany(() => ChapterViewStatsDaily, viewStats => viewStats.chapter)
  viewStats: ChapterViewStatsDaily[];
}

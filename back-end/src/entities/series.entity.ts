import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Chapters } from './chapters.entity';
import { SeriesAuthor } from './series-author.entity';

@Entity('series')
export class Series {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  series_id: number;

  @Column({ type: 'varchar', length: 250, nullable: false })
  name: string;

  @Column({ 
    type: 'varchar', 
    length: 16, 
    nullable: false, 
    default: 'ongoing' 
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  cover_url: string;

  @Column({ type: 'text', nullable: true })
  synopsis: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @OneToMany(() => Chapters, chapter => chapter.series)
  chapters: Chapters[];

  @OneToMany(() => SeriesAuthor, seriesAuthor => seriesAuthor.series)
  seriesAuthors: SeriesAuthor[];
}

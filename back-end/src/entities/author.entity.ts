import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { SeriesAuthor } from './series-author.entity';

@Entity('author')
export class Author {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  code: string;

  @Column({ type: 'varchar', length: 80, nullable: false })
  label: string;

  @OneToMany(() => SeriesAuthor, seriesAuthor => seriesAuthor.author)
  seriesAuthors: SeriesAuthor[];
}

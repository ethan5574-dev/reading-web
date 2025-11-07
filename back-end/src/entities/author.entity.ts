import { Entity, Column, OneToMany } from 'typeorm';
import { SeriesAuthor } from './series-author.entity';

@Entity('author')
export class Author {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  code: number;

  @Column({ type: 'varchar', length: 80, nullable: false })
  label: string;

  @OneToMany(() => SeriesAuthor, seriesAuthor => seriesAuthor.author)
  seriesAuthors: SeriesAuthor[];
}

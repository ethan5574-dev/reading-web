import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Series } from '../../entities/series.entity';

@Injectable()
export class SeriesService {
    constructor(
        @InjectRepository(Series)
        private seriesRepository: Repository<Series>,
    ) { }


    // Đã sửa để hỗ trợ phân trang (có thể truyền page & pageSize làm tham số hàm)
    async getSeries(page: number = 1, pageSize: number = 10): Promise<Series[]> {
        const skip = (page - 1) * pageSize;
        return this.seriesRepository.find({
            relations: ['chapters', 'seriesAuthors'],
            order: {
                created_at: 'DESC',
            },
            take: pageSize,
            skip: skip,
        });
    }
}
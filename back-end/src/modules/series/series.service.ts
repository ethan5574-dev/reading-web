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

    // Đã sửa để hỗ trợ phân trang và lấy 3 chương mới nhất
    async getSeries(page: number = 1, pageSize: number = 10): Promise<{
        series: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        try {
            const skip = (page - 1) * pageSize;

            // Đếm tổng số series
            const total = await this.seriesRepository.count();

            // Lấy series trước (không join chapters)
            const seriesList = await this.seriesRepository
                .createQueryBuilder('series')
                .leftJoinAndSelect('series.seriesAuthors', 'seriesAuthors')
                .leftJoinAndSelect('seriesAuthors.author', 'author')
                .orderBy('series.created_at', 'DESC')
                .skip(skip)
                .take(pageSize)
                .getMany();

            // Lấy 3 chương mới nhất cho từng series
            const seriesWithChapters = await Promise.all(
                seriesList.map(async (series) => {
                    // Lấy 3 chương mới nhất
                    const latestChapters = await this.seriesRepository.manager
                        .createQueryBuilder()
                        .select('chapters')
                        .from('chapters', 'chapters')
                        .where('chapters.series_id = :seriesId', { seriesId: series.series_id })
                        .orderBy('chapters.number', 'DESC')
                        .limit(3)
                        .getRawMany();

                    // Đếm tổng số chapter
                    const chapterCount = await this.seriesRepository.manager
                        .createQueryBuilder()
                        .select('COUNT(*)', 'count')
                        .from('chapters', 'chapters')
                        .where('chapters.series_id = :seriesId', { seriesId: series.series_id })
                        .getRawOne();

                    return {
                        ...series,
                        latestChapters: latestChapters.map(ch => ch.chapters_number),
                        totalChapters: parseInt(chapterCount?.count || '0'),
                    };
                })
            );

            return {
                series: seriesWithChapters,
                total,
                page,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize)
            };
        } catch (error) {
            console.error('Error fetching series:', error);
            throw error;
        }
    }

    // Lấy chi tiết một series theo ID
    async getSeriesById(id: number): Promise<any> {
        try {
            const series = await this.seriesRepository.findOne({
                where: { series_id: id },
                relations: ['seriesAuthors', 'seriesAuthors.author'],
            });

            if (!series) {
                return null;
            }

            // Lấy 10 chương mới nhất
            const latestChapters = await this.seriesRepository.manager
                .createQueryBuilder()
                .select('chapters')
                .from('chapters', 'chapters')
                .where('chapters.series_id = :seriesId', { seriesId: id })
                .orderBy('chapters.number', 'DESC')
                .limit(10)
                .getRawMany();

            // Đếm tổng số chapter
            const chapterCount = await this.seriesRepository.manager
                .createQueryBuilder()
                .select('COUNT(*)', 'count')
                .from('chapters', 'chapters')
                .where('chapters.series_id = :seriesId', { seriesId: id })
                .getRawOne();

            return {
                ...series,
                latestChapters: latestChapters.map(ch => ({
                    chapter_id: ch.chapters_chapter_id,
                    series_id: ch.chapters_series_id,
                    number: ch.chapters_number,
                    title: ch.chapters_title,
                    released_at: ch.chapters_released_at,
                    created_at: ch.chapters_created_at,
                    updated_at: ch.chapters_updated_at,
                })),
                totalChapters: parseInt(chapterCount?.count || '0'),
            };
        } catch (error) {
            console.error('Error fetching series by ID:', error);
            throw error;
        }
    }
}
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

    // Lấy danh sách series với phân trang và filter
    async getSeries(
        page: number = 1, 
        pageSize: number = 10,
        sortBy: 'latest' | 'popular' | 'created' = 'created'
    ): Promise<{
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

            // Bước 1: Lấy series IDs đã được sort với total_views
            const seriesIdsQuery = this.seriesRepository.manager
                .createQueryBuilder()
                .select('series.series_id', 'series_id')
                .addSelect('COALESCE(SUM(stats.count), 0)', 'total_views')
                .addSelect('MAX(chapters.updated_at)', 'latest_chapter_time')
                .from('series', 'series')
                .leftJoin('chapters', 'chapters', 'chapters.series_id = series.series_id')
                .leftJoin('chapter_view_stats_daily', 'stats', 'stats.chapter_id = chapters.chapter_id')
                .groupBy('series.series_id');

            // Áp dụng sort
            switch (sortBy) {
                case 'popular':
                    seriesIdsQuery.orderBy('total_views', 'DESC');
                    break;
                case 'latest':
                    seriesIdsQuery.orderBy('latest_chapter_time', 'DESC');
                    break;
                default:
                    seriesIdsQuery.orderBy('series.created_at', 'DESC');
            }

            seriesIdsQuery.offset(skip).limit(pageSize);
            const seriesIdsResult = await seriesIdsQuery.getRawMany();

            // Nếu không có series nào
            if (seriesIdsResult.length === 0) {
                return {
                    series: [],
                    total,
                    page,
                    limit: pageSize,
                    totalPages: Math.ceil(total / pageSize)
                };
            }

            // Bước 2: Lấy full data của các series đã filter
            const seriesIds = seriesIdsResult.map(r => r.series_id);
            const seriesList = await this.seriesRepository
                .createQueryBuilder('series')
                .leftJoinAndSelect('series.seriesAuthors', 'seriesAuthors')
                .leftJoinAndSelect('seriesAuthors.author', 'author')
                .where('series.series_id IN (:...ids)', { ids: seriesIds })
                .getMany();

            // Map total_views từ kết quả query đầu
            const viewsMap = new Map(
                seriesIdsResult.map(r => [r.series_id, Number(r.total_views || 0)])
            );

            // Sort lại theo thứ tự của seriesIdsResult
            const seriesListSorted = seriesIds
                .map(id => seriesList.find(s => s.series_id === id))
                .filter((s): s is Series => s !== undefined);

            // Map kết quả với total_views
            const seriesWithData = await Promise.all(
                seriesListSorted.map(async (series) => {
                    // Lấy 3 chương mới nhất
                    const latestChapters = await this.seriesRepository.manager
                        .createQueryBuilder()
                        .select('chapters.number', 'number')
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
                        total_views: viewsMap.get(series.series_id) || 0,
                        latestChapters: latestChapters.map(ch => ch.number),
                        totalChapters: parseInt(chapterCount?.count || '0'),
                    };
                })
            );

            return {
                series: seriesWithData,
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

            // Lấy tất cả chapters với views
            const allChapters = await this.seriesRepository.manager
                .createQueryBuilder()
                .select([
                    'chapters.chapter_id',
                    'chapters.number',
                    'chapters.title',
                    'COALESCE(SUM(stats.count), 0) as views'
                ])
                .from('chapters', 'chapters')
                .leftJoin('chapter_view_stats_daily', 'stats', 'stats.chapter_id = chapters.chapter_id')
                .where('chapters.series_id = :seriesId', { seriesId: id })
                .groupBy('chapters.chapter_id')
                .orderBy('chapters.number', 'DESC')
                .getRawMany();

            // Tính tổng views của series
            const totalViews = allChapters.reduce((sum, ch) => sum + Number(ch.views || 0), 0);

            // Lấy 10 chương mới nhất
            const latestChapters = allChapters.slice(0, 10);

            return {
                ...series,
                total_views: totalViews,
                latestChapters: latestChapters.map(ch => ({
                    chapter_id: ch.chapters_chapter_id,
                    number: ch.chapters_number,
                    title: ch.chapters_title,
                    views: Number(ch.views || 0),
                })),
                totalChapters: allChapters.length,
            };
        } catch (error) {
            console.error('Error fetching series by ID:', error);
            throw error;
        }
    }
}
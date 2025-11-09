import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { ChapterViewStatsDaily } from '../../entities/chapter-view-stats-daily.entity';
import { Chapters } from '../../entities/chapters.entity';

@Injectable()
export class ViewsService {
    constructor(
        @InjectRepository(ChapterViewStatsDaily)
        private viewStatsRepository: Repository<ChapterViewStatsDaily>,
        @InjectRepository(Chapters)
        private chaptersRepository: Repository<Chapters>,
    ) { }

    /**
     * Track view cho một chapter
     * Tự động tạo hoặc cập nhật record cho ngày hôm nay
     */
    async trackView(chapterId: number): Promise<{ success: boolean; count: number }> {
        // Kiểm tra chapter có tồn tại không
        const chapter = await this.chaptersRepository.findOne({
            where: { chapter_id: chapterId },
        });

        if (!chapter) {
            throw new NotFoundException(`Chapter with ID ${chapterId} not found`);
        }

        // Lấy ngày hiện tại (chỉ lấy date, không có time)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tìm hoặc tạo record cho hôm nay
        let viewStat = await this.viewStatsRepository.findOne({
            where: {
                chapter_id: chapterId,
                bucket_date: today,
            },
        });

        if (viewStat) {
            // Tăng count lên 1
            viewStat.count = Number(viewStat.count) + 1;
            await this.viewStatsRepository.save(viewStat);
        } else {
            // Tạo mới với count = 1
            viewStat = this.viewStatsRepository.create({
                chapter_id: chapterId,
                bucket_date: today,
                count: 1,
            });
            await this.viewStatsRepository.save(viewStat);
        }

        return {
            success: true,
            count: Number(viewStat.count),
        };
    }

    /**
     * Lấy tổng số views của một chapter (tất cả các ngày)
     */
    async getTotalViews(chapterId: number): Promise<number> {
        const result = await this.viewStatsRepository
            .createQueryBuilder('stats')
            .select('SUM(stats.count)', 'total')
            .where('stats.chapter_id = :chapterId', { chapterId })
            .getRawOne();

        return Number(result?.total || 0);
    }

    /**
     * Lấy views của chapter trong khoảng thời gian
     */
    async getViewsByDateRange(
        chapterId: number,
        startDate: Date,
        endDate: Date
    ): Promise<ChapterViewStatsDaily[]> {
        return this.viewStatsRepository.find({
            where: {
                chapter_id: chapterId,
                bucket_date: Between(startDate, endDate),
            },
            order: {
                bucket_date: 'DESC',
            },
        });
    }

    /**
     * Lấy views của chapter trong N ngày gần nhất
     */
    async getRecentViews(chapterId: number, days: number = 7): Promise<{
        total: number;
        daily: ChapterViewStatsDaily[];
    }> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const daily = await this.viewStatsRepository.find({
            where: {
                chapter_id: chapterId,
                bucket_date: MoreThanOrEqual(startDate),
            },
            order: {
                bucket_date: 'DESC',
            },
        });

        const total = daily.reduce((sum, stat) => sum + Number(stat.count), 0);

        return { total, daily };
    }

    /**
     * Lấy top chapters có nhiều views nhất
     */
    async getTopChapters(limit: number = 10, days?: number): Promise<any[]> {
        let query = this.viewStatsRepository
            .createQueryBuilder('stats')
            .leftJoinAndSelect('stats.chapter', 'chapter')
            .leftJoinAndSelect('chapter.series', 'series')
            .select([
                'stats.chapter_id',
                'SUM(stats.count) as total_views',
                'chapter',
                'series'
            ])
            .groupBy('stats.chapter_id')
            .addGroupBy('chapter.chapter_id')
            .addGroupBy('series.series_id')
            .orderBy('total_views', 'DESC')
            .limit(limit);

        // Nếu có filter theo số ngày
        if (days) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);
            query = query.where('stats.bucket_date >= :startDate', { startDate });
        }

        const results = await query.getRawMany();

        return results.map(r => ({
            chapter_id: r.stats_chapter_id,
            total_views: Number(r.total_views),
            chapter: {
                chapter_id: r.chapter_chapter_id,
                title: r.chapter_title,
                number: r.chapter_number,
                series: {
                    series_id: r.series_series_id,
                    name: r.series_name,
                    cover_url: r.series_cover_url,
                }
            }
        }));
    }

}

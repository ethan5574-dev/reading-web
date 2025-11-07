import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapters } from '../../entities/chapters.entity';

@Injectable()
export class ChaptersService {
    constructor(
        @InjectRepository(Chapters)
        private chaptersRepository: Repository<Chapters>,
    ) { }

    // Lấy tất cả chapters của một series
    async getChaptersBySeries(seriesId: number, page: number = 1, limit: number = 50): Promise<{
        chapters: Chapters[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;

        const [chapters, total] = await this.chaptersRepository.findAndCount({
            where: { series_id: seriesId },
            order: { number: 'DESC' },
            skip,
            take: limit,
        });

        return {
            chapters,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Lấy chi tiết một chapter
    async getChapterById(chapterId: number): Promise<Chapters> {

        const chapter = await this.chaptersRepository.findOne({
            where: { chapter_id: chapterId },
            relations: ['series'],
        });

        if (!chapter) {
            throw new Error('Chapter not found');
        }

        return chapter;
    }
    // Lấy chapter theo series_id và chapter number (với next/previous)
    async getChapterByNumber(seriesId: number, chapterNumber: number): Promise<any> {
        const chapter = await this.chaptersRepository.findOne({ 
            where: { series_id: seriesId, number: chapterNumber },
            relations: ['series'],
        });

        if (!chapter) {
            throw new Error('Chapter not found');
        }

        // Lấy chapter trước (số nhỏ hơn gần nhất)
        const previousChapter = await this.chaptersRepository
            .createQueryBuilder('chapters')
            .where('chapters.series_id = :seriesId', { seriesId })
            .andWhere('chapters.number < :currentNumber', { currentNumber: chapterNumber })
            .orderBy('chapters.number', 'DESC')
            .limit(1)
            .getOne();

        // Lấy chapter sau (số lớn hơn gần nhất)
        const nextChapter = await this.chaptersRepository
            .createQueryBuilder('chapters')
            .where('chapters.series_id = :seriesId', { seriesId })
            .andWhere('chapters.number > :currentNumber', { currentNumber: chapterNumber })
            .orderBy('chapters.number', 'ASC')
            .limit(1)
            .getOne();

        return {
            ...chapter,
            previousChapter: previousChapter ? {
                chapter_id: previousChapter.chapter_id,
                number: previousChapter.number,
                title: previousChapter.title,
            } : null,
            nextChapter: nextChapter ? {
                chapter_id: nextChapter.chapter_id,
                number: nextChapter.number,
                title: nextChapter.title,
            } : null,
        };
    }

    // Lấy chapter trước/sau (để navigation)
    async getAdjacentChapters(seriesId: number, currentNumber: number): Promise<{
        previous: Chapters | null;
        next: Chapters | null;
    }> {
        const previous = await this.chaptersRepository.findOne({
            where: { series_id: seriesId },
            order: { number: 'DESC' },
        });

        const next = await this.chaptersRepository.findOne({
            where: { series_id: seriesId },
            order: { number: 'ASC' },
        });

        return { previous, next };
    }
}

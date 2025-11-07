import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChaptersService } from './chapters.service';

@Controller('chapters')
export class ChaptersController {
    constructor(private readonly chaptersService: ChaptersService) { }

    // GET /chapters/series/:seriesId - Lấy tất cả chapters của series
    @Get('series/:seriesId')
    async getChaptersBySeries(
        @Param('seriesId') seriesId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '50',
    ) {
        return this.chaptersService.getChaptersBySeries(
            parseInt(seriesId),
            parseInt(page),
            parseInt(limit),
        );
    }

    // GET /chapters/:id - Lấy chi tiết chapter
    @Get(':id')
    async getChapterById(@Param('id') id: string) {
        return this.chaptersService.getChapterById(parseInt(id));
    }

    // GET /chapters/series/:seriesId/number/:number - Lấy chapter theo số
    @Get('series/:seriesId/number/:number')
    async getChapterByNumber(
        @Param('seriesId') seriesId: string,
        @Param('number') number: string,
    ) {
        return this.chaptersService.getChapterByNumber(
            parseInt(seriesId),
            parseFloat(number),
        );
    }

    // GET /chapters/series/:seriesId/adjacent/:number - Lấy chapter trước/sau
    @Get('series/:seriesId/adjacent/:number')
    async getAdjacentChapters(
        @Param('seriesId') seriesId: string,
        @Param('number') number: string,
    ) {
        return this.chaptersService.getAdjacentChapters(
            parseInt(seriesId),
            parseFloat(number),
        );
    }
}

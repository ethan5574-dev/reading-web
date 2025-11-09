import { Controller, Post, Get, Param, Query, Body } from '@nestjs/common';
import { ViewsService } from './views.service';

@Controller('views')
export class ViewsController {
    constructor(private readonly viewsService: ViewsService) { }

    /**
     * POST /views/track
     * Track view cho một chapter
     * Body: { chapterId: number }
     */
    @Post('track')
    async trackView(@Body('chapterId') chapterId: number) {
        return this.viewsService.trackView(chapterId);
    }

    /**
     * GET /views/chapter/:chapterId/total
     * Lấy tổng số views của chapter (all time)
     */
    @Get('chapter/:chapterId/total')
    async getTotalViews(@Param('chapterId') chapterId: string) {
        const total = await this.viewsService.getTotalViews(parseInt(chapterId));
        return { chapter_id: parseInt(chapterId), total_views: total };
    }

    /**
     * GET /views/chapter/:chapterId/recent?days=7
     * Lấy views của chapter trong N ngày gần nhất
     */
    @Get('chapter/:chapterId/recent')
    async getRecentViews(
        @Param('chapterId') chapterId: string,
        @Query('days') days: string = '7',
    ) {
        return this.viewsService.getRecentViews(
            parseInt(chapterId),
            parseInt(days)
        );
    }

    /**
     * GET /views/chapter/:chapterId/range?start=2024-01-01&end=2024-12-31
     * Lấy views trong khoảng thời gian cụ thể
     */
    @Get('chapter/:chapterId/range')
    async getViewsByDateRange(
        @Param('chapterId') chapterId: string,
        @Query('start') startDate: string,
        @Query('end') endDate: string,
    ) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const stats = await this.viewsService.getViewsByDateRange(
            parseInt(chapterId),
            start,
            end
        );

        return {
            chapter_id: parseInt(chapterId),
            start_date: start,
            end_date: end,
            stats,
        };
    }

    /**
     * GET /views/top?limit=10&days=30
     * Lấy top chapters có nhiều views nhất
     */
    @Get('top')
    async getTopChapters(
        @Query('limit') limit: string = '10',
        @Query('days') days?: string,
    ) {
        return this.viewsService.getTopChapters(
            parseInt(limit),
            days ? parseInt(days) : undefined
        );
    }

}

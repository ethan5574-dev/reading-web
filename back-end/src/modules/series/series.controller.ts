import { Controller, Get, Param, Query } from '@nestjs/common';
import { SeriesService } from './series.service';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  async getSeries(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.seriesService.getSeries(parseInt(page), parseInt(limit));
  }

  @Get(':id')
  async getSeriesById(@Param('id') id: string) {
    return this.seriesService.getSeriesById(parseInt(id));
  }
}
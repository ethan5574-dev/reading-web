import { Controller, Get, Param, Query } from '@nestjs/common';
import { SeriesService } from './series.service';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  async getSeries(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sortBy') sortBy: 'latest' | 'popular' | 'created' = 'created',
  ) {
    return this.seriesService.getSeries(parseInt(page), parseInt(limit), sortBy);
  }

  @Get(':id')
  async getSeriesById(@Param('id') id: string) {
    return this.seriesService.getSeriesById(parseInt(id));
  }
}
"""
Data models for the crawler system
"""
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime


@dataclass
class SeriesInfo:
    """Information about a manga series"""
    title: str
    cover_image: str
    series_url: str
    alt_text: Optional[str] = None
    title_text: Optional[str] = None
    created_at: Optional[datetime] = None


@dataclass
class ChapterInfo:
    """Information about a chapter"""
    chapter_number: str
    chapter_url: str
    series_title: str
    created_at: Optional[datetime] = None


@dataclass
class ImageInfo:
    """Information about an image"""
    image_url: str
    page_number: int
    chapter_number: str
    series_title: str
    alt_text: Optional[str] = None
    created_at: Optional[datetime] = None


@dataclass
class CrawlResult:
    """Result of a crawl operation"""
    success: bool
    data: List[dict]
    error_message: Optional[str] = None
    crawled_at: Optional[datetime] = None
    url: Optional[str] = None


@dataclass
class CrawlConfig:
    """Configuration for crawling"""
    base_url: str
    user_agent: str
    timeout: int
    delay_between_requests: float
    max_retries: int
    cache_enabled: bool
    output_format: str  # 'json', 'csv', 'both'

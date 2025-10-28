"""
Configuration settings for the crawler
"""
import os
from dataclasses import dataclass
from typing import List


@dataclass
class CrawlerSettings:
    """Main settings for the crawler system"""
    
    # Target website
    BASE_URL: str = "https://truyenqqgo.com/"
    
    # HTTP settings
    USER_AGENT: str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    TIMEOUT: int = 20
    DELAY_BETWEEN_REQUESTS: float = 1.0
    MAX_RETRIES: int = 3
    
    # Caching
    CACHE_ENABLED: bool = False
    CACHE_DIR: str = "data/cache"  # Không dùng khi CACHE_ENABLED=False
    
    # Output
    OUTPUT_DIR: str = "data/output"
    OUTPUT_FORMAT: str = "json"  # 'json', 'csv', 'both'
    
    # S3 Configuration
    S3_ENABLED: bool = True  # Set to True to enable S3 upload
    S3_BUCKET: str = ""  # Will be read from env S3_BUCKET
    AWS_REGION: str = "us-east-1"  # Will be read from env AWS_REGION
    
    # Database Configuration
    DATABASE_ENABLED: bool = True  # Set to True to enable database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+pymysql://user:password@localhost:3306/manga_db")
    
    # Logging
    LOG_LEVEL: str = "INFO"  # Dùng cho console logging
    LOG_DIR: str = "data/logs"  # Không bắt buộc nếu chỉ log ra console
    
    # Selectors for different levels
    SERIES_SELECTORS: dict = None
    CHAPTER_SELECTORS: dict = None
    IMAGE_SELECTORS: dict = None
    
    def __post_init__(self):
        """Initialize default selectors"""
        if self.SERIES_SELECTORS is None:
            self.SERIES_SELECTORS = {
                "container": "div.book_avatar",
                "image": "img",
                "link": "a",
                "image_attrs": ["src", "data-src", "data-original", "data-lazy-src", "data-actualsrc"]
            }
        
        if self.CHAPTER_SELECTORS is None:
            self.CHAPTER_SELECTORS = {
                "container": "div.works-chapter-list",
                "item": "div.works-chapter-item",
                "link": "a",
                "title": "a"
            }
        
        if self.IMAGE_SELECTORS is None:
            self.IMAGE_SELECTORS = {
                "container": "div.page-chapter",
                "image": "img",
                "image_attrs": ["src", "data-src", "data-original", "data-lazy-src", "data-actualsrc"]
            }
    
    def create_directories(self):
        """Create necessary directories"""
        directories = [
            self.OUTPUT_DIR
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)


# Global settings instance
settings = CrawlerSettings()

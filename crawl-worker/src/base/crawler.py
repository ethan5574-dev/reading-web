"""
Base crawler class with common functionality
"""
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from .data_models import CrawlConfig, CrawlResult
from .http_client import HTTPClient


class BaseCrawler(ABC):
    """Base class for all crawlers"""
    
    def __init__(self, config: CrawlConfig):
        self.config = config
        self.http_client = HTTPClient(config)
        self.logger = self._setup_logger()
    
    def _setup_logger(self) -> logging.Logger:
        """Setup logger for this crawler"""
        logger = logging.getLogger(self.__class__.__name__)
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def canonical_url(self, url: str) -> str:
        """Clean URL by removing fragments and whitespace"""
        return url.split("#")[0].strip()
    
    def is_http_url(self, url: str) -> bool:
        """Check if URL is HTTP/HTTPS"""
        try:
            scheme = urlparse(url).scheme
            return scheme in ("http", "https")
        except Exception:
            return False
    
    def make_absolute_url(self, base_url: str, relative_url: str) -> str:
        """Convert relative URL to absolute URL"""
        return urljoin(base_url, relative_url)
    
    def parse_html(self, html: str) -> BeautifulSoup:
        """Parse HTML content"""
        return BeautifulSoup(html, "lxml")
    
    def safe_get_attribute(self, element, attribute: str, default: str = None) -> str:
        """Safely get attribute from element"""
        if element and element.has_attr(attribute):
            return element.get(attribute, default)
        return default
    
    def extract_image_url(self, img_element, attrs: List[str]) -> str:
        """Extract image URL from img element with priority order"""
        for attr in attrs:
            url = self.safe_get_attribute(img_element, attr)
            if url:
                return url
        
        # Fallback to src
        return self.safe_get_attribute(img_element, "src", "")
    
    @abstractmethod
    def crawl(self, url: str) -> CrawlResult:
        """Main crawl method - must be implemented by subclasses"""
        pass
    
    def close(self):
        """Clean up resources"""
        self.http_client.close()

"""
Level 1: Crawl series list from homepage
"""
from typing import List
from datetime import datetime
from bs4 import BeautifulSoup
from ..base.crawler import BaseCrawler
from ..base.data_models import CrawlConfig, CrawlResult, SeriesInfo


class SeriesCrawler(BaseCrawler):
    """Crawler for series list (Level 1)"""
    
    def __init__(self, config: CrawlConfig):
        super().__init__(config)
        self.series_list = []
    
    def crawl(self, url: str) -> CrawlResult:
        """
        Crawl series list from homepage
        
        Args:
            url: Homepage URL
            
        Returns:
            CrawlResult with list of SeriesInfo
        """
        try:
            self.logger.info(f"Starting series crawl from: {url}")
            
            # Fetch HTML
            html, final_url = self.http_client.fetch_html(url)
            soup = self.parse_html(html)
            
            # Extract series information
            series_data = self._extract_series(soup, final_url)
            
            self.logger.info(f"Found {len(series_data)} series")
            
            return CrawlResult(
                success=True,
                data=series_data,
                crawled_at=datetime.now(),
                url=url
            )
            
        except Exception as e:
            self.logger.error(f"Series crawl failed: {str(e)}")
            return CrawlResult(
                success=False,
                data=[],
                error_message=str(e),
                crawled_at=datetime.now(),
                url=url
            )
    
    def _extract_series(self, soup: BeautifulSoup, base_url: str) -> List[dict]:
        """Extract series information from HTML"""
        series_data = []
        
        # Find all series containers
        series_containers = soup.select("div.book_avatar")
        
        self.logger.info(f"Found {len(series_containers)} series containers")
        
        for i, container in enumerate(series_containers):
            try:
                series_info = self._extract_single_series(container, base_url, i + 1)
                if series_info:
                    series_data.append(series_info)
            except Exception as e:
                self.logger.warning(f"Failed to extract series {i + 1}: {str(e)}")
                continue
        
        return series_data
    
    def _extract_single_series(self, container, base_url: str, index: int) -> dict:
        """Extract information from a single series container"""
        # Find image element
        img_element = container.find("img")
        if not img_element:
            self.logger.warning(f"Series {index}: No image found")
            return None
        
        # Extract image URL
        image_attrs = ["src", "data-src", "data-original", "data-lazy-src", "data-actualsrc"]
        image_url = self.extract_image_url(img_element, image_attrs)
        
        if not image_url:
            self.logger.warning(f"Series {index}: No valid image URL found")
            return None
        
        # Convert to absolute URL
        abs_image_url = self.make_absolute_url(base_url, image_url)
        if not self.is_http_url(abs_image_url):
            self.logger.warning(f"Series {index}: Invalid image URL: {abs_image_url}")
            return None
        
        # Find link element
        link_element = img_element.find_parent("a")
        if not link_element:
            self.logger.warning(f"Series {index}: No link found")
            return None
        
        # Extract link URL
        link_url = self.safe_get_attribute(link_element, "href")
        if not link_url:
            self.logger.warning(f"Series {index}: No href found in link")
            return None
        
        # Convert to absolute URL
        abs_link_url = self.make_absolute_url(base_url, link_url)
        if not self.is_http_url(abs_link_url):
            self.logger.warning(f"Series {index}: Invalid link URL: {abs_link_url}")
            return None
        
        # Extract metadata
        alt_text = self.safe_get_attribute(img_element, "alt", "")
        title_text = self.safe_get_attribute(img_element, "title", "")
        
        # Try to extract title from link text or other elements
        series_title = self._extract_series_title(container, alt_text, title_text)
        
        return {
            "index": index,
            "title": series_title,
            "cover_image": self.canonical_url(abs_image_url),
            "series_url": self.canonical_url(abs_link_url),
            "alt_text": alt_text,
            "title_text": title_text,
            "crawled_at": datetime.now().isoformat()
        }
    
    def _extract_series_title(self, container, alt_text: str, title_text: str) -> str:
        """Extract series title from various sources"""
        # Try different methods to get title
        title_sources = [
            alt_text,
            title_text,
            self.safe_get_attribute(container.find("a"), "title", ""),
            self.safe_get_attribute(container.find("h3"), "text", ""),
            self.safe_get_attribute(container.find("h4"), "text", ""),
        ]
        
        for title in title_sources:
            if title and title.strip():
                return title.strip()
        
        return "Unknown Series"
